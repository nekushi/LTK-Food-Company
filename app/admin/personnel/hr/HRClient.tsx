"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { deleteAccount } from "@/dal/accounts/delete-account";

export function HRClient({ initialAccounts }: { initialAccounts: any[] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this HR account?")) return;

    startTransition(async () => {
      const result = await deleteAccount(id);
      if (result.success) {
        toast.success(result.message);
        setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link 
          href="/admin/personnel/hr/create" 
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Create HR Account
        </Link>
      </div>

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
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900 text-right">
                  Actions
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
                    No HR accounts found.
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
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900 text-right space-x-3">
                      <Link 
                        href={`/admin/personnel/hr/edit/${account.id}`}
                        className="text-amber-600 hover:text-amber-800 font-medium cursor-pointer"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(account.id)}
                        disabled={isPending}
                        className="text-red-500 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                      >
                        Delete
                      </button>
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
