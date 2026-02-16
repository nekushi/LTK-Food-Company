import z from "zod";

export const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(8, "Password is required"),
  // role: z.enum(ROLES),
});
