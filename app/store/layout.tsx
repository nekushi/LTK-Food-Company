import StoreLayoutSidebar from "@/components/role/store/storeLayoutSidebar";
import Header from "@/template/header";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <div className="h-screen grid grid-cols-12">
        <StoreLayoutSidebar />
        <div className="col-span-10">{children}</div>
      </div>
    </div>
  );
}
