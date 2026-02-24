import HRLayoutSidebar from "@/components/role/human-resource/hrLayoutSidebar";
import { getCurrentUser } from "@/dal/get-current-user";

export default async function HumanResourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="h-screen grid grid-cols-12">
      <HRLayoutSidebar firstName={user.firstName} lastName={user.lastName} />
      <main className="col-span-10 overflow-y-auto">{children}</main>
    </div>
  );
}
