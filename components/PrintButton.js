import { useState } from "react";

export default function PrintButton({ file, settings, printerId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePrint = async () => {
    if (!file || !printerId) {
      alert("Please select file and printer first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("copies", settings.copies || 1);
      formData.append("printerId", printerId);
      formData.append("colorPages", JSON.stringify(settings.colorPages || []));
      formData.append("bwPages", JSON.stringify(settings.bwPages || []));

      const response = await fetch("/api/print", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setResult({ type: "success", message: "Print job sent successfully!" });
        alert("✅ Print job sent! Check your printer.");
      } else {
        setResult({ type: "error", message: result.error });
        alert("❌ Print failed: " + result.error);
      }
    } catch (error) {
      setResult({ type: "error", message: "Network error: " + error.message });
      alert("❌ Network error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        disabled={loading || !file || !printerId}
        className="print-button"
      >
        {loading ? "Sending to Printer..." : "🖨️ Print Now"}
      </button>

      {result && (
        <div className={`result ${result.type}`}>{result.message}</div>
      )}
    </div>
  );
}
