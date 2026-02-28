"use client";

import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { clearAuth } from "@/lib/auth-storage";

export default function BtnLogout() {
  const router = useRouter();

  const handleLogoutClick = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogoutClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-amber-800 hover:bg-red-100 hover:text-red-700 transition-colors"
    >
      <FiLogOut className="text-lg" />
      Log Out
    </button>
  );
}
