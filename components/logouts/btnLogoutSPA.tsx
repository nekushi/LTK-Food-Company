"use client";

import { useRouter } from "next/navigation";

export default function BtnLogoutSPA() {
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
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
    >
      Logout
    </button>
  );
}
