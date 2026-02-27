import AdminLayoutSidebar from "@/components/role/admin/adminLayoutSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen grid grid-cols-12">
      <AdminLayoutSidebar />
      <main className="col-span-10 overflow-y-auto">{children}</main>
    </div>
  );
}
