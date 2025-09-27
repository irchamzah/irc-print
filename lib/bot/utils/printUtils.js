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

function calculateCostFromSettings(settings) {
  const colorCost = settings.colorPages.length * 1000;
  const bwCost = settings.bwPages.length * 500;
  return (colorCost + bwCost) * settings.copies;
}

function formatSettingsForMessage(settings) {
  if (!settings) return "color:1 bw:2-4 copies:1";

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
  if (userSession.lastSettings) {
    return userSession.lastSettings;
  }

  if (userSession.fileName) {
    const fileName = userSession.fileName.toLowerCase();
    if (
      fileName.includes("skripsi") ||
      fileName.includes("thesis") ||
      fileName.includes("laporan")
    ) {
      return "color:1 bw:2-10 copies:2";
    }
    if (
      fileName.includes("presentasi") ||
      fileName.includes("slide") ||
      fileName.includes("proposal")
    ) {
      return "color:1-10 copies:1";
    }
  }

  return "color:1 bw:2-6 copies:1";
}

module.exports = {
  parsePrintSettings,
  parsePageRange,
  calculateCostFromSettings,
  formatSettingsForMessage,
  getSmartSettingsSuggestion,
};
