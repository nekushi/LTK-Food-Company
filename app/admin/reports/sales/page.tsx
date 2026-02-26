import { getAdminStores } from "@/dal/admin/manage-branch";
import CustomReportClient from "../custom/custom-report-client";

export const dynamic = "force-dynamic";

export default async function AdminReportsSalesPage() {
  const storesResult = await getAdminStores();
  const stores = storesResult.success ? storesResult.data : [];
  const enhancedStores = [
    { id: "all", storeName: "All Branches", username: "all" },
    ...stores,
  ];

  return <CustomReportClient stores={enhancedStores} mode="sales" initialType="sales" />;
}
