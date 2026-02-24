import AdminLayoutSidebar from "@/components/role/admin/adminLayoutSidebar";
import Header from "@/template/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <div className="h-screen grid grid-cols-12">
        <AdminLayoutSidebar />
        <div className="col-span-10">{children}</div>
      </div>
    </div>
  );
}
