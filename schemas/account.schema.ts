import z from "zod";

export const ROLES = ["ADMIN", "HR", "INVENTORY", "STORE", "DELIVERY"] as const;

export const accountSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  username: z.string().min(2, "Username must be 2 characters and above"),
  roleId: z.string().optional(),
  password: z.string().min(8, "Minimum of 8 characters"),
  role: z.enum(ROLES),
});
