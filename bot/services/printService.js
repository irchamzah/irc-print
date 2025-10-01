// bot/services/printService.js - VERSI URUTAN PRINT
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

  // METODE UTAMA: Structured print process dengan urutan
  async structuredPrintProcess(filePath, settings, printerName) {
    let tempFiles = [];

    try {
      const copies = settings.copies || 1;
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

      // STEP 1: Buat urutan print berdasarkan nomor halaman
      console.log("📑 STEP 1: Creating print order by page number...");

      const printOrder = this.createPrintOrder(bwPages, colorPages);
      console.log("🔄 Print Order:", printOrder);

      // STEP 2: Process setiap group dalam urutan
      console.log("🔄 STEP 2: Processing print groups in order...");

      let printResults = [];
      let groupFiles = [];

      for (const group of printOrder) {
        console.log(
          `📄 Processing group: ${group.type} pages ${group.pages.join(",")}`
        );

        const groupResult = await this.processPrintGroup(
          filePath,
          group.pages,
          group.type,
          printerName,
          copies
        );

        if (groupResult.tempFiles) {
          groupFiles.push(...groupResult.tempFiles);
        }
        printResults.push(groupResult);

        // Tunggu antara groups
        if (group !== printOrder[printOrder.length - 1]) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // STEP 3: Cleanup temporary files
      console.log("🧹 STEP 3: Cleaning up temporary files...");
      await this.cleanupTempFiles(groupFiles);

      const allSuccess = printResults.every((result) => result.success);

      if (allSuccess) {
        return {
          success: true,
          jobId: `ordered_${Date.now()}`,
          method: "Ordered PDFTK + Ghostscript",
          output: `Printed in order: ${printOrder
            .map((g) => `${g.type}(${g.pages.join(",")})`)
            .join(" → ")}`,
          details: {
            printOrder: printOrder,
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

  // METHOD: Buat urutan print dari halaman TERAKHIR ke PERTAMA
  createPrintOrder(bwPages, colorPages) {
    // Gabungkan semua halaman dan urutkan dari BESAR ke KECIL (reverse order)
    const allPages = [...bwPages, ...colorPages].sort((a, b) => b - a); // b - a untuk descending

    const printOrder = [];
    let currentGroup = null;

    for (const page of allPages) {
      const pageType = bwPages.includes(page) ? "bw" : "color";

      if (!currentGroup || currentGroup.type !== pageType) {
        // Mulai group baru
        if (currentGroup) {
          printOrder.push(currentGroup);
        }
        currentGroup = {
          type: pageType,
          pages: [page],
        };
      } else {
        // Tambahkan ke group yang sama (tetap urut descending)
        currentGroup.pages.push(page);
        // Urutkan pages dalam group juga descending
        currentGroup.pages.sort((a, b) => b - a);
      }
    }

    // Push group terakhir
    if (currentGroup) {
      printOrder.push(currentGroup);
    }

    console.log("🔄 Reverse Print Order:", printOrder);
    return printOrder;
  }

  // PROCESS PRINT GROUP: Process satu group halaman (bw atau color)
  async processPrintGroup(inputPath, pages, type, printerName, copies) {
    try {
      console.log(`🔄 Processing ${type} group: pages ${pages.join(",")}`);

      // STEP 1: Extract pages dengan PDFTK
      const extractResult = await this.extractPagesWithPDFTK(
        inputPath,
        pages,
        type
      );

      if (!extractResult.success) {
        throw new Error(`Extraction failed: ${extractResult.error}`);
      }

      const extractedFile = extractResult.outputPath;
      console.log(`✅ Extracted ${type} pages: ${extractedFile}`);

      // STEP 2: Convert ke grayscale jika BW
      let finalFile = extractedFile;

      if (type === "bw") {
        console.log(`🎨 Converting to grayscale...`);
        const convertResult = await this.convertToGrayscale(extractedFile);

        if (!convertResult.success) {
          throw new Error(
            `Grayscale conversion failed: ${convertResult.error}`
          );
        }

        finalFile = convertResult.outputPath;
        console.log(`✅ Grayscale conversion completed: ${finalFile}`);
      }

      // STEP 3: Print file
      console.log(`🖨️ Printing ${type} pages: ${pages.join(",")}`);
      const printResult = await this.directPrint(
        finalFile,
        printerName,
        copies
      );

      return {
        success: printResult.success,
        type: type,
        pages: pages,
        copies: copies,
        tempFiles: type === "bw" ? [extractedFile, finalFile] : [extractedFile],
        output: printResult.output,
        error: printResult.error,
      };
    } catch (error) {
      console.error(`❌ ${type} group processing failed:`, error);
      return {
        success: false,
        type: type,
        pages: pages,
        error: error.message,
      };
    }
  }

  // EXTRACT PAGES: Extract halaman dengan PDFTK
  async extractPagesWithPDFTK(inputPath, pages, type) {
    try {
      const baseName = path.basename(inputPath, ".pdf");
      const outputPath = path.join(
        this.tempDir,
        `${baseName}-${type}-${pages.join("_")}.pdf`
      );

      const pagesStr = pages.join(" ");
      const command = `"${this.pdftkPath}" "${inputPath}" cat ${pagesStr} output "${outputPath}"`;

      console.log(`🔧 PDFTK ${type} Command:`, command);
      await execPromise(command, { timeout: 30000 });

      if (await this.fileExists(outputPath)) {
        const stats = await fs.stat(outputPath);
        console.log(
          `✅ ${type} extraction successful: ${outputPath} (${stats.size} bytes)`
        );

        return {
          success: true,
          outputPath: outputPath,
          fileSize: stats.size,
          pages: pages.length,
        };
      } else {
        throw new Error("Extraction failed - no output file created");
      }
    } catch (error) {
      console.error("❌ PDFTK extraction failed:", error);
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
      const outputPath = path.join(this.tempDir, `${baseName}-grayscale.pdf`);

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
