import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Simpan data sementara (dalam production, gunakan database)
const userSessions = new Map();

bot.start((ctx) => {
  ctx.reply(
    "🖨️ Selamat datang di Print24Jam Bot!\n\n" +
      "Kirim file PDF/DOC yang ingin dicetak, lalu ikuti instruksi selanjutnya."
  );
});

bot.on("document", async (ctx) => {
  const file = ctx.message.document;
  const userId = ctx.from.id;

  // Simpan informasi file
  userSessions.set(userId, {
    fileId: file.file_id,
    fileName: file.file_name,
    status: "file_received",
  });

  ctx.reply(
    `File "${file.file_name}" diterima!\n\n` +
      "Silakan atur setting print dengan format:\n" +
      "/setprint color:1 bw:2-5 copies:1\n\n" +
      "Contoh: /setprint color:1,3,5 bw:2,4,6-10 copies:2"
  );
});

bot.command("setprint", (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);

  if (!session || session.status !== "file_received") {
    return ctx.reply("Silakan upload file terlebih dahulu");
  }

  // Parse settings dari command
  const settings = parseSettings(ctx.message.text);
  if (!settings) {
    return ctx.reply(
      "Format salah. Contoh:\n" + "/setprint color:1,3,5 bw:2,4,6-10 copies:2"
    );
  }

  // Simpan settings dan hitung biaya
  session.settings = settings;
  session.cost = calculateCost(settings);
  session.status = "settings_configured";
  userSessions.set(userId, session);

  ctx.reply(
    `✅ Settings diterima!\n` +
      `- Halaman warna: ${settings.color || "tidak ada"}\n` +
      `- Halaman hitam putih: ${settings.bw || "tidak ada"}\n` +
      `- Salinan: ${settings.copies}\n\n` +
      `Total biaya: Rp ${session.cost.toLocaleString("id-ID")}\n\n` +
      `Ketikan /pay untuk melanjutkan pembayaran`
  );
});

bot.command("pay", async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions.get(userId);

  if (!session || session.status !== "settings_configured") {
    return ctx.reply(
      "Silakan konfigurasi settings terlebih dahulu dengan /setprint"
    );
  }

  // Generate QRIS (implementasi sesuai payment gateway Anda)
  const qrData = await generateQRIS(session.cost, `print-${Date.now()}`);

  ctx.replyWithPhoto(
    { url: qrData.url },
    {
      caption: `Silakan scan QRIS untuk pembayaran Rp ${session.cost.toLocaleString(
        "id-ID"
      )}`,
    }
  );

  // Simpan data pembayaran
  session.paymentData = qrData;
  session.status = "awaiting_payment";
  userSessions.set(userId, session);
});

// Helper functions
function parseSettings(text) {
  const regex = /color:([\d,\-]+)?\s+bw:([\d,\-]+)?\s+copies:(\d+)/i;
  const match = text.match(regex);
  return match
    ? {
        color: match[1],
        bw: match[2],
        copies: parseInt(match[3]) || 1,
      }
    : null;
}

function calculateCost(settings) {
  // Hitung biaya berdasarkan halaman (contoh sederhana)
  const colorPages = settings.color ? 5 : 0; // Contoh: 5 halaman warna
  const bwPages = settings.bw ? 10 : 0; // Contoh: 10 halaman BW
  return (colorPages * 1000 + bwPages * 500) * settings.copies;
}

async function generateQRIS(amount, orderId) {
  // Integrasikan dengan payment gateway Anda
  // Ini contoh menggunakan QRIS generator sederhana
  return {
    url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=print-${orderId}-${amount}`,
    orderId: orderId,
  };
}

export default async function handler(req, res) {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Error handling Telegram update:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
