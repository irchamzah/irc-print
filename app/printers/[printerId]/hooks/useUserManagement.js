// app/printers/[printerId]/hooks/useUserManagement.js
import { useState } from "react";
import { useParams } from "next/navigation";

// useUserManagement TERPAKAI
export const useUserManagement = () => {
  const params = useParams();
  const printerId = params?.printerId;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [userPoints, setUserPoints] = useState(null);
  const [checkingPoints, setCheckingPoints] = useState(false);
  const [refreshingPoints, setRefreshingPoints] = useState(false);
  const [userSession, setUserSession] = useState(null);

  // 🌐 getPrinterPointDivider /app/printers/[printerId]/hooks/useUserManagement.js TERPAKAI
  const getPrinterPointDivider = async () => {
    try {
      const cached = localStorage.getItem(`printer_${printerId}_pointDivider`);

      if (cached) {
        const { value, timestamp } = JSON.parse(cached);
        // Cache selama 1 jam
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          return value;
        }
      }

      // Ambil dari API
      const response = await fetch(`/api/printers/${printerId}/point-divider`);
      const data = await response.json();

      const pointDivider = data.pointDivider;

      // Simpan ke localStorage
      localStorage.setItem(
        `printer_${printerId}_pointDivider`,
        JSON.stringify({
          value: pointDivider,
          timestamp: Date.now(),
        }),
      );

      return pointDivider;
    } catch (error) {
      console.error("Error getting point divider:", error);
      return null; // Default fallback
    }
  };

  // 🌐 handlePhoneNumberChange /app/printers/[printerId]/hooks/useUserManagement.js TERPAKAI
  const handlePhoneNumberChange = (newPhoneNumber) => {
    setPhoneNumber(newPhoneNumber);
  };

  // 🌐 loadUserSession /app/printers/[printerId]/hooks/useUserManagement.js TERPAKAI
  const loadUserSession = () => {
    const savedSession = localStorage.getItem("userSession");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
        setUserSession(session);
        setUserPoints(session.points);
        setPhoneNumber(session.phone);
      } else {
        localStorage.removeItem("userSession");
      }
    }
  };

  // 🌐 checkUserPoints /app/printers/[printerId]/hooks/useUserManagement.js TERPAKAI
  const checkUserPoints = async () => {
    if (!phoneNumber.trim()) {
      alert("Silakan masukkan nomor HP terlebih dahulu");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      alert("Nomor HP harus minimal 10 digit");
      return;
    }

    setCheckingPoints(true);
    try {
      const response = await fetch(
        `/api/users/${cleanPhone}/points?printerId=${printerId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.user) {
          setUserPoints(result.points);
          const userData = {
            phone: cleanPhone,
            points: result.points,
            name: result.user.name || `User ${cleanPhone}`,
            timestamp: Date.now(),
          };
          setUserSession(userData);
          localStorage.setItem("userSession", JSON.stringify(userData));

          alert(
            `✅ Berhasil login! Anda memiliki ${result.points.toFixed(
              2,
            )} point.`,
          );
        } else if (result.user === null) {
          await createNewUserDirect(cleanPhone);
        }
      } else {
        throw new Error(result.error || "Gagal Login");
      }
    } catch (error) {
      console.error("❌ Error checking points:", error);
      await createNewUserDirect(cleanPhone, true);
    } finally {
      setCheckingPoints(false);
    }
  };

  // 🌐 createNewUserDirect /app/printers/[printerId]/hooks/useUserManagement.js TERPAKAI
  const createNewUserDirect = async (phone, isFallback = false) => {
    try {
      // Dapatkan point divider dari printer
      const pointDivider = await getPrinterPointDivider();

      const createResponse = await fetch(`/api/users/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          points: 0,
          amount: 0,
          orderId: `init-${Date.now()}`,
          pointDivider: pointDivider,
          fileName: "user-initialization.pdf",
        }),
      });

      if (createResponse.ok) {
        const result = await createResponse.json();
        const userData = {
          phone: phone,
          points: 0,
          name: `User ${phone}`,
          timestamp: Date.now(),
        };
        setUserPoints(0);
        setUserSession(userData);
        localStorage.setItem("userSession", JSON.stringify(userData));

        if (isFallback) {
          alert("✅ Nomor HP berhasil didaftarkan! Mulai dengan 0 point.");
        } else {
          alert("✅ Akun baru berhasil dibuat! Anda mendapatkan 0 point awal.");
        }
      } else {
        throw new Error("Gagal membuat user baru");
      }
    } catch (error) {
      console.error("❌ Error creating user:", error);
      const userData = {
        phone: phone,
        points: 0,
        name: `User ${phone}`,
        timestamp: Date.now(),
      };
      setUserPoints(0);
      setUserSession(userData);
      localStorage.setItem("userSession", JSON.stringify(userData));

      alert("⚠️ Sistem point sedang maintenance. Lanjut dengan 0 point.");
    }
  };

  // 🌐 logoutUser /app/printers/[printerId]/hooks/useUserManagement.js TERPAKAI
  const logoutUser = () => {
    setUserSession(null);
    setUserPoints(null);
    setPhoneNumber("");
    localStorage.removeItem("userSession");
  };

  return {
    // States
    phoneNumber,
    userPoints,
    checkingPoints,
    refreshingPoints,
    userSession,

    // Setters
    setPhoneNumber,
    setUserPoints,
    setCheckingPoints,
    setRefreshingPoints,
    setUserSession,

    // Functions
    handlePhoneNumberChange,
    loadUserSession,
    checkUserPoints,
    logoutUser,
    createNewUserDirect,
    getPrinterPointDivider, // Export untuk digunakan di komponen lain
  };
};
