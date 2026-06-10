// app/hub/admin/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHubAuth } from "../auth/hooks/useHubAuth";

// 🥸AdminRedirect /app/hub/admin/page.js TERPAKAI
export default function AdminRedirect() {
  const router = useRouter();
  const { user } = useHubAuth();

  useEffect(() => {
    if (user?.role === "super_admin") {
      router.push("/hub/admin/paper-refills");
    } else {
      router.push("/hub");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );
}
