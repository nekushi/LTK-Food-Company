"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createUserAccount } from "@/dal/accounts/create-user-account";
import { accountSchema } from "@/schemas/account.schema";
import { toast } from "react-toastify";

// Define the form values explicitly based on the schema and what we need
type HRFormValues = z.infer<typeof accountSchema>;

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

export default function CreateHRAccountPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HRFormValues>({
    resolver: zodResolver(accountSchema) as Resolver<HRFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      role: "HR", // Fixed role for this page
    },
  });

  const onSubmit = (data: HRFormValues) => {
    startTransition(async () => {
      const result = await createUserAccount(data);
      if (result?.success === "success") {
        toast.success(result.message || "HR Account created successfully");
        router.push("/admin/personnel/hr"); 
      } else if (result?.success === "validation_error") {
        toast.error("Validation error. Please check your inputs.");
        console.error(result.errors);
      } else {
        toast.error(result?.message || "Failed to create account");
      }
    });
  };

  return (
    <div className="space-y-6 p-8">
      <button className="underline underline-offset cursor-pointer mb-4 hover:text-yellow-600">
        <Link href={"/admin/personnel/hr"} className="flex items-center gap-1">
          <FaArrowLeft className="text-xs underline" />
          back to hr personnel
        </Link>
      </button>

      <div>
        <h1 className="text-xl font-semibold text-amber-900">
          Create HR Account
        </h1>
        <p className="text-amber-800/80">
          Create a new system account for a Human Resources personnel.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm max-w-3xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              type="text"
              {...register("firstName")}
              className={inputClass}
              placeholder="e.g. Jane"
            />
            {errors.firstName && (
               /* @ts-ignore */
              <p className="mt-1 text-xs text-red-600">
                {errors.firstName.message as any}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input
              type="text"
              {...register("lastName")}
              className={inputClass}
              placeholder="e.g. Doe"
            />
            {errors.lastName && (
               /* @ts-ignore */
              <p className="mt-1 text-xs text-red-600">
                {errors.lastName.message as any}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Username</label>
            <input
              type="text"
              {...register("username")}
              className={inputClass}
              placeholder="e.g. janedoe_hr"
            />
            {errors.username && (
               /* @ts-ignore */
              <p className="mt-1 text-xs text-red-600">
                {errors.username.message as any}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              {...register("password")}
              className={inputClass}
              placeholder="Minimum 8 characters"
            />
            {errors.password && (
               /* @ts-ignore */
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message as any}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating Account..." : "Create HR Account"}
        </button>
      </form>
    </div>
  );
}
