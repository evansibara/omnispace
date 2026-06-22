import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Button, Input, Select } from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/label";
import { useCreateTask } from "../hooks/useCreateTask";
import { createTaskSchema, type CreateTaskFormValues } from "../schemas/create-task.schema";
import { TASK_PRIORITIES } from "../types";

interface CreateTaskModalProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

const PRIORITY_OPTIONS = TASK_PRIORITIES.map((p) => ({ value: p, label: p }));

export function CreateTaskModal({ projectId, open, onClose }: CreateTaskModalProps) {
  const createTask = useCreateTask(projectId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { priority: "MEDIUM", assigneeId: null, dueDate: null, description: "" },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: CreateTaskFormValues) => {
    createTask.mutate(
      {
        title: values.title,
        description: values.description,
        priority: values.priority,
        assigneeId: values.assigneeId,
        dueDate: values.dueDate,
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} title="New task" description="Adds a card to the To Do column.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField label="Task title" htmlFor="task-title" error={errors.title?.message} required>
          <Input id="task-title" placeholder="e.g. Implement login screen" {...register("title")} />
        </FormField>

        <FormField label="Description" htmlFor="task-description" error={errors.description?.message}>
          <Textarea id="task-description" rows={3} placeholder="Optional details…" {...register("description")} />
        </FormField>

        <FormField label="Priority" htmlFor="task-priority" error={errors.priority?.message} required>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => <Select id="task-priority" options={PRIORITY_OPTIONS} {...field} />}
          />
        </FormField>

        <FormField label="Due date" htmlFor="task-dueDate" error={errors.dueDate?.message}>
          <Input
            id="task-dueDate"
            type="date"
            {...register("dueDate")}
            onChange={(e) => register("dueDate").onChange(e)}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createTask.isPending}>
            Add task
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
