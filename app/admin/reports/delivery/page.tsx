import { getDeliveryHistoryLast30Days } from "@/dal/admin/delivery-reports";
import DeliveryReportsClient from "./delivery-reports-client";

export const dynamic = "force-dynamic";

export default async function AdminReportsDeliveryPage() {
  const history = await getDeliveryHistoryLast30Days();

  const serialized = history.map((h) => ({
    ...h,
    createdAt: h.createdAt.toISOString(),
  }));

  return <DeliveryReportsClient history={serialized} />;
}


