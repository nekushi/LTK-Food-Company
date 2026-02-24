"use client";

import { logout } from "@/dal/login/get-user";
import { useTransition } from "react";
import { FiLogOut } from "react-icons/fi";

export default function BtnLogout() {
  const [isPending, startTransition] = useTransition();

  const handleLogoutClick = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <button
      onClick={handleLogoutClick}
      disabled={isPending}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-amber-800 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
    >
      <FiLogOut className="text-lg" />
      {isPending ? "Logging out..." : "Log Out"}
    </button>
  );
}
