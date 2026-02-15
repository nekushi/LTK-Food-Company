import { getUser, getUserWorkData } from "@/dal/get-user";
import { TypeEmployeeWorkData } from "@/index";

export default async function EmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log(`params: ${id}`);

  const user = await getUser(id);

  let employeeWorkData: TypeEmployeeWorkData | null = null;

  if (user.role === "EMPLOYEE") {
    employeeWorkData = await getUserWorkData(user.id);
  }

  return (
    <div className="p-4">
      <h1>Target id: {user?.id}</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      {employeeWorkData && (
        <pre>{JSON.stringify(employeeWorkData, null, 2)}</pre>
      )}
    </div>
  );
}
