"use client";

import { addUser } from "@/dal/post-user";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

import { FaArrowLeft } from "react-icons/fa6";
import Link from "next/link";

export default function CreateEmployee() {
  const [isRoleEmployee, setIsRoleEmployee] = useState<boolean>(true);
  const [state, addUserAction, isPending] = useActionState(addUser, undefined);

  const router = useRouter();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "EMPLOYEE") {
      setIsRoleEmployee(true);
    } else {
      setIsRoleEmployee(false);
    }
  };

  return (
    <div className="p-8">
      <div>
        <button className="underline underline-offset cursor-pointer mb-4">
          <Link
            href={"/dashboard/human-resource/employee"}
            className="flex items-center gap-1"
          >
            <FaArrowLeft className="text-xs underline" />
            back
          </Link>
        </button>
        <h2 className="text-xl font-medium mb-4 after:content-[''] after:block after:w-16 after:h-1.5 after:bg-amber-400">
          Add user
        </h2>
        <form
          action={addUserAction}
          //   className="p-4 border rounded-2xl flex flex-col w-1/4 *:border *:rounded *:px-2 *:py-1 space-y-2"
          className="flex flex-col flex-wrap gap-2 justify-start w-1/2"
        >
          <div className="basis-1/3 flex flex-col justify-start align-center">
            <label htmlFor="firstName" className="">
              First Name:{" "}
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div className="basis-1/3 flex flex-col justify-start align-center">
            <label htmlFor="lastName" className="">
              Last Name:{" "}
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div className="basis-1/3 flex flex-col justify-start align-center">
            <label htmlFor="username" className="">
              Username:{" "}
            </label>
            <input
              id="username"
              type="text"
              name="username"
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div className="basis-1/3 flex flex-col justify-start align-center">
            <label htmlFor="password" className="">
              Password:{" "}
            </label>
            <input
              id="password"
              type="text"
              name="password"
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div className="basis-1/3 flex flex-col justify-start align-center">
            <label htmlFor="role" className="">
              Role:
            </label>
            <select
              id="role"
              name="role"
              defaultValue={"EMPLOYEE"}
              onChange={handleRoleChange}
              className="border rounded px-2 py-1 w-full"
            >
              {/* <option value="ADMIN">Admin</option> */}
              <option value="HUMAN_RESOURCE">Human Resource</option>
              <option value="STOCK_MANAGER">Stock Manager</option>
              <option value="DELIVERY_PERSONNEL">Delivery Personnel</option>
              <option value="COLLABORATOR">Collaborator</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
            {isRoleEmployee && (
              <div className="mt-2 basis-1/3 flex flex-col justify-start align-center">
                <label htmlFor="employeeId" className="">
                  Employee ID:{" "}
                </label>
                <input
                  id="employeeId"
                  type="text"
                  name="employeeId"
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
            )}
          </div>
          <div className="flex flex-row w-full justify-between">
            <button
              type="submit"
              className="mt-4 py-2 w-36 border border-amber-300 rounded-md bg-amber-300 hover:bg-amber-300 active:bg-amber-500 transition"
            >
              Create user
            </button>
            <button
              type="reset"
              className="mt-4 py-2 w-36 border border-red-300 rounded-md hover:bg-red-300 hover:border-none active:bg-red-500 transition"
            >
              Clear form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
