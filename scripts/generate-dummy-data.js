// ============================================
// GENERATE 100+ DATA DUMMY UNTUK TESTING
// ============================================
// Jalankan di MongoDB Shell atau MongoDB Compass
// ============================================

// Pilih database

// ============================================
// 1. KONSTANTA DAN DATA DASAR
// ============================================

// Printer ID yang akan digunakan
const PRINTER_ID = "irc-print-perum-green-garden-jember";
const PRINTER_NAME = "Irc Print - Perum Green Garden - Jember";

// Daftar user untuk filledBy
const users = [
  { userId: "user-001", name: "Super Admin", role: "super_admin" },
  { userId: "user-002", name: "Budi Partner", role: "partner" },
  { userId: "user-003", name: "Siti Partner", role: "partner" },
  { userId: "user-004", name: "Ahmad Partner", role: "partner" },
  { userId: "user-005", name: "Dewi Partner", role: "partner" },
];

// Fungsi untuk mendapatkan random user
function getRandomUser() {
  return users[Math.floor(Math.random() * users.length)];
}

// Fungsi untuk random date dalam 3 bulan terakhir
function getRandomDate(daysAgo = 90) {
  const now = new Date();
  const pastDate = new Date(
    now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000,
  );
  return pastDate;
}

// Fungsi untuk random number dalam range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fungsi untuk random status
function getRandomStatus() {
  const rand = Math.random();
  if (rand < 0.3) return "active"; // 30% active
  if (rand < 0.5) return "completed"; // 20% completed
  return "paid"; // 50% paid
}

// Fungsi untuk random profit share
function getRandomProfitShare() {
  return Math.random() < 0.3 ? 20 : 30; // 30% kemungkinan 20% (admin), 70% 30% (partner)
}

// ============================================
// 2. HAPUS DATA LAMA (OPTIONAL - HATI-HATI!)
// ============================================

// HAPUS INI jika ingin membersihkan data lama
// db.paperRefills.deleteMany({ printerId: PRINTER_ID });
// db.printJobs.deleteMany({ printerId: PRINTER_ID });

// ============================================
// 3. GENERATE 100+ PAPER REFILLS
// ============================================

print("🔄 Generating paperRefills data...");

const paperRefills = [];
const refillIds = [];

// Generate 120 refills
for (let i = 1; i <= 120; i++) {
  const refillDate = getRandomDate(90); // 3 bulan terakhir
  const user = getRandomUser();
  const profitShare = getRandomProfitShare();
  const status = getRandomStatus();

  // Random jumlah print jobs dalam refill ini (0-15)
  const jobsCount = randomInt(0, 15);

  // Random sheetsAdded (bisa 80, 40, atau 100)
  const sheetsAdded = [80, 40, 100][Math.floor(Math.random() * 3)];

  // Random paper count before (1-200)
  const paperCountBefore = randomInt(1, 200);

  // Random total revenue per job (Rp 500 - Rp 5000)
  let totalRevenue = 0;
  for (let j = 0; j < jobsCount; j++) {
    totalRevenue += randomInt(500, 5000);
  }

  const partnerProfit = Math.round((totalRevenue * profitShare) / 100);

  const refillId = `refill-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`;
  refillIds.push(refillId);

  const refill = {
    refillId: refillId,
    printerId: PRINTER_ID,
    printerName: PRINTER_NAME,
    filledBy: user.userId,
    filledByName: user.name,
    filledByRole: user.role,
    sheetsAdded: sheetsAdded,
    paperCountBefore: paperCountBefore,
    paperCountAfter: paperCountBefore + sheetsAdded,
    profitShare: profitShare,
    totalRevenue: totalRevenue,
    partnerProfit: partnerProfit,
    status: status,
    paidAt:
      status === "paid"
        ? new Date(refillDate.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000)
        : null,
    jobsCovered: [], // Akan diisi nanti
    createdAt: refillDate,
    updatedAt: refillDate,
    completedAt:
      status !== "active"
        ? new Date(refillDate.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000)
        : null,
    paidBy: status === "paid" ? "user-001" : null,
    paidByName: status === "paid" ? "Super Admin" : null,
    paymentNotes: status === "paid" ? "Pembayaran via transfer bank" : null,
  };

  // Tambah transferProof untuk yang sudah paid
  if (status === "paid") {
    refill.transferProof = {
      fileName: `proof-${refillId}-${Date.now()}.jpg`,
      originalName: `bukti_transfer_${i}.jpg`,
      path: `/home/ubuntu/irc-print-server-staging/storage/proofs/proof-${refillId}.jpg`,
      size: randomInt(20000, 100000),
      mimetype: "image/jpeg",
      uploadedAt: refill.paidAt,
      url: `/storage/proofs/proof-${refillId}.jpg`,
    };
  }

  paperRefills.push(refill);
}

// Insert ke database
const refillResult = db.paperRefills.insertMany(paperRefills);
print(`✅ Inserted ${refillResult.insertedIds.length} paper refills`);

// ============================================
// 4. GENERATE 200+ PRINT JOBS
// ============================================

print("🔄 Generating printJobs data...");

const printJobs = [];

// Generate 250 print jobs
for (let i = 1; i <= 250; i++) {
  const jobDate = getRandomDate(90);
  const randomRefillIndex = Math.floor(Math.random() * refillIds.length);
  const refillId = refillIds[randomRefillIndex];

  // Cari refill untuk mendapatkan profitShare
  const refill = paperRefills.find((r) => r.refillId === refillId);
  const profitShare = refill ? refill.profitShare : 30;

  // Random job type
  const isColor = Math.random() < 0.4; // 40% color, 60% bw
  const totalPages = randomInt(1, 20);
  const copies = randomInt(1, 3);
  const pricePerPage = isColor ? 1500 : randomInt(400, 500);
  const totalCost = totalPages * copies * pricePerPage;
  const partnerProfit = Math.round((totalCost * profitShare) / 100);

  // Random status
  const jobStatus = Math.random() < 0.9 ? "completed" : "pending"; // 90% completed

  const jobId = `print-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`;

  const printJob = {
    jobId: jobId,
    id: jobId,
    printerId: PRINTER_ID,
    fileName: `document_${i}.pdf`,
    filePath: `/home/ubuntu/irc-print-server-staging/storage/uploads/${jobId}.pdf`,
    fileSize: randomInt(5000, 50000),
    fileContent: "",
    copies: randomInt(1, 3),
    colorPages: isColor ? [1, 2, 3].slice(0, Math.ceil(totalPages / 2)) : [],
    bwPages: !isColor
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [totalPages],
    totalPages: totalPages,
    totalCost: totalCost,
    phoneNumber: `08${randomInt(100000000, 999999999)}`,
    pointsToAdd: Math.floor(totalCost / 4000),
    settings: {
      copies: randomInt(1, 3),
      colorPages: isColor ? [1] : [],
      bwPages: !isColor ? [1] : [],
      totalPages: totalPages,
      printSettings: {
        paperSize: "A4",
        orientation: "PORTRAIT",
        quality: "NORMAL",
        margins: "NORMAL",
        duplex: false,
      },
    },
    status: jobStatus,
    createdAt: jobDate,
    updatedAt: jobDate,
    isRestored: Math.random() < 0.1, // 10% restored
    refillId: refillId,
    partnerProfit: partnerProfit,
    profitShare: profitShare,
    assignedTo: "raspberry-pi",
    processingAt: new Date(jobDate.getTime() + randomInt(1, 5) * 60 * 1000),
    statusMessage:
      jobStatus === "completed"
        ? "Print job completed successfully"
        : "Print job pending",
    completedAt:
      jobStatus === "completed"
        ? new Date(jobDate.getTime() + randomInt(5, 15) * 60 * 1000)
        : null,
  };

  printJobs.push(printJob);
}

// Insert ke database
const jobResult = db.printJobs.insertMany(printJobs);
print(`✅ Inserted ${jobResult.insertedIds.length} print jobs`);

// ============================================
// 5. UPDATE PAPER REFILLS DENGAN JOBS COVERED
// ============================================

print("🔄 Updating paperRefills with jobsCovered...");

// Kelompokkan print jobs berdasarkan refillId
const jobsByRefill = {};
printJobs.forEach((job) => {
  if (job.refillId) {
    if (!jobsByRefill[job.refillId]) {
      jobsByRefill[job.refillId] = [];
    }
    jobsByRefill[job.refillId].push(job.jobId);
  }
});

// Update setiap refill dengan jobsCovered
let updateCount = 0;
for (const [refillId, jobs] of Object.entries(jobsByRefill)) {
  const result = db.paperRefills.updateOne(
    { refillId: refillId },
    { $set: { jobsCovered: jobs } },
  );
  if (result.modifiedCount > 0) updateCount++;
}
print(`✅ Updated ${updateCount} paper refills with jobsCovered`);

// ============================================
// 6. VERIFIKASI HASIL
// ============================================

print("\n📊 ====== VERIFICATION ======");
const refillCount = db.paperRefills.countDocuments({ printerId: PRINTER_ID });
const jobsCount = db.printJobs.countDocuments({ printerId: PRINTER_ID });

print(`📦 Paper Refills: ${refillCount}`);
print(`🖨️ Print Jobs: ${jobsCount}`);

// Sample data
print("\n📋 Sample Paper Refill:");
printjson(db.paperRefills.findOne({ printerId: PRINTER_ID }));

print("\n📋 Sample Print Job:");
printjson(db.printJobs.findOne({ printerId: PRINTER_ID }));

print("\n✅ DONE! Data dummy berhasil digenerate!");
