import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120, "Title is too long"),
  clientId: z.string().min(1, "Select a client"),
  description: z
    .string()
    .min(10, "Give a short description (10+ characters)")
    .max(2000, "Description is too long"),
  targetDeadline: z.string().min(1, "Pick a target deadline"),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
