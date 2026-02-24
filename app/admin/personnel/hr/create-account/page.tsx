import { CreateAccountForm } from "@/components/role/admin/accounts/CreateAccountForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function CreateHRAccountPage() {
  return (
    <div className="space-y-6 p-8">
      <button className="underline underline-offset cursor-pointer mb-2 hover:text-yellow-600 block">
        <Link href={"/admin/personnel/hr"} className="flex items-center gap-1">
          <FaArrowLeft className="text-xs underline" />
          back to HR personnel
        </Link>
      </button>
      <CreateAccountForm allowedRoles={["HR"]} redirectPath="/admin/personnel/hr" />
    </div>
  );
}
