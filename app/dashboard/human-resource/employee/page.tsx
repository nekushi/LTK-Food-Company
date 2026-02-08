import Link from "next/link";
import Button from "./btnCreateUser";

export default function Employee() {
  return (
    <div className="p-4">
      <h2>This is employee section</h2>
      <h2 className="text-lg">Manage Employee</h2>
      <Link
        href={"/dashboard/human-resource/employee/create-employee"}
        className="border rounded px-2 py-1"
      >
        Create User
      </Link>
    </div>
  );
}
