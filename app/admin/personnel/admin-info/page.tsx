export const dynamic = "force-dynamic";

import { getAccounts } from "@/dal/accounts/get-accounts";
import Link from "next/link";
import { FiPlus, FiUsers } from "react-icons/fi";
import AccountsClient from "@/app/hr/accounts/accounts-client";

export default async function AdminInfoPage() {
  const accounts = await getAccounts();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
            <FiUsers className="text-amber-700" />
            All Accounts
          </h1>
          <p className="text-sm text-amber-700/80 mt-1">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""} across all roles
          </p>
        </div>
        <Link
          href="/admin/personnel/hr/create-account"
          className="flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition-colors"
        >
          <FiPlus className="text-base" />
          Create Account
        </Link>
      </div>

      <AccountsClient accounts={accounts} accountDetailBasePath="/admin/personnel/admin-info" />
    </div>
  );
}
