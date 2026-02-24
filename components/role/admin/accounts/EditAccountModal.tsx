"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { updateAccount } from "@/dal/accounts/update-account";

const editAccountSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  roleId: z.string().optional(),
  username: z.string().min(1, "Required"),
  password: z.string().optional(),
});

type EditAccountFormValues = z.infer<typeof editAccountSchema>;

interface EditAccountModalProps {
  account: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    roleId?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

export function EditAccountModal({
  account,
  isOpen,
  onClose,
  onSuccess,
}: EditAccountModalProps) {
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditAccountFormValues>({
    resolver: zodResolver(editAccountSchema),
    defaultValues: {
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      username: account.username,
      roleId: account.roleId || "",
      password: "",
    },
  });

  const onSubmit = async (data: EditAccountFormValues) => {
    setIsPending(true);
    try {
      const result = await updateAccount(data);
      if (result.success) {
        toast.success(result.message);
        onSuccess();
        onClose();
        reset({ ...data, password: "" });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-amber-200">
        <h2 className="text-xl font-semibold text-amber-900 mb-4">Edit Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          
          <div>
            <label className={labelClass}>Role ID (optional)</label>
            <input type="text" {...register("roleId")} className={inputClass} />
            {errors.roleId && <p className="mt-1 text-xs text-red-600">{errors.roleId.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Username</label>
            <input type="text" {...register("username")} className={inputClass} />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Password (leave blank to keep current)</label>
            <input type="password" {...register("password")} className={inputClass} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-amber-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
