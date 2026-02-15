import InventoryLayoutSidebar from "@/components/role/inventory/inventoryLayoutSidebar";
import Header from "@/template/header";

export default function HumanResourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <div className="h-screen grid grid-cols-12">
        <InventoryLayoutSidebar />
        <div className="col-span-10">{children}</div>
      </div>
    </div>
  );
}
