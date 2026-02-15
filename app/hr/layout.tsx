import HRLayoutSidebar from "@/components/role/human-resource/hrLayoutSidebar";
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
        <HRLayoutSidebar />
        <div className="col-span-10">{children}</div>
      </div>
    </div>
  );
}
