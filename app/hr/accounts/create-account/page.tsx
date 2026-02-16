"use client";

import { Activity, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { createUserAccount } from "@/app/actions/create-user-account";
import { AccountRow } from "@/index";
import { accountSchema } from "@/schemas/account.schema";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createUserAccount } from "@/dal/accounts/create-user-account";

// export const accountSchema = z.object({
//   firstName: z.string().min(1, "Required"),
//   lastName: z.string().min(1, "Required"),
//   username: z.string().min(1, "Required"),
//   password: z.string().min(1, "Password is required"),
//   role: z.enum(ROLES),
//   accountActive: z.boolean().optional(),
//   requirePasswordChange: z.boolean().optional(),
// });

const ROLES = ["ADMIN", "HR", "INVENTORY", "STORE", "DELIVERY"] as const;

type AccountFormValues = z.infer<typeof accountSchema>;

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

export default function CreateAccountForm() {
  const [isNameFieldVisible, setINameFieldVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema) as Resolver<AccountFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      roleId: "",
      password: "",
      role: "ADMIN",
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    // console.log(data);

    const row: z.infer<typeof accountSchema> = {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      roleId: data.roleId,
      password: data.password,
      role: data.role,
    };
    // setRows((prev) => [row, ...prev]);
    // const result = await createUserAccount(row).then((xd) => {
    //   console.log(xd);
    //   toast(xd.user.firstName);
    // });
    const result = await createUserAccount(row);

    if (result.success) {
      toast.success(result.message);
      router.push("/hr/accounts");
      reset();
    }

    if (result)
      reset({
        ...data,
        password: "",
        firstName: "",
        lastName: "",
        username: "",
        roleId: "",
      });
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-amber-900">Accounts</h1>
      <p className="text-amber-800/80">
        Create role-based users. Data row below shows details (password hidden).
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm"
      >
        <div className="mt-4">
          <span className={labelClass}>Role</span>
          <div className="mt-2 flex flex-wrap gap-4 mb-8">
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
          <label className={labelClass}>Role ID (optional)</label>
          <input type="text" {...register("roleId")} className={inputClass} />
          {errors.roleId && (
            <p className="mt-1 text-xs text-red-600">{errors.roleId.message}</p>
          )}
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

        {/* <div className="mt-4 flex flex-wrap gap-6 border-t border-amber-200 pt-4">
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
        </div> */}

        <button
          type="submit"
          disabled={isPending}
          className="disabled:bg-black mt-6 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Create account
        </button>
      </form>
    </div>
  );
}

// alert("pls alert");

// if (result.status) {
//   // Field-level errors → map into RHF
//   Object.entries(result.errors).forEach(([field, messages]) => {
//     setError(field as any, {
//       type: "server",
//       // message: messages?.[0],
//     });
//   });
//   return;
// }

// if (!result.status) {
//   // Global error message
//   alert(result.message);
//   return;
// }

// if (result.status === "success") {
// if (result.status === "success") {
//   // Success!
//   // console.log(result.message.user);
//   console.log("kinginamo");

//   // console.log("New user:", result.message.user.ds);
//   alert(result.user);
//   alert(result.message);
//   // alert(result.message.firstName);
//   reset(); // clear form
// }
