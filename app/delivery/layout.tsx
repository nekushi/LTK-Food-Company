import BtnLogoutSPA from "@/components/logouts/btnLogoutSPA";

export default function DeliveryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-amber-50/30">
      <header className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-5 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold font-serif text-amber-800 tracking-wide">LTK Food Company</h2>
          <span className="text-xs text-amber-600 border-l border-amber-300 pl-3">Delivery</span>
        </div>
        <BtnLogoutSPA />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
