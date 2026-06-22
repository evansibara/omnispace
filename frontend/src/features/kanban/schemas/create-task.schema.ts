import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title is too long"),
  description: z.string().max(2000, "Description is too long"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assigneeId: z.string().nullable(),
  dueDate: z.string().nullable(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
