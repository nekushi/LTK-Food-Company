import InventoryLayoutSidebar from "@/components/role/inventory/inventoryLayoutSidebar";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen grid grid-cols-12">
      <InventoryLayoutSidebar />
      <main className="col-span-10 overflow-y-auto">{children}</main>
    </div>
  );
}
