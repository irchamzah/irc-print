import { useState, useEffect } from "react";

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.log("Location access denied:", error);
          }
        );
      }
    };

    getUserLocation();
  }, []);

  return { userLocation };
};
