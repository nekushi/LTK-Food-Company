import StoreLayoutSidebar from "@/components/role/store/storeLayoutSidebar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen grid grid-cols-12">
      <StoreLayoutSidebar />
      <main className="col-span-10 overflow-y-auto">{children}</main>
    </div>
  );
}
