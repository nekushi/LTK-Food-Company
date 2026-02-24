import { getAccountsByRole } from "@/dal/accounts/get-accounts-by-role";
import { AccountsTable } from "@/components/role/admin/accounts/AccountsTable";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export const dynamic = "force-dynamic";

export default async function AdminStorePage() {
  const accounts = await getAccountsByRole("STORE");

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <button className="underline underline-offset cursor-pointer mb-2 hover:text-yellow-600 block">
            <Link href={"/admin"} className="flex items-center gap-1">
              <FaArrowLeft className="text-xs underline" />
              back to dashboard
            </Link>
          </button>
          <h1 className="text-2xl font-bold text-amber-900">Store Personnel</h1>
          <p className="text-amber-700">Manage Store accounts</p>
        </div>
        <Link 
          href="/admin/personnel/store/create-account"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
        >
          Create Store Account
        </Link>
      </div>

      <AccountsTable initialAccounts={accounts as any} />
    </div>
  );
}
