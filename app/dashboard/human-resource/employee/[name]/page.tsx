import { getUser, getUserWorkData } from "@/dal/get-user";

export default async function EmployeePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const userId = await getUser(id);

  if (!userId) return;

  const data = await getUserWorkData(userId.id);

  return (
    <div>
      <h1>Target id: {data?.id}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
