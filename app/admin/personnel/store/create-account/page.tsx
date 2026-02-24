import { CreateAccountForm } from "@/components/role/admin/accounts/CreateAccountForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function CreateStoreAccountPage() {
  return (
    <div className="space-y-6 p-8">
      <button className="underline underline-offset cursor-pointer mb-2 hover:text-yellow-600 block">
        <Link href={"/admin/personnel/store"} className="flex items-center gap-1">
          <FaArrowLeft className="text-xs underline" />
          back to store personnel
        </Link>
      </button>
      <CreateAccountForm allowedRoles={["STORE"]} redirectPath="/admin/personnel/store" />
    </div>
  );
}
