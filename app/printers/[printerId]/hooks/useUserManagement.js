import { useState } from "react";
import { useParams } from "next/navigation";
import { normalizePhoneNumber } from "@/utils/normalizePhone";

// useUserManagement - UPDATED dengan normalisasi nomor
export const useUserManagement = () => {
  const params = useParams();
  const printerId = params?.printerId;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [userPoints, setUserPoints] = useState(null);
  const [checkingPoints, setCheckingPoints] = useState(false);
  const [refreshingPoints, setRefreshingPoints] = useState(false);
  const [userSession, setUserSession] = useState(null);

  // ============================================
  // getPrinterPointDivider
  // ============================================
  const getPrinterPointDivider = async () => {
    try {
      const cached = localStorage.getItem(`printer_${printerId}_pointDivider`);

      if (cached) {
        const { value, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          return value;
        }
      }

      const response = await fetch(`/api/printers/${printerId}/point-divider`);
      const data = await response.json();

      const pointDivider = data.pointDivider || 4000;

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
      return 4000;
    }
  };

  // ============================================
  // handlePhoneNumberChange
  // ============================================
  const handlePhoneNumberChange = (newPhoneNumber) => {
    setPhoneNumber(newPhoneNumber);
  };

  // ============================================
  // loadUserSession
  // ============================================
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

  // ============================================
  // checkUserPoints - Check user points via API
  // ============================================
  const checkUserPoints = async () => {
    if (!phoneNumber.trim()) {
      alert("Silakan masukkan nomor HP terlebih dahulu");
      return;
    }

    // ✅ Normalisasi nomor telepon ke format 628...
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhone) {
      alert("Nomor HP tidak valid. Pastikan nomor sudah benar.");
      return;
    }

    setCheckingPoints(true);
    try {
      // ✅ Kirim normalizedPhone ke API
      const response = await fetch(
        `/api/users/${encodeURIComponent(normalizedPhone)}/points?printerId=${printerId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.user) {
          const points = result.points || result.user?.points || 0;
          setUserPoints(points);

          const userData = {
            phone: normalizedPhone,
            points: points,
            name: result.user?.name || `User ${normalizedPhone}`,
            userId: result.user?.userId,
            role: result.user?.role || "customer",
            timestamp: Date.now(),
          };
          setUserSession(userData);
          localStorage.setItem("userSession", JSON.stringify(userData));

          alert(`✅ Berhasil login! Anda memiliki ${points.toFixed(2)} point.`);
        } else if (result.user === null) {
          await createNewUserDirect(normalizedPhone);
        }
      } else {
        throw new Error(result.error || "Gagal Login");
      }
    } catch (error) {
      console.error("❌ Error checking points:", error);
      await createNewUserDirect(normalizedPhone, true);
    } finally {
      setCheckingPoints(false);
    }
  };

  // ============================================
  // createNewUserDirect
  // ============================================
  const createNewUserDirect = async (phone, isFallback = false) => {
    try {
      // ✅ Phone sudah dalam format 628...
      const pointDivider = await getPrinterPointDivider();

      const createResponse = await fetch(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          name: `User ${phone}`,
          role: "customer",
        }),
      });

      if (createResponse.ok) {
        const result = await createResponse.json();

        if (result.success && result.data) {
          const userData = {
            phone: phone,
            points: 0,
            name: result.data.name || `User ${phone}`,
            userId: result.data.userId,
            role: result.data.role || "customer",
            timestamp: Date.now(),
          };
          setUserPoints(0);
          setUserSession(userData);
          localStorage.setItem("userSession", JSON.stringify(userData));

          if (isFallback) {
            alert("✅ Nomor HP berhasil didaftarkan! Mulai dengan 0 point.");
          } else {
            alert(
              "✅ Akun baru berhasil dibuat! Anda mendapatkan 0 point awal.",
            );
          }
        } else {
          throw new Error(result.error || "Gagal membuat user baru");
        }
      } else {
        console.warn("⚠️ API create user failed, using local fallback");
        await createLocalUserFallback(phone);
      }
    } catch (error) {
      console.error("❌ Error creating user:", error);
      await createLocalUserFallback(phone);
    }
  };

  // ============================================
  // createLocalUserFallback
  // ============================================
  const createLocalUserFallback = async (phone) => {
    const userData = {
      phone: phone,
      points: 0,
      name: `User ${phone}`,
      userId: `local-${Date.now()}`,
      role: "customer",
      timestamp: Date.now(),
    };
    setUserPoints(0);
    setUserSession(userData);
    localStorage.setItem("userSession", JSON.stringify(userData));

    alert("⚠️ Sistem point sedang maintenance. Lanjut dengan 0 point.");
  };

  // ============================================
  // logoutUser
  // ============================================
  const logoutUser = () => {
    setUserSession(null);
    setUserPoints(null);
    setPhoneNumber("");
    localStorage.removeItem("userSession");
  };

  return {
    phoneNumber,
    userPoints,
    checkingPoints,
    refreshingPoints,
    userSession,
    setPhoneNumber,
    setUserPoints,
    setCheckingPoints,
    setRefreshingPoints,
    setUserSession,
    handlePhoneNumberChange,
    loadUserSession,
    checkUserPoints,
    logoutUser,
    createNewUserDirect,
    getPrinterPointDivider,
  };
};
