"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEdit2, FiX, FiSave, FiTrash2 } from "react-icons/fi";
import { updateAdminEmployeeData } from "@/dal/admin/update-employee-data";
import { deleteEmployee } from "@/dal/admin/delete-employee";

const schema = z.object({
  dateHired: z.string().optional(),
  email: z.string().optional(),
  contactNo: z.string().optional(),
  address: z.string().optional(),
  sss: z.string().optional(),
  pagIbig: z.string().optional(),
  philhealth: z.string().optional(),
  tin: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EmployeeDataRow {
  id: string;
  dateHired?: Date | string | null;
  sss?: string | null;
  pagIbig?: string | null;
  philhealth?: string | null;
  tin?: string | null;
  contactNo?: string | null;
  email?: string | null;
  address?: string | null;
}

interface ProfileEditClientProps {
  employeeId: string;
  firstName: string;
  lastName: string;
  employeeIdDisplay: string | null;
  employeeData: EmployeeDataRow | null;
}

const inputClass =
  "w-full rounded-md border border-amber-200 bg-white px-2 py-1.5 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";

function toDateInputValue(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export default function ProfileEditClient({
  employeeId,
  firstName,
  lastName,
  employeeIdDisplay,
  employeeData,
}: ProfileEditClientProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dateHired: toDateInputValue(employeeData?.dateHired),
      email: employeeData?.email ?? "",
      contactNo: employeeData?.contactNo ?? "",
      address: employeeData?.address ?? "",
      sss: employeeData?.sss ?? "",
      pagIbig: employeeData?.pagIbig ?? "",
      philhealth: employeeData?.philhealth ?? "",
      tin: employeeData?.tin ?? "",
    },
  });

  const defaultFormValues = (): FormValues => ({
    dateHired: toDateInputValue(employeeData?.dateHired),
    email: employeeData?.email ?? "",
    contactNo: employeeData?.contactNo ?? "",
    address: employeeData?.address ?? "",
    sss: employeeData?.sss ?? "",
    pagIbig: employeeData?.pagIbig ?? "",
    philhealth: employeeData?.philhealth ?? "",
    tin: employeeData?.tin ?? "",
  });

  const onCancel = () => {
    reset(defaultFormValues());
    setEditing(false);
  };

  const onStartEdit = () => {
    reset(defaultFormValues());
    setEditing(true);
  };

  const onSave = async (data: FormValues) => {
    setSaving(true);
    const result = await updateAdminEmployeeData({
      employeeId,
      dateHired: data.dateHired?.trim() || null,
      email: data.email?.trim() || null,
      contactNo: data.contactNo?.trim() || null,
      address: data.address?.trim() || null,
      sss: data.sss?.trim() || null,
      pagIbig: data.pagIbig?.trim() || null,
      philhealth: data.philhealth?.trim() || null,
      tin: data.tin?.trim() || null,
    });
    setSaving(false);
    if (result.success) {
      setEditing(false);
      router.refresh();
    } else {
      alert(result.message || "Failed to save");
    }
  };

  const onDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const result = await deleteEmployee(employeeId);
    setDeleting(false);
    setConfirmDelete(false);
    if (result.success) {
      router.push("/admin/personnel/employee-records");
      router.refresh();
    } else {
      alert(result.message || "Failed to delete");
    }
  };

  const dateHiredDisplay = employeeData?.dateHired
    ? new Date(employeeData.dateHired).toLocaleDateString()
    : "N/A";

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-sm text-amber-800">
          <p>
            <span className="font-semibold">Date Hired: </span>
            {editing ? (
              <input
                type="date"
                {...register("dateHired")}
                className={`ml-2 ${inputClass} max-w-[160px] inline-block`}
              />
            ) : (
              dateHiredDisplay
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button
                type="button"
                onClick={onStartEdit}
                className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <FiEdit2 className="text-sm" />
                Edit profile
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  confirmDelete
                    ? "border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
                } disabled:opacity-50`}
              >
                <FiTrash2 className="text-sm" />
                {deleting ? "Deleting..." : confirmDelete ? "Click again to confirm delete" : "Delete"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
              >
                <FiX className="text-sm" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSave)}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
              >
                <FiSave className="text-sm" />
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-amber-900 border-b border-amber-100 pb-2">
            Contact Information
          </h2>
          {editing ? (
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="text-amber-700">Email</span>
                <input {...register("email")} className={`mt-1 block ${inputClass}`} placeholder="—" />
                {errors.email && <span className="text-red-600 text-xs">{errors.email.message}</span>}
              </label>
              <label className="block">
                <span className="text-amber-700">Contact Number</span>
                <input {...register("contactNo")} className={`mt-1 block ${inputClass}`} placeholder="—" />
              </label>
              <label className="block">
                <span className="text-amber-700">Address</span>
                <input {...register("address")} className={`mt-1 block ${inputClass}`} placeholder="—" />
              </label>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700">Email:</span>
                <span className="font-medium text-amber-900">{employeeData?.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Contact Number:</span>
                <span className="font-medium text-amber-900">{employeeData?.contactNo || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Address:</span>
                <span className="font-medium text-amber-900">{employeeData?.address || "—"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-amber-900 border-b border-amber-100 pb-2">
            Government IDs
          </h2>
          {editing ? (
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="text-amber-700">SSS Number</span>
                <input {...register("sss")} className={`mt-1 block ${inputClass}`} placeholder="—" />
              </label>
              <label className="block">
                <span className="text-amber-700">Pag-IBIG Number</span>
                <input {...register("pagIbig")} className={`mt-1 block ${inputClass}`} placeholder="—" />
              </label>
              <label className="block">
                <span className="text-amber-700">PhilHealth</span>
                <input {...register("philhealth")} className={`mt-1 block ${inputClass}`} placeholder="—" />
              </label>
              <label className="block">
                <span className="text-amber-700">TIN</span>
                <input {...register("tin")} className={`mt-1 block ${inputClass}`} placeholder="—" />
              </label>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700">SSS Number:</span>
                <span className="font-medium text-amber-900">{employeeData?.sss || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Pag-IBIG Number:</span>
                <span className="font-medium text-amber-900">{employeeData?.pagIbig || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">PhilHealth:</span>
                <span className="font-medium text-amber-900">{employeeData?.philhealth || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">TIN:</span>
                <span className="font-medium text-amber-900">{employeeData?.tin || "—"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
