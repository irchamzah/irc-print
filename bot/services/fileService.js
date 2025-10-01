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

  // Hapus file user berdasarkan userId
  async deleteUserFiles(userId) {
    try {
      console.log(`🧹 Cleaning up files for user: ${userId}`);
      const files = await fs.readdir(this.storagePath);
      let deletedCount = 0;

      for (const file of files) {
        // Cek jika file mengandung userId
        if (file.includes(`_${userId}_`)) {
          const filePath = path.join(this.storagePath, file);
          const deleteResult = await this.deleteFile(filePath);
          if (deleteResult.success) {
            deletedCount++;
            console.log(`✅ Deleted user file: ${file}`);
          }
        }
      }

      console.log(`🗑️ Cleaned up ${deletedCount} files for user ${userId}`);
      return { success: true, deletedCount };
    } catch (error) {
      console.error(`❌ Error cleaning up files for user ${userId}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Hapus file berdasarkan file path
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`🗑️ File deleted: ${filePath}`);
      return { success: true };
    } catch (error) {
      // File mungkin sudah dihapus, tidak perlu error
      if (error.code === "ENOENT") {
        console.log(`📝 File already deleted: ${filePath}`);
        return { success: true };
      }
      console.error("❌ Error deleting file:", error);
      return { success: false, error: error.message };
    }
  }

  // Cleanup old files (untuk session cleanup)
  async cleanupOldFiles(maxAgeMinutes = 30) {
    try {
      const files = await fs.readdir(this.storagePath);
      const now = Date.now();
      const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.storagePath, file);

        try {
          const stats = await fs.stat(filePath);

          // Hapus file yang lebih tua dari maxAge
          if (now - stats.mtime.getTime() > maxAge) {
            await this.deleteFile(filePath);
            deletedCount++;
          }
        } catch (error) {
          // Skip file jika tidak bisa diakses
          console.log(`⚠️ Skipping file: ${file}`, error.message);
        }
      }

      console.log(
        `🧹 Cleaned up ${deletedCount} old files (older than ${maxAgeMinutes} minutes)`
      );
      return { deletedCount };
    } catch (error) {
      console.error("❌ Error cleaning up old files:", error);
      return { error: error.message };
    }
  }

  // Get all files for a specific user
  async getUserFiles(userId) {
    try {
      const files = await fs.readdir(this.storagePath);
      const userFiles = files.filter((file) => file.includes(`_${userId}_`));

      return userFiles.map((file) => ({
        name: file,
        path: path.join(this.storagePath, file),
      }));
    } catch (error) {
      console.error(`❌ Error getting files for user ${userId}:`, error);
      return [];
    }
  }
}

module.exports = new FileService();
