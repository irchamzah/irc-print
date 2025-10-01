// bot/services/printService.js - VERSI DIPERBAIKI
const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

class PrintService {
  constructor() {
    this.printLogPath = path.join(
      process.cwd(),
      "storage",
      "logs",
      "print-jobs.log"
    );
    this.printerName = "EPSON L3150 Series";
    this.ghostscriptPath =
      "C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe";
    this.pdftkPath = "C:\\Program Files (x86)\\PDFtk Server\\bin\\pdftk.exe";
    this.tempDir = path.join(process.cwd(), "storage", "temp");
  }

  async getPrinterName() {
    return this.printerName;
  }

  async processPrint(userSession) {
    try {
      const printerName = await this.getPrinterName();
      const { fileInfo, settings, userId } = userSession;

      console.log("🖨️ Starting structured print process:", {
        file: fileInfo.fileName,
        printer: printerName,
        settings: settings,
        userId: userId,
      });

      if (!fileInfo.localPath || !(await this.fileExists(fileInfo.localPath))) {
        throw new Error("File tidak ditemukan untuk printing");
      }

      await this.ensureTempDirectory();

      const printResult = await this.structuredPrintProcess(
        fileInfo.localPath,
        settings,
        printerName
      );

      if (!printResult.success) {
        throw new Error(printResult.error);
      }

      await this.logPrintJob(userSession, printResult.jobId, printerName);

      return {
        success: true,
        message: "Printing completed successfully",
        printTime: new Date().toISOString(),
        filePath: fileInfo.localPath,
        settings: settings,
        jobId: printResult.jobId,
        printer: printerName,
      };
    } catch (error) {
      console.error("❌ Print service error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // METODE UTAMA: Structured print process
  async structuredPrintProcess(filePath, settings, printerName) {
    let tempFiles = []; // Deklarasi di sini agar bisa di-cleanup

    try {
      const copies = settings.copies || 1;

      // FIX: Gunakan property yang benar dari settings
      const colorPages = Array.isArray(settings.colorPages)
        ? settings.colorPages
        : [];
      const bwPages = Array.isArray(settings.bwPages) ? settings.bwPages : [];

      console.log("📋 Print Settings:", {
        copies: copies,
        colorPages: colorPages,
        bwPages: bwPages,
        printer: printerName,
      });

      // Jika tidak ada setting khusus, print semua halaman normal
      if (colorPages.length === 0 && bwPages.length === 0) {
        console.log("🔄 No color/bw settings, printing all pages normally");
        return await this.directPrint(filePath, printerName, copies);
      }

      // STEP 1: Split file dengan PDFTK berdasarkan halaman BW dan Color
      console.log("📑 STEP 1: Splitting PDF with PDFTK...");

      const splitResult = await this.splitPDFWithPDFTK(
        filePath,
        bwPages,
        colorPages
      );

      if (!splitResult.success) {
        throw new Error(`PDF splitting failed: ${splitResult.error}`);
      }

      const { bwFile, colorFile } = splitResult;

      // Hanya push file yang berhasil dibuat
      if (bwFile) tempFiles.push(bwFile);
      if (colorFile) tempFiles.push(colorFile);

      console.log("✅ PDF Splitting completed:");
      if (bwFile) console.log(`   - BW File: ${bwFile}`);
      if (colorFile) console.log(`   - Color File: ${colorFile}`);

      // STEP 2: Convert BW file ke grayscale dengan Ghostscript
      let finalBWFile = bwFile;

      if (bwPages.length > 0 && bwFile) {
        console.log("🎨 STEP 2: Converting BW file to grayscale...");

        const convertResult = await this.convertToGrayscale(bwFile);

        if (!convertResult.success) {
          throw new Error(
            `Grayscale conversion failed: ${convertResult.error}`
          );
        }

        finalBWFile = convertResult.outputPath;
        tempFiles.push(finalBWFile);
        console.log(`✅ Grayscale conversion completed: ${finalBWFile}`);
      }

      // STEP 3: Print files
      console.log("🖨️ STEP 3: Printing files...");

      let printResults = [];

      // Print BW file (grayscale)
      if (bwPages.length > 0 && finalBWFile) {
        console.log(`⚫ Printing BW pages: ${bwPages.join(",")}`);
        const bwPrintResult = await this.directPrint(
          finalBWFile,
          printerName,
          copies
        );
        printResults.push({ type: "bw", ...bwPrintResult });

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Print Color file
      if (colorPages.length > 0 && colorFile) {
        console.log(`🎨 Printing Color pages: ${colorPages.join(",")}`);
        const colorPrintResult = await this.directPrint(
          colorFile,
          printerName,
          copies
        );
        printResults.push({ type: "color", ...colorPrintResult });
      }

      // STEP 4: Cleanup temporary files
      console.log("🧹 STEP 4: Cleaning up temporary files...");
      await this.cleanupTempFiles(tempFiles);
      const allSuccess = printResults.every((result) => result.success);

      if (allSuccess) {
        return {
          success: true,

          jobId: `structured_${Date.now()}`,
          method: "Structured PDFTK + Ghostscript",
          output: `Printed ${bwPages.length} BW pages and ${colorPages.length} color pages`,
          details: {
            splitFiles: { bw: bwFile, color: colorFile },
            finalFiles: { bw: finalBWFile, color: colorFile },
            printResults: printResults,
          },
        };
      } else {
        throw new Error("Some print jobs failed");
      }
    } catch (error) {
      console.error("❌ Structured print process failed:", error);

      try {
        await this.cleanupTempFiles(tempFiles);
      } catch (cleanupError) {
        console.warn("⚠️ Cleanup failed:", cleanupError.message);
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // SPLIT PDF: Split PDF dengan PDFTK menjadi BW dan Color files
  async splitPDFWithPDFTK(inputPath, bwPages, colorPages) {
    try {
      const baseName = path.basename(inputPath, ".pdf");
      const bwOutputPath = path.join(this.tempDir, `${baseName}-gray.pdf`);
      const colorOutputPath = path.join(this.tempDir, `${baseName}-color.pdf`);

      console.log(`📑 Splitting PDF: ${path.basename(inputPath)}`);
      console.log(
        `   - BW Pages: ${bwPages.length > 0 ? bwPages.join(",") : "none"}`
      );
      console.log(
        `   - Color Pages: ${
          colorPages.length > 0 ? colorPages.join(",") : "none"
        }`
      );

      let bwFileCreated = false;
      let colorFileCreated = false;

      // Split BW pages
      if (bwPages.length > 0) {
        const bwPagesStr = bwPages.join(" ");
        const bwCommand = `"${this.pdftkPath}" "${inputPath}" cat ${bwPagesStr} output "${bwOutputPath}"`;

        console.log(`🔧 PDFTK BW Command:`, bwCommand);
        await execPromise(bwCommand, { timeout: 30000 });

        if (await this.fileExists(bwOutputPath)) {
          const stats = await fs.stat(bwOutputPath);
          console.log(
            `✅ BW file created: ${bwOutputPath} (${stats.size} bytes)`
          );
          bwFileCreated = true;
        } else {
          console.warn("⚠️ BW file not created after PDFTK command");
        }
      }

      // Split Color pages
      if (colorPages.length > 0) {
        const colorPagesStr = colorPages.join(" ");
        const colorCommand = `"${this.pdftkPath}" "${inputPath}" cat ${colorPagesStr} output "${colorOutputPath}"`;

        console.log(`🔧 PDFTK Color Command:`, colorCommand);
        await execPromise(colorCommand, { timeout: 30000 });

        if (await this.fileExists(colorOutputPath)) {
          const stats = await fs.stat(colorOutputPath);
          console.log(
            `✅ Color file created: ${colorOutputPath} (${stats.size} bytes)`
          );
          colorFileCreated = true;
        } else {
          console.warn("⚠️ Color file not created after PDFTK command");
        }
      }

      return {
        success: true,
        bwFile: bwFileCreated ? bwOutputPath : null,
        colorFile: colorFileCreated ? colorOutputPath : null,
        bwPages: bwPages,
        colorPages: colorPages,
      };
    } catch (error) {
      console.error("❌ PDFTK splitting failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // CONVERT TO GRAYSCALE: Convert PDF ke grayscale dengan Ghostscript
  async convertToGrayscale(inputPath) {
    try {
      const baseName = path.basename(inputPath, ".pdf");

      const outputPath = path.join(this.tempDir, `${baseName}-converted.pdf`);

      // Gunakan parameter yang proven bekerja untuk grayscale
      const gsCommand =
        `"${this.ghostscriptPath}" -dNOPAUSE -dBATCH -sDEVICE=pdfwrite ` +
        `-sColorConversionStrategy=Gray ` +
        `-dProcessColorModel=/DeviceGray ` +
        `-dCompatibilityLevel=1.4 ` +
        `-dPDFSETTINGS=/prepress ` +
        `-dNOPAUSE ` +
        `-dBATCH ` +
        `-dQUIET ` +
        `-sOutputFile="${outputPath}" ` +
        `"${inputPath}"`;

      console.log(`🔧 Ghostscript Grayscale Command:`, gsCommand);

      const { stdout, stderr } = await execPromise(gsCommand, {
        timeout: 60000,
      });

      if (stdout) console.log("✅ Conversion stdout:", stdout);
      if (stderr) console.warn("⚠️ Conversion stderr:", stderr);

      if (await this.fileExists(outputPath)) {
        const stats = await fs.stat(outputPath);
        console.log(
          `✅ Grayscale conversion successful: ${outputPath} (${stats.size} bytes)`
        );

        return {
          success: true,
          outputPath: outputPath,
          fileSize: stats.size,

          command: gsCommand,
        };
      } else {
        throw new Error("Grayscale conversion failed - no output file created");
      }
    } catch (error) {
      console.error("❌ Grayscale conversion failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // DIRECT PRINT: Print PDF file
  async directPrint(filePath, printerName, copies) {
    try {
      console.log(
        `🖨️ Printing: ${path.basename(filePath)} with ${copies} copies`
      );

      for (let copy = 1; copy <= copies; copy++) {
        console.log(`   Copy ${copy} of ${copies}`);

        const gsCommand = `"${this.ghostscriptPath}" -dNOPAUSE -dBATCH -sDEVICE=mswinpr2 -sOutputFile="%printer%${printerName}" -f "${filePath}"`;

        const { stdout, stderr } = await execPromise(gsCommand, {
          timeout: 30000,
        });

        if (stdout) console.log("   Print stdout:", stdout);
        if (stderr) console.warn("   Print stderr:", stderr);

        if (copy < copies) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      return {
        success: true,
        output: `Printed ${copies} copies successfully`,
      };
    } catch (error) {
      console.error("❌ Print failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // UTILITY: Buat temp directory
  async ensureTempDirectory() {
    try {
      await fs.access(this.tempDir);
    } catch (error) {
      await fs.mkdir(this.tempDir, { recursive: true });
      console.log("✅ Temp directory created:", this.tempDir);
    }
  }

  // UTILITY: Cleanup temporary files
  async cleanupTempFiles(filePaths) {
    try {
      for (const filePath of filePaths) {
        if (filePath && (await this.fileExists(filePath))) {
          await fs.unlink(filePath);
          console.log(`🗑️ Cleaned up: ${path.basename(filePath)}`);
        }
      }
    } catch (error) {
      console.warn("⚠️ Error cleaning up temp files:", error.message);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async logPrintJob(userSession, jobId, printerName) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        userId: userSession.userId || "unknown",
        orderId: userSession.paymentInfo.orderId,
        fileName: userSession.fileInfo.fileName,
        filePath: userSession.fileInfo.localPath,
        settings: userSession.settings,
        cost: userSession.cost,
        jobId: jobId,
        printer: printerName,
        status: "completed",
      };

      const logLine = JSON.stringify(logEntry) + "\n";
      await fs.appendFile(this.printLogPath, logLine);

      console.log("📋 Print job logged:", logEntry);
    } catch (error) {
      console.error("❌ Error logging print job:", error);
    }
  }
}

module.exports = new PrintService();
