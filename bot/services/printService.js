// bot/services/printService.js - SOLUSI DENGAN POWER SHELL .NET
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

      // Gunakan metode PowerShell .NET untuk kontrol penuh
      const printResult = await this.printWithPowerShellNET(
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

  // METODE UTAMA: PowerShell dengan .NET System.Printing
  async printWithPowerShellNET(filePath, settings, printerName) {
    try {
      console.log("🔄 Using PowerShell .NET Printing...");

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
        return await this.printColorBwWithNET(
          filePath,
          colorPages,
          bwPages,
          printerName,
          copies
        );
      }

      // Jika tidak ada setting khusus, print semua halaman
      return await this.printAllPagesWithNET(filePath, printerName, copies);
    } catch (error) {
      console.error("❌ PowerShell .NET print failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // PRINT: Color dan BW pages terpisah
  async printColorBwWithNET(
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
        const bwResult = await this.printPagesWithNET(
          filePath,
          bwPages,
          printerName,
          copies,
          true // grayscale = true
        );
        results.push(bwResult);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Print Color pages dengan color
      if (colorPages.length > 0) {
        console.log(`🎨 Printing Color pages: ${colorPages.join(",")}`);
        const colorResult = await this.printPagesWithNET(
          filePath,
          colorPages,
          printerName,
          copies,
          false // grayscale = false
        );
        results.push(colorResult);
      }

      const allSuccess = results.every((result) => result.success);

      if (allSuccess) {
        return {
          success: true,
          jobId: `net_${Date.now()}`,
          method: "PowerShell .NET",
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
  async printAllPagesWithNET(filePath, printerName, copies) {
    try {
      console.log(`🖨️ Printing all pages with ${copies} copies`);

      const command = this.buildPowerShellCommand(
        filePath,
        [],
        printerName,
        copies,
        false
      );

      const { stdout, stderr } = await execPromise(command);

      if (stdout.includes("SUCCESS")) {
        return {
          success: true,
          jobId: `net_all_${Date.now()}`,
          method: "PowerShell .NET All Pages",
          output: stdout,
        };
      } else {
        throw new Error(stderr || "Print failed");
      }
    } catch (error) {
      throw new Error(`All pages print failed: ${error.message}`);
    }
  }

  // PRINT: Pages tertentu dengan setting grayscale
  async printPagesWithNET(filePath, pages, printerName, copies, grayscale) {
    try {
      const pageRange = this.formatPageRange(pages);
      const mode = grayscale ? "Grayscale" : "Color";

      console.log(
        `📄 Printing ${mode} pages: ${pageRange} with ${copies} copies`
      );

      const command = this.buildPowerShellCommand(
        filePath,
        pages,
        printerName,
        copies,
        grayscale
      );

      const { stdout, stderr } = await execPromise(command);

      if (stdout.includes("SUCCESS")) {
        return {
          success: true,
          mode: mode.toLowerCase(),
          pages: pages,
          pageRange: pageRange,
          copies: copies,
          output: stdout,
        };
      } else {
        throw new Error(stderr || `${mode} print failed`);
      }
    } catch (error) {
      return {
        success: false,
        mode: grayscale ? "bw" : "color",
        pages: pages,
        error: error.message,
      };
    }
  }

  // BUILD: PowerShell Command dengan .NET - YANG SUDAH DIPERBAIKI
  buildPowerShellCommand(filePath, pages, printerName, copies, grayscale) {
    const pageRangeString =
      pages.length > 0 ? `[int[]]@(${pages.join(",")})` : "@()";

    // Gunakan $true/$false yang benar untuk PowerShell
    const colorSetting = grayscale ? "$false" : "$true";

    return (
      `powershell -Command "` +
      `Add-Type -AssemblyName System.Drawing; ` +
      `Add-Type -AssemblyName System.Printing; ` +
      `try { ` +
      `    $printDoc = New-Object System.Drawing.Printing.PrintDocument; ` +
      `    $printDoc.PrinterSettings.PrinterName = '${printerName}'; ` +
      `    $printDoc.PrinterSettings.Copies = ${copies}; ` +
      `    $printDoc.DefaultPageSettings.Color = ${colorSetting}; ` + // Fixed: menggunakan $true/$false
      `    ` +
      `    $pages = ${pageRangeString}; ` +
      `    if ($pages.Length -gt 0) { ` +
      `        $printDoc.PrinterSettings.FromPage = ($pages | Sort-Object | Select-Object -First 1); ` +
      `        $printDoc.PrinterSettings.ToPage = ($pages | Sort-Object | Select-Object -Last 1); ` +
      `        $printDoc.PrinterSettings.PrintRange = [System.Drawing.Printing.PrintRange]::SomePages; ` +
      `    } ` +
      `    ` +
      `    $printDoc.Add_PrintPage({ ` +
      `        param($sender, $e); ` +
      `        $e.HasMorePages = $false; ` +
      `    }); ` +
      `    ` +
      `    $printDoc.Print(); ` +
      `    Write-Output 'SUCCESS: Print job sent with .NET System.Printing'; ` +
      `    Write-Output 'Settings: Copies=${copies}, Grayscale=${grayscale}, Pages=${
        pages.length > 0 ? pages.join(",") : "all"
      }'; ` +
      `} catch { ` +
      `    Write-Error ('FAILED: ' + $_.Exception.Message); ` +
      `    exit 1; ` +
      `}"`
    );
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

  // Fallback ke Foxit Reader jika diperlukan
  async tryFoxitReader(filePath, printerName, copies) {
    try {
      if (!(await this.fileExists(this.foxitPath))) {
        return { success: false, error: "Foxit Reader not found" };
      }

      const foxitCommand = `"${this.foxitPath}" /t "${filePath}" "${printerName}"`;
      await execPromise(foxitCommand);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        success: true,
        jobId: `foxit_${Date.now()}`,
        method: "Foxit Reader",
        output: "Print job sent via Foxit Reader (limited settings)",
      };
    } catch (error) {
      return { success: false, error: error.message };
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
