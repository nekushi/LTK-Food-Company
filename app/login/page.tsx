"use client";

import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "../../schemas/login.schema";
import { getUser } from "@/dal/login/get-user";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as Resolver<LoginFormValues>,
    // defaultValues: { username: "", password: "", role: "INVENTORY" as const },
    defaultValues: { username: "", password: "" as const },
  });

  const onSubmit = async (data: LoginFormValues) => {
    // const url = getRedirectForRole(data.role);
    // router.push(url);

    // alert("dsdad");

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

    // Persist login info in localStorage so flows can rely on it.
    if (typeof window !== "undefined") {
      try {
        const { userId, username, role, storeId } = result;

        // Flat keys for existing consumers
        if (result.userId) {
          window.localStorage.setItem("userId", result.userId);
        }
        if (username) {
          window.localStorage.setItem("username", username);
        }
        if (role) {
          window.localStorage.setItem("role", role);
        }
        if (storeId) {
          window.localStorage.setItem("storeId", storeId);
        }

        // Namespaced storage per account so multiple logins can coexist.
        if (userId) {
          const accountKey = `ltk:account:${userId}`;
          const accountPayload = {
            userId,
            username: username ?? null,
            role: role ?? null,
            storeId: storeId ?? null,
            lastLoginAt: new Date().toISOString(),
          };
          window.localStorage.setItem(
            accountKey,
            JSON.stringify(accountPayload),
          );

          // Track current active account id
          window.localStorage.setItem("ltk:currentAccountId", userId);

          // Maintain a simple registry of known accounts
          const registryKey = "ltk:accounts";
          const existingRaw = window.localStorage.getItem(registryKey);
          let registry: { userId: string; username: string | null; role: string | null }[] =
            [];
          if (existingRaw) {
            try {
              registry = JSON.parse(existingRaw);
            } catch {
              registry = [];
            }
          }
          if (!registry.some((a) => a.userId === userId)) {
            registry.push({
              userId,
              username: username ?? null,
              role: role ?? null,
            });
          }
          window.localStorage.setItem(registryKey, JSON.stringify(registry));
        }
      } catch {
        // ignore localStorage errors
      }
    }

    // Redirect based on role using localStorage as the source of truth.
    if (typeof window !== "undefined") {
      const storedRole = window.localStorage.getItem("role");
      let target = "/";
      switch (storedRole) {
        case "HR":
          target = "/hr";
          break;
        case "ADMIN":
          target = "/admin";
          break;
        case "INVENTORY":
          target = "/inventory";
          break;
        case "DELIVERY":
          target = "/delivery";
          break;
        case "STORE":
          target = "/store";
          break;
        default:
          // fallback to server-suggested redirect if any
          if (result.redirectUrl) {
            target = result.redirectUrl;
          }
      }
      router.push(target);
    } else {
      router.push(result.redirectUrl || "/");
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
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
