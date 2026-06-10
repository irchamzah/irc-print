// utils/normalizePhone.js

/**
 * Normalize phone number to Indonesian format 628xxxxxxxxxx
 *
 * @param {string} phone - Phone number to normalize (e.g., 081234567890, +6281234567890, 6281234567890, 81234567890)
 * @returns {string} Normalized phone number (e.g., 6281234567890) or null if invalid
 *
 * Examples:
 * - "081234567890" → "6281234567890"
 * - "+6281234567890" → "6281234567890"
 * - "6281234567890" → "6281234567890"
 * - "81234567890" → "6281234567890"
 * - "08123456789" (11 digit) → "628123456789"
 * - Invalid → null
 */
export function normalizePhoneNumber(phone) {
  if (!phone || typeof phone !== "string") {
    return null;
  }

  // Remove all non-digit characters
  let cleaned = phone.toString().replace(/\D/g, "");

  // Handle Indonesian phone number formats
  if (cleaned.startsWith("0")) {
    // 081234567890 → 6281234567890
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    // 81234567890 → 6281234567890
    cleaned = "62" + cleaned;
  } else if (cleaned.startsWith("62")) {
    // 6281234567890 → keep as is
    cleaned = cleaned;
  } else {
    // Invalid format
    return null;
  }

  // Remove any remaining '+' prefix
  cleaned = cleaned.replace(/^\+/, "");

  // Validate final format: should be 62xxxxxxxxx (10-14 digits total)
  if (!/^62\d{8,12}$/.test(cleaned)) {
    return null;
  }

  return cleaned;
}

/**
 * Validate if phone number is in correct 628 format
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export function isValidPhoneNumber(phone) {
  return phone && typeof phone === "string" && /^62\d{8,12}$/.test(phone);
}

/**
 * Format phone number for display (add + prefix)
 * @param {string} phone - Phone number in 628 format
 * @returns {string} Phone number with + prefix (e.g., +6281234567890)
 */
export function formatPhoneDisplay(phone) {
  if (!phone) return "";
  const normalized = normalizePhoneNumber(phone);
  return normalized ? "+" + normalized : phone;
}
