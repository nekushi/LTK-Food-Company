export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAllUsers } from "@/dal/get-user";
import { TypeUser } from "@/index";

export default async function Employee() {
  const users = await getAllUsers();

  return (
    <div className="p-8">
      <h2>This is employee section</h2>
      <h2 className="text-lg">Manage Employee</h2>
      <Link
        href={"/dashboard/human-resource/employee/create-employee"}
        className="border rounded px-2 py-1 block w-fit mb-8"
      >
        Create User
      </Link>
      <div className="p-4 [&>div]:p-4 [&>div]:border [&>div]:border-blue-100 [&>div]:shadow-md">
        <h3 className="mb-4 text-xl font-semibold">List of Users:</h3>
        {users.map((user: TypeUser) => {
          console.log(user.id);

          return (
            <div key={user.id} className="rounded-xs hover:bg-blue-50">
              <p className="text-2xl font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs lowercase text-blue-500 font-bold">
                {user.role}
              </p>
              <Link
                href={`/dashboard/human-resource/employee/${user.id}`}
                className="border block w-fit px-4 py-2 rounded-sm mt-4 font-medium bg-amber-300 hover:bg-amber-400 active:bg-amber-500 transition"
              >
                Manage user
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
