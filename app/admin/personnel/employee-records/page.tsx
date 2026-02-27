export const dynamic = "force-dynamic";

import { getEmployees } from "@/app/hr/employees/dal/get-employees";
import EmployeeRecordsClient from "./EmployeeRecordsClient";

export default async function AdminEmployeeRecordsPage() {
  const employees = await getEmployees();

  return <EmployeeRecordsClient employees={employees} />;
}
