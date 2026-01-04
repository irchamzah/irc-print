// lib/printConstants.js
export const PRINT_SETTINGS = {
  PAPER_SIZES: {
    A4: {
      name: "A4",
      width: 595,
      height: 842,
      points: true,
      description: "A4 (210×297mm)",
    },
    // A5: {
    //   name: "A5",
    //   width: 420,
    //   height: 595,
    //   points: true,
    //   description: "A5 (148×210mm)",
    // },
    // LETTER: {
    //   name: "LETTER",
    //   width: 612,
    //   height: 792,
    //   points: true,
    //   description: "Letter (8.5×11in)",
    // },
    // LEGAL: {
    //   name: "LEGAL",
    //   width: 612,
    //   height: 1008,
    //   points: true,
    //   description: "Legal (8.5×14in)",
    // },
  },

  ORIENTATIONS: {
    PORTRAIT: { name: "PORTRAIT", value: 1, description: "Portrait" },
    LANDSCAPE: { name: "LANDSCAPE", value: 0, description: "Landscape" },
  },

  QUALITY: {
    DRAFT: {
      name: "DRAFT",
      dpi: 150,
      pdfSettings: "/screen",
      description: "Draft - Cepat, kualitas rendah",
    },
    NORMAL: {
      name: "NORMAL",
      dpi: 300,
      pdfSettings: "/default",
      description: "Normal - Seimbang",
    },
    HIGH: {
      name: "HIGH",
      dpi: 600,
      pdfSettings: "/prepress",
      description: "High Quality - Hasil terbaik",
    },
  },

  MARGINS: {
    NORMAL: { name: "NORMAL", value: "15 15", description: "Normal Margin" },
    MINIMAL: { name: "MINIMAL", value: "5 5", description: "Minimal Margin" },
    NONE: { name: "NONE", value: "0 0", description: "No Margin (Full Bleed)" },
  },

  COSTS: {
    COLOR: {
      A4: 1500,
      A5: 1500,
      LETTER: 2000,
      LEGAL: 2500,
    },
    BW: {
      A4: 0,
      A5: 400,
      LETTER: 500,
      LEGAL: 600,
    },
    QUALITY_SURCHARGE: {
      DRAFT: 0,
      NORMAL: 0,
      HIGH: 500,
    },
  },

  // Default settings
  DEFAULTS: {
    paperSize: "A4",
    orientation: "PORTRAIT",
    quality: "NORMAL",
    margins: "NORMAL",
    duplex: false,
    copies: 1,
  },
};
