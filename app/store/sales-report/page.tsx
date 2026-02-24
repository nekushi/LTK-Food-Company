import { Suspense } from "react";
import StoreSalesReportClient from "./sales-report";
import { getSalesReports } from "@/dal/store/sales-report";

export default async function StoreSalesReportPage() {
  const result = await getSalesReports();
  const salesReports = result.success ? result.data : [];

  return (
    <Suspense fallback={<div className="p-8 text-amber-900">Loading sales reports...</div>}>
      <StoreSalesReportClient initialReports={salesReports} />
    </Suspense>
  );
}
