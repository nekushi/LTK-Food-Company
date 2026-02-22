"use client";

import { logout } from "@/dal/login/get-user";
import { useTransition } from "react";

export default function BtnLogoutSPA() {
  const [ispending, startTransition] = useTransition();

  const handleLogoutClick = () => {
    startTransition(async () => {
      await logout();
    });
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
