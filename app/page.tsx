"use client";

import Link from "next/link";
import { addUser } from "@/dal/user";
import { useActionState, useState } from "react";

export default function LoginPage() {
  const [isRoleEmployee, setIsRoleEmployee] = useState<boolean>(true);
  const [state, addUserAction, isPending] = useActionState(addUser, undefined);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "EMPLOYEE") {
      setIsRoleEmployee(true);
    } else {
      setIsRoleEmployee(false);
    }
  };

  return (
    <div className="p-4">
      <div className="p-4">
        <p>This is login page.</p>
        <Link href={"/dashboard/"} className="border py-1 px-2 rounded">
          Go to Dashboard
        </Link>
      </div>
      <form
        action={addUserAction}
        className="p-4 border rounded-2xl flex flex-col w-1/4 *:border *:rounded *:px-2 *:py-1 space-y-2"
      >
        <h2 className="text-xl">Add user</h2>
        First Name: <input type="text" name="firstName" />
        Last Name:
        <input type="text" name="lastName" />
        Username:
        <input type="text" name="username" />
        Password
        <input type="text" name="password" />
        Role:
        <select
          name="role"
          id="browser"
          defaultValue={"EMPLOYEE"}
          onChange={handleRoleChange}
        >
          {/* <option value="ADMIN">Admin</option> */}
          <option value="HUMAN_RESOURCE">Human Resource</option>
          <option value="STOCK_MANAGER">Stock Manager</option>
          <option value="DELIVERY_PERSONNEL">Delivery Personnel</option>
          <option value="COLLABORATOR">Collaborator</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
        {isRoleEmployee && (
          <>
            <p>Employee ID:</p>
            <input type="text" name="employeeId" />
          </>
        )}
        <button type="submit" className="hover:bg-blue-100">
          Add user
        </button>
      </form>
    </div>
  );
}
