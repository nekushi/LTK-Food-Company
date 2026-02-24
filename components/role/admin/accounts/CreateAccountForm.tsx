"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createUserAccount } from "@/dal/accounts/create-user-account";

const ROLES = ["ADMIN", "HR", "INVENTORY", "STORE", "DELIVERY"] as const;

export const createAccountSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Password is required"),
  roleId: z.string().optional(),
  role: z.enum(ROLES),
});

type AccountFormValues = z.infer<typeof createAccountSchema>;

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

interface CreateAccountFormProps {
  allowedRoles: typeof ROLES[number][];
  redirectPath: string;
}

export function CreateAccountForm({ allowedRoles, redirectPath }: CreateAccountFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      roleId: "",
      password: "",
      role: allowedRoles[0], // default to first allowed role
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    const result = await createUserAccount(data);

    if (result.success === "success" || result.success === true) {
      toast.success(result.message || "Account created successfully");
      router.push(redirectPath);
      router.refresh();
      reset();
    } else {
      toast.error(result.message || "Failed to create account");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-amber-900 mb-2">Create Account</h1>
      <p className="text-amber-800/80 mb-6">
        Create a new account. Select the appropriate role below.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm max-w-2xl"
      >
        <div className="mb-6">
          <span className={labelClass}>Role</span>
          <div className="mt-2 flex flex-wrap gap-4">
            {allowedRoles.map((role) => (
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
          {errors.role && (
            <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <div>
            <label className={labelClass}>First Name</label>
            <input type="text" {...register("firstName")} className={inputClass} />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input type="text" {...register("lastName")} className={inputClass} />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className={labelClass}>Role ID (optional)</label>
          <input type="text" {...register("roleId")} className={inputClass} />
          {errors.roleId && (
            <p className="mt-1 text-xs text-red-600">{errors.roleId.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className={labelClass}>Username</label>
          <input type="text" {...register("username")} className={inputClass} />
          {errors.username && (
            <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className={labelClass}>Password</label>
          <input type="password" {...register("password")} className={inputClass} />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="disabled:opacity-50 mt-6 rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
        >
          {isPending ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
