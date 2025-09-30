// bot/services/printService.js - GUNAKAN FULL PATH UNTUK SUMATRAPDF
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
    this.printerName = "EPSON L3150 Series";
    // FULL PATH KE SUMATRAPDF
    this.sumatraPath =
      "C:\\Users\\User\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe";
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

      // COBA METODE DENGAN SUMATRAPDF DULU
      const methods = [
        () => this.trySumatraPDF(filePath, printerName, copies),
        () => this.tryPowerShellPrint(filePath, printerName, copies),
        () => this.tryNetPrint(filePath, printerName, copies),
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

  // METHOD 1: Gunakan SumatraPDF dengan full path
  async trySumatraPDF(filePath, printerName, copies) {
    try {
      console.log("🔄 Trying SumatraPDF print method...");

      // Cek apakah file SumatraPDF exists
      if (!(await this.fileExists(this.sumatraPath))) {
        console.log("❌ SumatraPDF not found at:", this.sumatraPath);
        return {
          success: false,
          method: "SumatraPDF",
          error: "SumatraPDF executable not found",
        };
      }

      console.log("✅ SumatraPDF found at:", this.sumatraPath);

      // Print menggunakan SumatraPDF dengan full path
      const sumatraCommand = `"${this.sumatraPath}" -print-to "${printerName}" -print-settings "copies=${copies}" "${filePath}"`;
      console.log("🔧 SumatraPDF command:", sumatraCommand);

      const { stdout, stderr } = await execPromise(sumatraCommand);

      if (stderr && stderr.trim()) {
        console.warn("⚠️ SumatraPDF stderr:", stderr);
      }

      console.log("✅ SumatraPDF stdout:", stdout);

      // SumatraPDF biasanya tidak return output jika success
      // Tunggu sebentar untuk memastikan print job diproses
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        jobId: `sumatra_${Date.now()}`,
        method: "SumatraPDF",
        output: stdout || "Print job sent via SumatraPDF",
      };
    } catch (error) {
      console.error("❌ SumatraPDF print error:", error);
      return { success: false, method: "SumatraPDF", error: error.message };
    }
  }

  // METHOD 2: PowerShell dengan approach berbeda
  async tryPowerShellPrint(filePath, printerName, copies) {
    try {
      console.log("🔄 Trying PowerShell print method...");

      const command =
        `powershell -Command "` +
        `try { ` +
        `  # Coba gunakan Start-Process dengan SumatraPDF ` +
        `  $$sumatraPath = '${this.sumatraPath}'; ` +
        `  if (Test-Path $$sumatraPath) { ` +
        `    $$arguments = '-print-to \"${printerName}\" -print-settings \"copies=${copies}\" \"${filePath}\"'; ` +
        `    $$process = Start-Process -FilePath $$sumatraPath -ArgumentList $$arguments -WindowStyle Hidden -PassThru; ` +
        `    $$process.WaitForExit(30000); ` +
        `    if ($$process.ExitCode -eq 0) { ` +
        `      Write-Output 'PowerShell + SumatraPDF print job sent successfully'; ` +
        `    } else { ` +
        `      Write-Error 'SumatraPDF process failed with exit code: ' + $$process.ExitCode; ` +
        `    } ` +
        `  } else { ` +
        `    Write-Error 'SumatraPDF not found at: ' + $$sumatraPath; ` +
        `  } ` +
        `} catch { ` +
        `  Write-Error ('PowerShell print failed: ' + $$_.Exception.Message); ` +
        `}"`;

      const { stdout, stderr } = await execPromise(command);

      if (stdout && stdout.includes("successfully")) {
        return {
          success: true,
          jobId: `powershell_${Date.now()}`,
          method: "PowerShell + SumatraPDF",
          output: stdout,
        };
      }
      return {
        success: false,
        method: "PowerShell + SumatraPDF",
        error: stderr || "Unknown error",
      };
    } catch (error) {
      return {
        success: false,
        method: "PowerShell + SumatraPDF",
        error: error.message,
      };
    }
  }

  // METHOD 3: .NET System.Printing (fallback)
  async tryNetPrint(filePath, printerName, copies) {
    try {
      console.log("🔄 Trying .NET System.Printing method...");

      const command =
        `powershell -Command "` +
        `Add-Type -AssemblyName System.Printing; ` +
        `` +
        `try { ` +
        `  $$printServer = New-Object System.Printing.LocalPrintServer; ` +
        `  $$printQueue = $$printServer.GetPrintQueue('${printerName}'); ` +
        `  ` +
        `  if ($$printQueue.IsOffline) { ` +
        `    Write-Error 'Printer is offline'; ` +
        `  } else { ` +
        `    Write-Output 'Printer is online: ${printerName}'; ` +
        `    ` +
        `    # Untuk actual printing, kita tetap butuh SumatraPDF atau tool lain ` +
        `    # Karena .NET tidak bisa handle PDF langsung ` +
        `    $$sumatraPath = '${this.sumatraPath}'; ` +
        `    if (Test-Path $$sumatraPath) { ` +
        `      $$arguments = '-print-to \"${printerName}\" -print-settings \"copies=${copies}\" \"${filePath}\"'; ` +
        `      Start-Process -FilePath $$sumatraPath -ArgumentList $$arguments -WindowStyle Hidden; ` +
        `      Write-Output '.NET validated + SumatraPDF print sent'; ` +
        `    } ` +
        `  } ` +
        `} catch { ` +
        `  Write-Error ('.NET print failed: ' + $$_.Exception.Message); ` +
        `}"`;

      const { stdout } = await execPromise(command);

      if (stdout && stdout.includes("print sent")) {
        return {
          success: true,
          jobId: `dotnet_${Date.now()}`,
          method: ".NET + SumatraPDF",
          output: stdout,
        };
      }
      return { success: false, method: ".NET System.Printing" };
    } catch (error) {
      return {
        success: false,
        method: ".NET System.Printing",
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
