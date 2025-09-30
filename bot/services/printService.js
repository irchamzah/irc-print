// bot/services/printService.js - GUNAKAN FOXIT READER
const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const printerUtils = require("../utils/printerUtils");

class PrintService {
  constructor() {
    this.printLogPath = path.join(
      process.cwd(),
      "storage",
      "logs",
      "print-jobs.log"
    );
    this.printerName = "Canon G1010 series";
    // FULL PATH KE FOXIT READER
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

      // Validasi file exists
      if (!fileInfo.localPath || !(await this.fileExists(fileInfo.localPath))) {
        throw new Error("File tidak ditemukan untuk printing");
      }

      // Print ke printer fisik dengan metode yang benar
      const printResult = await this.realPrintToPrinter(
        fileInfo.localPath,
        settings,
        printerName
      );

      if (!printResult.success) {
        throw new Error(printResult.error);
      }

      // Log printing job
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

  // METODE PRINT YANG SEBENARNYA
  async realPrintToPrinter(filePath, settings, printerName) {
    try {
      console.log(`🖨️ REAL Printing to ${printerName}: ${filePath}`);

      const copies = settings.copies || 1;

      // COBA METODE DENGAN FOXIT READER
      const methods = [
        () => this.tryFoxitReader(filePath, printerName, copies),
        () => this.tryFoxitWithPowerShell(filePath, printerName, copies),
        () => this.tryFoxitSilentPrint(filePath, printerName, copies),
      ];

      for (const method of methods) {
        const result = await method();
        if (result.success) {
          console.log(`✅ REAL Print successful with ${result.method}`);
          return result;
        }
        console.log(`❌ ${result.method} failed, trying next method...`);
      }

      throw new Error("All REAL print methods failed");
    } catch (error) {
      console.error("❌ All REAL print methods failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // METHOD 1: Gunakan Foxit Reader dengan full path
  async tryFoxitReader(filePath, printerName, copies) {
    try {
      console.log("🔄 Trying Foxit Reader print method...");

      // Cek apakah file Foxit Reader exists
      if (!(await this.fileExists(this.foxitPath))) {
        console.log("❌ Foxit Reader not found at:", this.foxitPath);
        return {
          success: false,
          method: "Foxit Reader",
          error: "Foxit Reader executable not found",
        };
      }

      console.log("✅ Foxit Reader found at:", this.foxitPath);

      // Print menggunakan Foxit Reader dengan full path
      // Foxit Reader menggunakan parameter /p untuk print dan /t untuk terminate setelah print
      const foxitCommand = `"${this.foxitPath}" /t "${filePath}" "${printerName}"`;
      console.log("🔧 Foxit Reader command:", foxitCommand);

      const { stdout, stderr } = await execPromise(foxitCommand);

      if (stderr && stderr.trim()) {
        console.warn("⚠️ Foxit Reader stderr:", stderr);
      }

      console.log("✅ Foxit Reader stdout:", stdout);

      // Tunggu sebentar untuk memastikan print job diproses
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        success: true,
        jobId: `foxit_${Date.now()}`,
        method: "Foxit Reader",
        output: stdout || "Print job sent via Foxit Reader",
      };
    } catch (error) {
      console.error("❌ Foxit Reader print error:", error);
      return { success: false, method: "Foxit Reader", error: error.message };
    }
  }

  // METHOD 2: Foxit Reader dengan PowerShell
  async tryFoxitWithPowerShell(filePath, printerName, copies) {
    try {
      console.log("🔄 Trying Foxit Reader with PowerShell method...");

      const command =
        `powershell -Command "` +
        `try { ` +
        `  $$foxitPath = '${this.foxitPath}'; ` +
        `  if (Test-Path $$foxitPath) { ` +
        `    $$arguments = '/t \"${filePath}\" \"${printerName}\"'; ` +
        `    $$process = Start-Process -FilePath $$foxitPath -ArgumentList $$arguments -WindowStyle Hidden -PassThru; ` +
        `    $$process.WaitForExit(30000); ` +
        `    if ($$process.ExitCode -eq 0) { ` +
        `      Write-Output 'Foxit Reader print job sent successfully'; ` +
        `    } else { ` +
        `      Write-Error 'Foxit Reader process failed with exit code: ' + $$process.ExitCode; ` +
        `    } ` +
        `  } else { ` +
        `    Write-Error 'Foxit Reader not found at: ' + $$foxitPath; ` +
        `  } ` +
        `} catch { ` +
        `  Write-Error ('Foxit Reader PowerShell print failed: ' + $$_.Exception.Message); ` +
        `}"`;

      const { stdout, stderr } = await execPromise(command);

      if (stdout && stdout.includes("successfully")) {
        return {
          success: true,
          jobId: `foxit_ps_${Date.now()}`,
          method: "Foxit Reader + PowerShell",
          output: stdout,
        };
      }
      return {
        success: false,
        method: "Foxit Reader + PowerShell",
        error: stderr || "Unknown error",
      };
    } catch (error) {
      return {
        success: false,
        method: "Foxit Reader + PowerShell",
        error: error.message,
      };
    }
  }

  // METHOD 3: Foxit Reader Silent Print (alternatif parameter)
  async tryFoxitSilentPrint(filePath, printerName, copies) {
    try {
      console.log("🔄 Trying Foxit Reader Silent Print method...");

      // Alternatif parameter untuk Foxit Reader
      const foxitCommand = `"${this.foxitPath}" /p "${filePath}"`;
      console.log("🔧 Foxit Silent Print command:", foxitCommand);

      const { stdout, stderr } = await execPromise(foxitCommand);

      if (stderr && stderr.trim()) {
        console.warn("⚠️ Foxit Silent Print stderr:", stderr);
      }

      console.log("✅ Foxit Silent Print stdout:", stdout);

      // Tunggu sebentar untuk memastikan print job diproses
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        success: true,
        jobId: `foxit_silent_${Date.now()}`,
        method: "Foxit Reader Silent Print",
        output: stdout || "Print job sent via Foxit Reader Silent Print",
      };
    } catch (error) {
      console.error("❌ Foxit Silent Print error:", error);
      return {
        success: false,
        method: "Foxit Reader Silent Print",
        error: error.message,
      };
    }
  }

  // Check if file exists
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
        userId:
          userSession.userId ||
          userSession.paymentInfo?.orderId?.split("-")[1] ||
          "unknown",
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
