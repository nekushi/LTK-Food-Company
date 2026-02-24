"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { deleteAccount } from "@/dal/accounts/delete-account";
import { EditAccountModal } from "./EditAccountModal";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  roleId?: string | null;
}

interface AccountsTableProps {
  initialAccounts: Account[];
}

export function AccountsTable({ initialAccounts }: AccountsTableProps) {
  const router = useRouter();
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    
    setIsDeleting(id);
    try {
      const result = await deleteAccount(id);
      if (result.success) {
        toast.success(result.message);
        router.refresh(); // Refresh the page to get the updated list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
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
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {initialAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-amber-700"
                  >
                    No accounts yet.
                  </td>
                </tr>
              ) : (
                initialAccounts.map((account) => (
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
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        {account.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      <button
                        onClick={() => setEditingAccount(account)}
                        className="text-amber-600 hover:text-amber-900 font-medium mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        disabled={isDeleting === account.id}
                        className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
                      >
                        {isDeleting === account.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          isOpen={true}
          onClose={() => setEditingAccount(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
