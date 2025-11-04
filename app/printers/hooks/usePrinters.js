import { useState, useEffect } from "react";

export const usePrinters = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/printers");
      const result = await response.json();

      if (result.success) {
        setPrinters(result.printers);
      }
    } catch (error) {
      console.error("Error fetching printers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  return { printers, loading, fetchPrinters };
};
