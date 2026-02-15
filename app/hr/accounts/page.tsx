"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ROLES = [
  "ADMIN",
  "INVENTORY PERSONNEL",
  "STORE ACCOUNT",
  "DELIVERY PERSONNEL",
] as const;

const accountSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(ROLES),
  accountActive: z.boolean().optional(),
  requirePasswordChange: z.boolean().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

type AccountRow = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
};

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

export default function HRAccountsPage() {
  const [rows, setRows] = useState<AccountRow[]>([
    {
      id: "d1",
      firstName: "Maria",
      lastName: "Santos",
      username: "msantos",
      role: "STORE ACCOUNT",
    },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema) as Resolver<AccountFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      role: "STORE ACCOUNT",
      accountActive: true,
      requirePasswordChange: false,
    },
  });

  const onSubmit = (data: AccountFormValues) => {
    const row: AccountRow = {
      id: String(Date.now()),
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      role: data.role,
    };
    setRows((prev) => [row, ...prev]);
    reset({ ...data, password: "", firstName: "", lastName: "", username: "" });
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-xl font-semibold text-amber-900">Accounts</h1>
      <p className="text-amber-800/80">
        Create role-based users. Data row below shows details (password hidden).
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              type="text"
              {...register("firstName")}
              className={inputClass}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input
              type="text"
              {...register("lastName")}
              className={inputClass}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Username</label>
          <input type="text" {...register("username")} className={inputClass} />
          {errors.username && (
            <p className="mt-1 text-xs text-red-600">
              {errors.username.message}
            </p>
          )}
        </div>
        <div className="mt-4">
          <label className={labelClass}>Password</label>
          <input
            type="password"
            {...register("password")}
            className={inputClass}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="mt-4">
          <span className={labelClass}>Role</span>
          <div className="mt-2 flex flex-wrap gap-4">
            {ROLES.map((role) => (
              <label
                key={role}
                className="flex cursor-pointer items-center gap-2 text-sm text-amber-900"
              >
                <input
                  type="radio"
                  {...register("role")}
                  value={role}
                  className="h-4 w-4 border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6 border-t border-amber-200 pt-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-amber-900">
            <input
              type="checkbox"
              {...register("accountActive")}
              className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            Account active
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-amber-900">
            <input
              type="checkbox"
              {...register("requirePasswordChange")}
              className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            Require password change on first login
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Create account
        </button>
      </form>

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
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-amber-700"
                  >
                    No accounts yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-amber-100 hover:bg-amber-50/50"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {row.firstName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {row.lastName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {row.username}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {row.role}
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
