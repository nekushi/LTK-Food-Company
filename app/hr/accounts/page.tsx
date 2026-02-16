export const dynamic = "force-dynamic";

import { getAccounts } from "@/dal/accounts/get-accounts";
import Link from "next/link";

export default async function HRAccountsPage() {
  const accounts = await getAccounts();

  return (
    <div className="space-y-6 p-8">
      {/* <CreateAccountForm /> */}
      <Link href={"./accounts/create-account"}>Create Account</Link>
      <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full table-auto text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200 bg-amber-50">
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  First Name
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Last Name
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Username
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-amber-700"
                  >
                    No accounts yet.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-amber-100 hover:bg-amber-50/50"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {account.firstName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {account.lastName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {account.username}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {account.role}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
