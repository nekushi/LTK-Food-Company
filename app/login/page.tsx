"use client";

import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "../../schemas/login.schema";
import { getUser } from "@/dal/login/get-user";
import { setAuth } from "@/lib/auth-storage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type LoginFormValues = z.infer<typeof loginSchema>;

function getRedirectForRole(role: string): string {
  switch (role) {
    case "HR":
      return "/hr";
    case "ADMIN":
      return "/admin";
    case "INVENTORY":
      return "/inventory";
    case "DELIVERY":
      return "/delivery";
    case "STORE":
      return "/store";
    default:
      return "/";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as Resolver<LoginFormValues>,
    defaultValues: { username: "", password: "" as const },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const row: z.infer<typeof loginSchema> = {
      username: data.username,
      password: data.password,
    };

    const result = await getUser(row);

    if (!result.success) {
      toast.error(result.message);
      reset();
      return;
    }

    setAuth({
      userId: result.userId,
      username: result.username,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
    });

    router.push(getRedirectForRole(result.role));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <img
        src="/bg.png"
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-0 bg-[var(--ltk-blue-white)]/60"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-amber-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm">
        <h1 className="mb-6 text-xl font-semibold text-amber-900">
          LTK Food Corporation
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-amber-900">
              Username
            </label>
            <input
              type="username"
              {...register("username")}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-amber-900">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          {/* <div>
            <label className="mb-1 block text-sm font-medium text-amber-900">
              Role (redirect target)
            </label>
            <select
              {...register("role")}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="INVENTORY">Inventory</option>
              <option value="ADMIN">Admin</option>
              <option value="HR">HR</option>
              <option value="STORE_ACCOUNT">Store account</option>
              <option value="DELIVERY_PERSONNEL">Delivery personnel</option>
            </select>
          </div> */}
          <button
            type="submit"
            className="w-full rounded-lg bg-amber-500 py-2.5 font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
