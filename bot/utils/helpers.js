function parseMultiLineCommands(text) {
  const lines = text.split("\n").map((line) => line.trim());
  const commands = [];

  for (const line of lines) {
    // Hanya ambil lines yang startsWith '/'
    if (line.startsWith("/")) {
      commands.push(line);
    }
  }

  return commands;
}

// Helper function untuk parse settings
function parsePrintSettings(settingsText) {
  const settings = {
    colorPages: [],
    bwPages: [],
    copies: 1,
  };

  const regex = /(color|bw):([\d,\-]+)|copies:(\d+)/gi;
  let match;

  while ((match = regex.exec(settingsText)) !== null) {
    const [, type, pages, copies] = match;

    if (type && pages) {
      const pageArray = parsePageRange(pages);
      if (type === "color") {
        settings.colorPages = pageArray;
      } else if (type === "bw") {
        settings.bwPages = pageArray;
      }
    } else if (copies) {
      settings.copies = parseInt(copies);
    }
  }

  return settings;
}

// Helper function untuk parse page range
function parsePageRange(pageStr) {
  if (!pageStr) return [];

  const pages = [];
  const parts = pageStr.split(",");

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

  return pages;
}

// Helper function untuk calculate cost
function calculateCostFromSettings(settings) {
  const colorCost = settings.colorPages.length * 1500;
  const bwCost = settings.bwPages.length * 500;
  return (colorCost + bwCost) * settings.copies;
}

// Helper function untuk format settings menjadi string
function formatSettingsForMessage(settings) {
  if (!settings) return "color:1 bw:2-4 copies:1"; // Default fallback

  const parts = [];

  if (settings.colorPages && settings.colorPages.length > 0) {
    const colorStr = settings.colorPages.join(",");
    parts.push(`color:${colorStr}`);
  }

  if (settings.bwPages && settings.bwPages.length > 0) {
    const bwStr = settings.bwPages.join(",");
    parts.push(`bw:${bwStr}`);
  }

  if (settings.copies) {
    parts.push(`copies:${settings.copies}`);
  }

  return parts.join(" ");
}

function getSmartSettingsSuggestion(userSession) {
  // Jika ada settings sebelumnya, suggest yang sama
  if (userSession.lastSettings) {
    return userSession.lastSettings;
  }

  // Jika ada fileName, coba predict berdasarkan nama file
  if (userSession.fileName) {
    // Heuristic: Jika file mengandung "skripsi", "thesis", dll -> mostly BW
    const fileName = userSession.fileName.toLowerCase();
    if (
      fileName.includes("skripsi") ||
      fileName.includes("thesis") ||
      fileName.includes("laporan")
    ) {
      return "color:1 bw:2-10 copies:2"; // Halaman 1 warna, lainnya BW, 2 copies
    }

    // Jika file mengandung "presentasi", "slide", dll -> mostly color
    if (
      fileName.includes("presentasi") ||
      fileName.includes("slide") ||
      fileName.includes("proposal")
    ) {
      return "color:1-10 copies:1"; // Semua halaman warna
    }
  }

  // Default suggestion
  return "color:1 bw:2-6 copies:1";
}

module.exports = {
  parseMultiLineCommands,
  parsePrintSettings,
  parsePageRange,
  calculateCostFromSettings,
  formatSettingsForMessage,
  getSmartSettingsSuggestion,
};
