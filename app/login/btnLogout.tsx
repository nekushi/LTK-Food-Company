"use client";

import { logout } from "@/dal/login/get-user";
import { useTransition } from "react";

export default function BtnLogout() {
  const [ispending, startTransition] = useTransition();

  const handleLogoutClick = () => {
    startTransition(async () => {
      await logout();
    });
  };
  return (
    <button
      onClick={handleLogoutClick}
      className="py-2 rounded-md font-medium bg-blue-100 hover:bg-blue-200 active:bg-blue-300"
    >
      Log Out
    </button>
  );
}
