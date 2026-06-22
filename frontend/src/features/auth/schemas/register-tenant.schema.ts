import { z } from "zod";

export const registerTenantSchema = z
  .object({
    organizationName: z
      .string()
      .min(2, "Organization name must be at least 2 characters")
      .max(80, "Organization name is too long"),
    fullName: z.string().min(2, "Your full name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterTenantFormValues = z.infer<typeof registerTenantSchema>;
