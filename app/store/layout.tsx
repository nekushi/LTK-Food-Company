import StoreLayoutSidebar from "@/components/role/store/storeLayoutSidebar";
import { getCurrentUser } from "@/dal/get-current-user";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="h-screen grid grid-cols-12">
      <StoreLayoutSidebar firstName={user.firstName} lastName={user.lastName} username={user.username} />
      <main className="col-span-10 overflow-y-auto">{children}</main>
    </div>
  );
}
