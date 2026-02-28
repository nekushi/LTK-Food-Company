"use client";

import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

export default function BtnLogout() {
  const router = useRouter();

  const handleLogoutClick = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("role");
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
