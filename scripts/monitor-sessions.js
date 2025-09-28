const { userSessions } = require("../bot-runner");

function monitorSessions() {
  console.log("👀 Monitoring user sessions...\n");

  setInterval(() => {
    const now = new Date().toLocaleTimeString();
    const sessionCount = userSessions.debugAll().length;

    console.log(`[${now}] Active sessions: ${sessionCount}`);

    if (sessionCount > 0) {
      userSessions.debugAll().forEach(([userId, session], index) => {
        console.log(`  ${index + 1}. User ${userId}:`);
        console.log(`     File: ${session.fileName || "None"}`);
        console.log(`     Cost: ${session.cost || "Not set"}`);
        console.log(`     Uploaded: ${session.fileUploaded ? "Yes" : "No"}`);
      });
    }

    console.log("---");
  }, 5000); // Check every 5 seconds
}

// Jalankan monitoring
monitorSessions();

// Juga export untuk bisa diimport elsewhere
module.exports = { monitorSessions };
