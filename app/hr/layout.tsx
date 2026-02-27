import HRLayoutSidebar from "@/components/role/human-resource/hrLayoutSidebar";

export default function HumanResourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen grid grid-cols-12">
      <HRLayoutSidebar />
      <main className="col-span-10 overflow-y-auto">{children}</main>
    </div>
  );
}
