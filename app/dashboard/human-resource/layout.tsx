import Header from "@/template/header";
import LayoutSidebar from "./layoutSidebar";

export default function HumanResourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      <div className="h-screen grid grid-cols-12">
        <LayoutSidebar />
        <div className="col-span-10">{children}</div>
      </div>
    </div>
  );
}
