import Header from "@/template/header";
import Link from "next/link";
import BtnLogout from "../../components/logouts/btnLogout";
import { logout } from "@/dal/login/get-user";
import BtnLogoutSPA from "@/components/logouts/btnLogoutSPA";

export default function DeliveryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ltk-blue-white)]">
      <Header />
      <header className="flex items-center justify-between border-b border-amber-200 bg-[var(--ltk-amber-50)] px-4 py-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-800">
          Delivery
        </h2>
        <BtnLogoutSPA />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
