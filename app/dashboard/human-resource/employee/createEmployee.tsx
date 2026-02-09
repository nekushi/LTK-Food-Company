"use client";

import { useActionState, useState } from "react";
import ExcelForm from "../excel";
import { addUser } from "@/dal/post-user";

export default function CreateEmployee() {
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
      <div>
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

        <ExcelForm />
      </div>
    </div>
  );
}
