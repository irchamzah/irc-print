"use client";
import { Suspense, useState } from "react";
import { useHubAuth } from "../../auth/hooks/useHubAuth";
import { AdminLayout } from "../components/AdminLayout";
import { useAdminPlatformSettings } from "./hooks/useAdminPlatformSettings";
import { SettingsForm } from "./components/SettingsForm";

const tabs = [
  { id: "users", label: "👥 Users", href: "/hub/admin/users" },
  { id: "printers", label: "🖨️ Printers", href: "/hub/admin/printers" },
  {
    id: "refills",
    label: "💰 Paper Refills",
    href: "/hub/admin/paper-refills",
  },
  {
    id: "printer-models",
    label: "📦 Printer Models",
    href: "/hub/admin/printer-models",
  },
  {
    id: "platform-settings",
    label: "⚙️ Platform Settings",
    href: "/hub/admin/platform-settings",
  },
  {
    id: "withdrawals",
    label: "🏦 Withdrawals",
    href: "/hub/admin/partner-withdrawals",
  },
  {
    id: "raspberry-devices",
    label: "💻 Raspberry Devices",
    href: "/hub/admin/raspberry-devices",
  },
];

function PlatformSettingsContent() {
  const { isSuperAdmin } = useHubAuth();
  const { settings, loading, saving, updateSettings, refresh } =
    useAdminPlatformSettings();
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isSuperAdmin()) return null;

  const handleSubmit = async (formData) => {
    const result = await updateSettings(formData);
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await refresh();
    } else {
      alert("❌ Gagal menyimpan: " + result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          ⚙️ Pengaturan Platform
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Konfigurasi global untuk seluruh sistem
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-600">
            ✅ Pengaturan berhasil disimpan
          </p>
        </div>
      )}

      <SettingsForm
        settings={settings}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span className="ml-2 text-gray-500">Memuat...</span>
    </div>
  );
}

export default function AdminPlatformSettingsPage() {
  return (
    <AdminLayout tabs={tabs} activeTab="platform-settings">
      <Suspense fallback={<LoadingFallback />}>
        <PlatformSettingsContent />
      </Suspense>
    </AdminLayout>
  );
}
