module.exports = {
  SESSION_EXPIRY: {
    AWAITING_FILE: 30 * 60 * 1000, // 30 menit - menunggu upload file
    CONFIGURING: 20 * 60 * 1000, // 20 menit - configuring settings
    AWAITING_PAYMENT: 15 * 60 * 1000, // 15 menit - menunggu pembayaran
    COMPLETED: 10 * 60 * 1000, // 10 menit - setelah selesai
    DEFAULT: 30 * 60 * 1000, // 30 menit - default
  },

  FILE_CLEANUP: {
    AFTER_PRINT: true, // Hapus file setelah print
    AFTER_TIMEOUT: 30, // Hapus file setelah 30 menit idle
    ON_ERROR: true, // Hapus file jika ada error
  },

  PRINT_COSTS: {
    COLOR: 1500,
    BW: 500,
  },

  BOT_COMMANDS: {
    START: "/start",
    FILE: "/file",
    SETPRINT: "/setprint",
    PAY: "/pay",
    STATUS: "/checkstatus",
    DEBUG: "/debug",
  },
};
