module.exports = {
  SESSION_EXPIRY: {
    AWAITING_FILE: 6 * 60 * 60 * 1000,
    CONFIGURING: 2 * 60 * 60 * 1000,
    AWAITING_PAYMENT: 30 * 60 * 1000,
    COMPLETED: 24 * 60 * 60 * 1000,
  },

  PRINT_COSTS: {
    COLOR: 1000,
    BW: 500,
  },

  BOT_COMMANDS: {
    START: "/start",
    FILE: "/file",
    SETPRINT: "/setprint",
    PAY: "/pay",
    STATUS: "/status",
    DEBUG: "/debug",
  },
};
