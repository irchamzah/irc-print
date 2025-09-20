// print-server.js
const { Telegraf } = require("telegraf");
const axios = require("axios");
const fs = require("fs");
const { exec } = require("child_process");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Fungsi untuk mendownload file dari Telegram
async function downloadFile(fileId, fileName) {
  const fileUrl = await bot.telegram.getFileLink(fileId);
  const response = await axios.get(fileUrl, { responseType: "stream" });
  const writer = fs.createWriteStream(`./downloads/${fileName}`);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// Fungsi untuk print file
function printFile(filePath, settings) {
  return new Promise((resolve, reject) => {
    let command = `lp -d canon_g1010 `;

    if (settings.color) {
      command += " -o ColorModel=RGB ";
    }

    command += ` -n ${settings.copies} `;
    command += ` "${filePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Monitor pesanan yang sudah dibayar
setInterval(async () => {
  // Di sini Anda akan mengecek database atau menyimpan status
  // untuk mengetahui pesanan yang sudah dibayar dan perlu dicetak
}, 5000); // Cek setiap 5 detik
