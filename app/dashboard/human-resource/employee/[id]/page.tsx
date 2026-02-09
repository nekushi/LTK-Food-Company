import { getUser, getUserWorkData } from "@/dal/get-user";

export default async function EmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
  // params: { id: string };
}) {
  // const { id } = params;
  const { id } = await params;

  console.log(`params: ${id}`);

  const user = await getUser(id);

  // if (!user) return;
  // console.log(user);
  // console.log(user?.id);

  // console.log(user.);

  let employeeWorkData;

  if (user.role === "EMPLOYEE") {
    employeeWorkData = await getUserWorkData(user.id);
  }

  // const employeeWorkData = await getUserWorkData(user.id);

  // if (user.user.role)
  // console.log(user.user.role);
  // if (user.)
  // const data = await getUserWorkData(user.id);

  // if (!data) return <div>awit yah</div>;

  return (
    <div className="p-4">
      <h1>Target id: {user?.id}</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <pre>{JSON.stringify(employeeWorkData, null, 2)}</pre>
      {/* <h1>Target id: {data?.id}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre> */}
      {/* {id} */}
    </div>
  );
}
