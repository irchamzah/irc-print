export const calculateDistance = (printerLocation, userLocation) => {
  if (!userLocation || !printerLocation) {
    return null;
  }

  let printerLat, printerLng;

  if (
    printerLocation.type === "Point" &&
    Array.isArray(printerLocation.coordinates)
  ) {
    [printerLng, printerLat] = printerLocation.coordinates;
  } else if (Array.isArray(printerLocation)) {
    [printerLng, printerLat] = printerLocation;
  } else if (printerLocation.lat && printerLocation.lng) {
    printerLat = printerLocation.lat;
    printerLng = printerLocation.lng;
  } else {
    return null;
  }

  if (
    typeof printerLat !== "number" ||
    typeof printerLng !== "number" ||
    isNaN(printerLat) ||
    isNaN(printerLng) ||
    typeof userLocation.lat !== "number" ||
    typeof userLocation.lng !== "number" ||
    isNaN(userLocation.lat) ||
    isNaN(userLocation.lng)
  ) {
    return null;
  }

  const R = 6371;
  const dLat = ((printerLat - userLocation.lat) * Math.PI) / 180;
  const dLng = ((printerLng - userLocation.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLocation.lat * Math.PI) / 180) *
      Math.cos((printerLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance < 1 ? distance.toFixed(2) : distance.toFixed(1);
};

export const getStatusIcon = (status) => {
  switch (status) {
    case "online":
      return "🟢";
    case "offline":
      return "🔴";
    case "maintenance":
      return "🟡";
    default:
      return "⚪";
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "offline":
      return "bg-red-500";
    case "maintenance":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};
