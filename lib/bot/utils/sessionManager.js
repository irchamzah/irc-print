function createSessionManager() {
  const sessions = new Map();

  return {
    get(userId) {
      const session = sessions.get(userId);
      console.log(
        "📥 Get session for",
        userId,
        ":",
        session ? JSON.stringify(session, null, 2) : "null"
      );
      return session;
    },

    // Di fungsi set(), tambahkan logging yang lebih detail
    set(userId, data) {
      console.log("💾 Set session for", userId);
      console.log("📋 Session data:", JSON.stringify(data, null, 2));
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

    // Tambahkan property untuk mendapatkan size
    get size() {
      return sessions.size;
    },

    // Tambahkan method forEach untuk compatibility
    forEach(callback) {
      return sessions.forEach(callback);
    },
  };
}

// Buat instance langsung dan export
const userSessions = createSessionManager();

module.exports = { createSessionManager, userSessions };
