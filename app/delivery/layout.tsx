import Header from "@/template/header";
import Link from "next/link";

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
        <Link
          href="/login"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
        >
          Logout
        </Link>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
