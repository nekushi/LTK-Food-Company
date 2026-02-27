"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmployeeFormValues } from "../types";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createEmployee } from "../dal/create-employee";

const employeeSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  employeeId: z.string().min(1, "Required"),
  branch: z.string(),
  dateHired: z.string().min(1, "Required"),
  sss: z.string(),
  pagIbig: z.string(),
  philhealth: z.string(),
  tin: z.string(),
  contactNo: z.string(),
  email: z.string(),
  address: z.string(),
});

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HREmployeeForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema) as Resolver<EmployeeFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      employeeId: "",
      branch: "",
      dateHired: todayISO(),
      sss: "",
      pagIbig: "",
      philhealth: "",
      tin: "",
      contactNo: "",
      email: "",
      address: "",
    },
  });

  const onSubmit = (data: EmployeeFormValues) => {
    startTransition(async () => {
      const result = await createEmployee(data);
      if (result.success) {
        router.push("/hr/employees");
      } else {
        alert(result.error || "Failed to create employee");
      }
    });
  };

  return (
    <div className="space-y-6 p-8">
      <button className="underline underline-offset cursor-pointer mb-4 hover:text-yellow-600">
        <Link href={"/hr/employees"} className="flex items-center gap-1">
          <FaArrowLeft className="text-xs underline" />
          back
        </Link>
      </button>
      <div>
        <h1 className="text-xl font-semibold text-amber-900">
          Create Employees
        </h1>
        <p className="text-amber-800/80">
          Create employee, link attendance card (fingerprint biometrics). Use
          checkboxes to adjust payroll and attendance linking.
        </p>
      </div>

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
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Employee ID</label>
            <input
              type="text"
              {...register("employeeId")}
              className={inputClass}
            />
            {errors.employeeId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.employeeId.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Branch</label>
            <input
              type="text"
              {...register("branch")}
              className={inputClass}
              placeholder="e.g. Main, Calamba"
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>SSS</label>
            <input type="text" {...register("sss")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>PagIbig</label>
            <input
              type="text"
              {...register("pagIbig")}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Philhealth</label>
            <input
              type="text"
              {...register("philhealth")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>TIN</label>
            <input type="text" {...register("tin")} className={inputClass} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Contact No</label>
            <input
              type="text"
              {...register("contactNo")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" {...register("email")} className={inputClass} />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Address</label>
          <input
            type="text"
            {...register("address")}
            className={inputClass}
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-600">
              {errors.address.message}
            </p>
          )}
        </div>
        <div className="mt-4">
          <label className={labelClass}>Date Hired</label>
          <input
            type="date"
            {...register("dateHired")}
            className={inputClass}
            onFocus={(e) => {
              if (!e.target.value) setValue("dateHired", todayISO());
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Adding employee..." : "Add employee"}
        </button>
      </form>
    </div>
  );
}
