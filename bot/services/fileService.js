// bot/services/fileService.js
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios"); // IMPORT AXIOS

class FileService {
  constructor() {
    this.storagePath = path.join(process.cwd(), "storage", "pdf");
    this.botToken = process.env.TELEGRAM_BOT_TOKEN; // Simpan bot token
    this.ensureStorageDirectory();
  }

  // Buat folder storage jika belum ada
  async ensureStorageDirectory() {
    try {
      await fs.access(this.storagePath);
    } catch (error) {
      await fs.mkdir(this.storagePath, { recursive: true });
      console.log("✅ Storage directory created:", this.storagePath);
    }
  }

  // Method untuk get file link dari Telegram API
  async getFileLink(fileId) {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${this.botToken}/getFile?file_id=${fileId}`
      );

      if (response.data.ok) {
        const filePath = response.data.result.file_path;
        return `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
      } else {
        throw new Error("Failed to get file link from Telegram API");
      }
    } catch (error) {
      console.error("❌ Error getting file link:", error.message);
      throw error;
    }
  }

  // Download file dari Telegram (TANPA parameter bot)
  async downloadFile(fileId, fileName, userId) {
    try {
      console.log(`📥 Downloading file: ${fileName} for user: ${userId}`);

      // Dapatkan file link menggunakan method baru
      const fileLink = await this.getFileLink(fileId);
      console.log("🔗 File link:", fileLink);

      // Generate unique filename
      const safeFileName = this.sanitizeFileName(fileName);
      const fileExtension = path.extname(safeFileName) || ".pdf";
      const baseName = path.basename(safeFileName, fileExtension);
      const timestamp = Date.now();
      const uniqueFileName = `${baseName}_${userId}_${timestamp}${fileExtension}`;
      const filePath = path.join(this.storagePath, uniqueFileName);

      // Download file menggunakan axios
      const response = await axios({
        method: "GET",
        url: fileLink,
        responseType: "arraybuffer",
      });

      const buffer = Buffer.from(response.data);

      // Simpan file ke local storage
      await fs.writeFile(filePath, buffer);

      console.log(`✅ File saved: ${filePath} (${buffer.length} bytes)`);

      return {
        success: true,
        filePath: filePath,
        fileName: uniqueFileName,
        originalName: fileName,
        size: buffer.length,
        userId: userId,
        downloadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error downloading file:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Sanitize filename untuk menghilangkan karakter berbahaya
  sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  }

  // Cek jika file adalah PDF
  isPDFFile(mimeType, fileName) {
    const isPDFMime = mimeType === "application/pdf";
    const isPDFExtension = fileName.toLowerCase().endsWith(".pdf");
    return isPDFMime || isPDFExtension;
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch (error) {
      return { exists: false };
    }
  }

  // Hapus file
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`🗑️ File deleted: ${filePath}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting file:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new FileService();
