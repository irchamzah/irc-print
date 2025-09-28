// bot/config/session.js
const constants = require("./constant");

// BUAT SINGLE INSTANCE SESSION MANAGER
const userSessions = (function () {
  const sessions = new Map();

  return {
    get(userId) {
      const session = sessions.get(userId);
      console.log(
        "📥 Get session for",
        userId,
        ":",
        session ? "EXISTS" : "NOT FOUND"
      );
      return session;
    },

    set(userId, data) {
      console.log("💾 Set session for", userId, ":", data);
      sessions.set(userId, data);
      return sessions.get(userId);
    },

    has(userId) {
      const exists = sessions.has(userId);
      console.log("🔍 Check session exists for", userId, ":", exists);
      return exists;
    },

    delete(userId) {
      console.log("🗑️ Delete session for", userId);
      return sessions.delete(userId);
    },

    debugAll() {
      return Array.from(sessions.entries());
    },

    // Tambahkan forEach untuk session cleanup
    forEach(callback) {
      sessions.forEach(callback);
    },

    // Get total sessions count
    get size() {
      return sessions.size;
    },
  };
})();

function startSessionCleanup() {
  setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;

    userSessions.forEach((session, userId) => {
      const expiryTime = getSessionExpiryTime(session);
      if (now > expiryTime) {
        console.log(`🧹 Cleaning expired session for user: ${userId}`);
        userSessions.delete(userId);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`✅ Cleaned ${cleanedCount} expired sessions`);
    }
  }, 5 * 60 * 1000);
}

function getSessionExpiryTime(session) {
  if (!session.lastActivity) return Date.now() - 1;

  const lastActivity = session.lastActivity;

  switch (session.currentStep) {
    case "awaiting_file":
      return lastActivity + constants.SESSION_EXPIRY.AWAITING_FILE;
    case "configuring":
      return lastActivity + constants.SESSION_EXPIRY.CONFIGURING;
    case "awaiting_payment":
      return lastActivity + constants.SESSION_EXPIRY.AWAITING_PAYMENT;
    case "completed":
      return lastActivity + constants.SESSION_EXPIRY.COMPLETED;
    default:
      return lastActivity + constants.SESSION_EXPIRY.DEFAULT;
  }
}

// EXPORT INSTANCE YANG SUDAH DIBUAT
module.exports = {
  userSessions, // Export instance, bukan function
  startSessionCleanup,
  getSessionExpiryTime,
};
