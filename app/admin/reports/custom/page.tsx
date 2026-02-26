import { getAdminStores } from "@/dal/admin/manage-branch";
import CustomReportClient from "./custom-report-client";

export const dynamic = "force-dynamic";

export default async function CustomReportsPage() {
  const storesResult = await getAdminStores();
  const stores = storesResult.success ? storesResult.data : [];
  const enhancedStores = [
    { id: "all", storeName: "All Branches", username: "all" },
    ...stores,
  ];

  return <CustomReportClient stores={enhancedStores} mode="both" initialType="sales" />;
}
