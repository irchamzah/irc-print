// bot/utils/printerUtils.js - LENGKAPI SEMUA METHOD YANG DIPERLUKAN
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

class PrinterUtils {
  constructor() {
    this.defaultPrinter = process.env.PRINTER_NAME;
  }

  // METHOD YANG DIPANGGIL OLEH debug.js - TAMBAHKAN INI
  async detectAllPrinters() {
    try {
      console.log("🔍 Detecting all available printers...");

      let command;
      if (process.platform === "win32") {
        command = "wmic printer get name, default, status";
      } else if (process.platform === "darwin") {
        command = "lpstat -p";
      } else {
        command = "lpstat -p";
      }

      const { stdout } = await execPromise(command);
      console.log("📋 Raw printer list:", stdout);

      return this.parsePrinterList(stdout);
    } catch (error) {
      console.error("❌ Error detecting printers:", error);
      return [];
    }
  }

  // Parse printer list berdasarkan OS
  parsePrinterList(rawOutput) {
    const printers = [];

    if (process.platform === "win32") {
      // Windows format
      const lines = rawOutput.split("\n").filter((line) => line.trim());
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const parts = line.split(/\s{2,}/);
          if (parts.length >= 3) {
            printers.push({
              name: parts[0],
              isDefault: parts[1] === "TRUE",
              status: parts[2],
              raw: line,
            });
          }
        }
      }
    } else {
      // Mac/Linux format
      const lines = rawOutput
        .split("\n")
        .filter((line) => line.includes("printer"));
      lines.forEach((line) => {
        if (line.includes("printer")) {
          const nameMatch = line.match(/printer\s+(\S+)/);
          if (nameMatch) {
            printers.push({
              name: nameMatch[1],
              isDefault: line.includes("enabled"),
              status: line.includes("enabled") ? "Ready" : "Unknown",
              raw: line,
            });
          }
        }
      });
    }

    return printers;
  }

  // Cari printer Canon atau Epson secara otomatis
  async findPrinter() {
    try {
      const printers = await this.detectAllPrinters();
      console.log("📋 All detected printers:", printers);

      // Cari printer yang mengandung "Canon", "Epson", atau "L3150"
      const targetPrinters = printers.filter(
        (printer) =>
          printer.name.toLowerCase().includes("canon") ||
          printer.name.toLowerCase().includes("epson") ||
          printer.name.toLowerCase().includes("l3150") ||
          printer.name.toLowerCase().includes("g1010")
      );

      if (targetPrinters.length > 0) {
        // Prioritize default printer, then first found
        const selectedPrinter =
          targetPrinters.find((p) => p.isDefault) || targetPrinters[0];
        console.log(`🎯 Selected printer: ${selectedPrinter.name}`);
        return selectedPrinter;
      }

      // Jika tidak ada target printer, coba printer default atau pertama
      const defaultPrinter = printers.find((p) => p.isDefault) || printers[0];
      if (defaultPrinter) {
        console.log(
          `⚠️ No target printer found, using: ${defaultPrinter.name}`
        );
        return defaultPrinter;
      }

      return null;
    } catch (error) {
      console.error("❌ Error finding printer:", error);
      return null;
    }
  }

  // Alias untuk compatibility dengan code existing
  async findCanonPrinter() {
    return this.findPrinter();
  }

  // Test printer connection
  async testPrinterConnection(printerName = null) {
    try {
      if (!printerName) {
        const printer = await this.findPrinter();
        printerName = printer?.name || this.defaultPrinter;
      }

      console.log(`🔧 Testing printer connection: ${printerName}`);

      let testCommand;
      if (process.platform === "win32") {
        testCommand = `wmic printer where name='${printerName}' get name, status`;
      } else {
        testCommand = `lpstat -p "${printerName}"`;
      }

      const { stdout } = await execPromise(testCommand);
      const isOnline =
        stdout.toLowerCase().includes(printerName.toLowerCase()) &&
        (stdout.toLowerCase().includes("ready") ||
          stdout.toLowerCase().includes("ok"));

      if (isOnline) {
        console.log(`✅ Printer ${printerName} is online`);
        return {
          success: true,
          status: "online",
          printerName: printerName,
        };
      } else {
        console.log(`❌ Printer ${printerName} is not available`);
        return {
          success: false,
          status: "offline",
          printerName: printerName,
        };
      }
    } catch (error) {
      console.error(`❌ Printer test error:`, error);
      return {
        success: false,
        error: error.message,
        printerName: printerName,
        status: "error",
      };
    }
  }

  // Get default printer
  async getDefaultPrinter() {
    try {
      let command;
      if (process.platform === "win32") {
        command = "wmic printer where default=true get name";
      } else if (process.platform === "darwin") {
        command = "lpstat -d";
      } else {
        command = "lpstat -d";
      }

      const { stdout } = await execPromise(command);
      const defaultPrinter = stdout.split("\n")[1]?.trim();
      console.log(`📄 System default printer: ${defaultPrinter}`);
      return defaultPrinter || this.defaultPrinter;
    } catch (error) {
      console.error("❌ Error getting default printer:", error);
      return this.defaultPrinter;
    }
  }

  // Print test page
  async printTestPage(printerName = null) {
    try {
      if (!printerName) {
        const printer = await this.findPrinter();
        printerName = printer?.name || (await this.getDefaultPrinter());
      }

      console.log(`🖨️ Printing test page to ${printerName}`);

      if (process.platform === "win32") {
        // Buat file test sederhana
        const testContent = `
Test Page - Printer Working!
Timestamp: ${new Date().toISOString()}
Printer: ${printerName}
Bot: Telegram Print Service
        `.trim();

        const testPath = `./storage/pdf/test_page_${Date.now()}.txt`;
        await require("fs").promises.writeFile(testPath, testContent);

        const printCommand =
          `powershell -Command "$printer = '${printerName}'; ` +
          `$file = '${testPath}'; ` +
          `Start-Process -FilePath 'notepad' -ArgumentList '/p', $file -WindowStyle Hidden -Wait; ` +
          `Write-Output 'Test page sent to printer'"`;

        await execPromise(printCommand);
        console.log("✅ Test page sent via Notepad print");

        // Cleanup
        setTimeout(
          () =>
            require("fs")
              .promises.unlink(testPath)
              .catch(() => {}),
          3000
        );
      } else {
        // Method untuk Mac/Linux
        const testPath = `./storage/pdf/test_page_${Date.now()}.pdf`;
        // Buat PDF sederhana atau gunakan file existing
        const printCommand = `lp -d "${printerName}" "${testPath}"`;
        await execPromise(printCommand);
      }

      return { success: true, printerName };
    } catch (error) {
      console.error("❌ Test print error:", error);
      return { success: false, error: error.message, printerName };
    }
  }
}

module.exports = new PrinterUtils();
