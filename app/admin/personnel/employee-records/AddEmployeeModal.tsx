"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createEmployee } from "@/app/hr/employees/dal/create-employee";
import type { EmployeeFormValues } from "@/app/hr/employees/types";
import { FiX } from "react-icons/fi";

const employeeSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  employeeId: z.string().min(1, "Required"),
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

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddEmployeeModal({ open, onClose }: AddEmployeeModalProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

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

  const onSubmit = async (data: EmployeeFormValues) => {
    setIsPending(true);
    const result = await createEmployee(data);
    setIsPending(false);
    if (result.success) {
      reset();
      onClose();
      router.refresh();
    } else {
      alert(result.error || "Failed to create employee");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-amber-200 bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-amber-200 bg-amber-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-amber-900">Add Employee</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-amber-600 hover:bg-amber-200 hover:text-amber-900"
            aria-label="Close"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" {...register("firstName")} className={inputClass} />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" {...register("lastName")} className={inputClass} />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Employee ID</label>
              <input type="text" {...register("employeeId")} className={inputClass} />
              {errors.employeeId && <p className="mt-1 text-xs text-red-600">{errors.employeeId.message}</p>}
            </div>
            <div>
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
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>SSS</label>
              <input type="text" {...register("sss")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>PagIbig</label>
              <input type="text" {...register("pagIbig")} className={inputClass} />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Philhealth</label>
              <input type="text" {...register("philhealth")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>TIN</label>
              <input type="text" {...register("tin")} className={inputClass} />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Contact No</label>
              <input type="text" {...register("contactNo")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" {...register("email")} className={inputClass} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Address</label>
            <input type="text" {...register("address")} className={inputClass} />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {isPending ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
