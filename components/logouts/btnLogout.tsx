"use client";

import { logout } from "@/dal/login/get-user";
import { useTransition } from "react";
import { FiLogOut } from "react-icons/fi";

export default function BtnLogout() {
  const [isPending, startTransition] = useTransition();

  const handleLogoutClick = () => {
    startTransition(async () => {
      // Clear localStorage-based auth/account data for the *current* account only.
      if (typeof window !== "undefined") {
        try {
          const currentId = window.localStorage.getItem("ltk:currentAccountId");

          // Flat keys always represent the active session; safe to clear.
          window.localStorage.removeItem("userId");
          window.localStorage.removeItem("username");
          window.localStorage.removeItem("role");
          window.localStorage.removeItem("storeId");

          if (currentId) {
            // Remove this account's namespaced payload only.
            const accountKey = `ltk:account:${currentId}`;
            window.localStorage.removeItem(accountKey);

            // Update registry to remove just this account, keep others.
            const registryKey = "ltk:accounts";
            const raw = window.localStorage.getItem(registryKey);
            if (raw) {
              try {
                const parsed = JSON.parse(raw) as {
                  userId: string;
                  username: string | null;
                  role: string | null;
                }[];
                const filtered = parsed.filter((a) => a.userId !== currentId);
                window.localStorage.setItem(
                  registryKey,
                  JSON.stringify(filtered),
                );
              } catch {
                // ignore parse errors; leave registry as-is
              }
            }
          }

          // Clear current pointer; other accounts remain intact.
          window.localStorage.removeItem("ltk:currentAccountId");
        } catch {
          // ignore localStorage errors
        }
      }

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
