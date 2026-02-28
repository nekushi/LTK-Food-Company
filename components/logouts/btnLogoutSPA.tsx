"use client";

import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth-storage";

export default function BtnLogoutSPA() {
  const router = useRouter();

  const handleLogoutClick = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogoutClick}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
    >
      Logout
    </button>
  );
}
