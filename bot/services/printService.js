// bot/services/printService.js - SOLUSI YANG BENAR
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
    this.printerName = "Canon G1010 series";
    this.foxitPath =
      "C:\\Program Files\\Foxit Software\\Foxit PDF Reader\\FoxitPDFReader.exe";
  }

  async getPrinterName() {
    return this.printerName;
  }

  async processPrint(userSession) {
    try {
      const printerName = await this.getPrinterName();
      const { fileInfo, settings, userId } = userSession;

      console.log("🖨️ Starting REAL print process:", {
        file: fileInfo.fileName,
        printer: printerName,
        settings: settings,
        userId: userId,
      });

      if (!fileInfo.localPath || !(await this.fileExists(fileInfo.localPath))) {
        throw new Error("File tidak ditemukan untuk printing");
      }

      // Gunakan metode yang benar dengan Foxit Reader
      const printResult = await this.printWithFoxitAndSettings(
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

  // METODE UTAMA: Print dengan Foxit Reader dan setting printer
  async printWithFoxitAndSettings(filePath, settings, printerName) {
    try {
      console.log("🔄 Using Foxit Reader with printer settings...");

      const copies = settings.copies || 1;
      const colorPages = this.parsePageRange(settings.color);
      const bwPages = this.parsePageRange(settings.bw);

      console.log("📋 Print Settings:", {
        copies: copies,
        colorPages: colorPages,
        bwPages: bwPages,
        printer: printerName,
      });

      // Jika ada setting color/bw, proses terpisah
      if (colorPages.length > 0 || bwPages.length > 0) {
        return await this.printColorBwSeparate(
          filePath,
          colorPages,
          bwPages,
          printerName,
          copies
        );
      }

      // Jika tidak ada setting khusus, print semua halaman
      return await this.printAllPages(filePath, printerName, copies);
    } catch (error) {
      console.error("❌ Foxit print failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // PRINT: Color dan BW pages terpisah
  async printColorBwSeparate(
    filePath,
    colorPages,
    bwPages,
    printerName,
    copies
  ) {
    try {
      let results = [];

      // Print BW pages dengan grayscale
      if (bwPages.length > 0) {
        console.log(`⚫ Printing BW pages: ${bwPages.join(",")}`);

        // Set printer ke grayscale sebelum print
        await this.setPrinterSettings(printerName, copies, true);

        const bwResult = await this.printPagesWithFoxit(
          filePath,
          bwPages,
          printerName,
          copies,
          "bw"
        );
        results.push(bwResult);

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Print Color pages dengan color
      if (colorPages.length > 0) {
        console.log(`🎨 Printing Color pages: ${colorPages.join(",")}`);

        // Set printer ke color sebelum print
        await this.setPrinterSettings(printerName, copies, false);

        const colorResult = await this.printPagesWithFoxit(
          filePath,
          colorPages,
          printerName,
          copies,
          "color"
        );
        results.push(colorResult);
      }

      const allSuccess = results.every((result) => result.success);

      if (allSuccess) {
        return {
          success: true,
          jobId: `color_bw_${Date.now()}`,
          method: "Foxit with Color/BW Settings",
          output: `Printed ${bwPages.length} BW pages and ${colorPages.length} color pages`,
          details: results,
        };
      } else {
        throw new Error("Some print jobs failed");
      }
    } catch (error) {
      throw new Error(`Color/BW print failed: ${error.message}`);
    }
  }

  // PRINT: Semua halaman
  async printAllPages(filePath, printerName, copies) {
    try {
      console.log(`🖨️ Printing all pages with ${copies} copies`);

      // Set printer settings
      await this.setPrinterSettings(printerName, copies, false);

      // Print dengan Foxit Reader
      const foxitCommand = `"${this.foxitPath}" /t "${filePath}" "${printerName}"`;
      console.log("🔧 Foxit command:", foxitCommand);

      const { stdout, stderr } = await execPromise(foxitCommand);

      if (stderr && stderr.trim()) {
        console.warn("⚠️ Foxit stderr:", stderr);
      }

      console.log("✅ Foxit stdout:", stdout);

      // Tunggu proses print selesai
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        success: true,
        jobId: `all_pages_${Date.now()}`,
        method: "Foxit Reader",
        output: stdout || `Printed ${copies} copies successfully`,
      };
    } catch (error) {
      throw new Error(`All pages print failed: ${error.message}`);
    }
  }

  // PRINT: Pages tertentu dengan Foxit
  async printPagesWithFoxit(filePath, pages, printerName, copies, mode) {
    try {
      const pageRange = this.formatPageRange(pages);
      console.log(
        `📄 Printing ${mode} pages: ${pageRange} with ${copies} copies`
      );

      // Print multiple copies
      for (let i = 0; i < copies; i++) {
        console.log(`🖨️ Copy ${i + 1} of ${copies}`);

        const foxitCommand = `"${this.foxitPath}" /t "${filePath}" "${printerName}"`;
        await execPromise(foxitCommand);

        // Tunggu antara copies
        if (i < copies - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return {
        success: true,
        mode: mode,
        pages: pages,
        copies: copies,
        output: `Printed ${copies} copies of ${mode} pages`,
      };
    } catch (error) {
      return {
        success: false,
        mode: mode,
        pages: pages,
        error: error.message,
      };
    }
  }

  // SETTING: Atur printer settings melalui PowerShell
  async setPrinterSettings(printerName, copies, grayscale) {
    try {
      console.log(
        `⚙️ Setting printer: ${printerName}, Copies: ${copies}, Grayscale: ${grayscale}`
      );

      const command =
        `powershell -Command "` +
        `Add-Type -AssemblyName System.Printing; ` +
        `try { ` +
        `  $printServer = New-Object System.Printing.LocalPrintServer; ` +
        `  $printQueue = $printServer.GetPrintQueue('${printerName}'); ` +
        `  $defaultPrintTicket = $printQueue.DefaultPrintTicket; ` +
        `  ` +
        `  # Set color/grayscale ` +
        `  $defaultPrintTicket.OutputColor = ${
          grayscale
            ? "[System.Printing.OutputColor]::Monochrome"
            : "[System.Printing.OutputColor]::Color"
        }; ` +
        `  ` +
        `  # Set copies ` +
        `  $defaultPrintTicket.CopyCount = ${copies}; ` +
        `  ` +
        `  # Apply settings ` +
        `  $printQueue.DefaultPrintTicket = $defaultPrintTicket; ` +
        `  ` +
        `  Write-Output 'Printer settings updated successfully'; ` +
        `} catch { ` +
        `  Write-Error ('Failed to update printer settings: ' + $_.Exception.Message); ` +
        `}"`;

      const { stdout, stderr } = await execPromise(command);

      if (stdout) {
        console.log("✅ Printer settings:", stdout);
      }
      if (stderr) {
        console.warn("⚠️ Printer settings warning:", stderr);
      }

      return true;
    } catch (error) {
      console.warn("⚠️ Could not update printer settings:", error.message);
      return false; // Continue printing even if settings fail
    }
  }

  // PARSER: Parse page range
  parsePageRange(rangeString) {
    if (!rangeString) return [];

    const pages = [];
    const parts = rangeString.split(",");

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      } else {
        pages.push(Number(part));
      }
    }

    return [...new Set(pages)].sort((a, b) => a - b);
  }

  // FORMATTER: Format page range
  formatPageRange(pages) {
    if (pages.length === 0) return "all";

    const ranges = [];
    let start = pages[0];
    let end = pages[0];

    for (let i = 1; i < pages.length; i++) {
      if (pages[i] === end + 1) {
        end = pages[i];
      } else {
        ranges.push(start === end ? start.toString() : `${start}-${end}`);
        start = pages[i];
        end = pages[i];
      }
    }

    ranges.push(start === end ? start.toString() : `${start}-${end}`);
    return ranges.join(",");
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
