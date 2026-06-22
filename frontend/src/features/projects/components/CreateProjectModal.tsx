import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Button, Input, Select } from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/label";
import { useUiStore } from "@/store/useUiStore";
import { useCreateProject } from "../hooks/useCreateProject";
import { useClientOptions } from "../hooks/useClientOptions";
import { createProjectSchema, type CreateProjectFormValues } from "../schemas/create-project.schema";

/** Gated by `<RoleGate allow={['SUPER_ADMIN','PROJECT_MANAGER']}>` at the
 * call site (ProjectMatrixView toolbar) — Developers and Clients never
 * even get a "New Project" button rendered. */
export function CreateProjectModal() {
  const isOpen = useUiStore((s) => s.activeProjectModal === "create");
  const closeProjectModal = useUiStore((s) => s.closeProjectModal);
  const createProject = useCreateProject();
  const { data: clients, isLoading: clientsLoading } = useClientOptions();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
  });

  const onClose = () => {
    reset();
    closeProjectModal();
  };

  const onSubmit = (values: CreateProjectFormValues) => {
    createProject.mutate(values, { onSuccess: () => reset() });
  };

  const clientOptions = [
    { value: "", label: clientsLoading ? "Loading clients…" : "Select a client" },
    ...(clients ?? []).map((c) => ({ value: c.id, label: c.companyName })),
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="New project"
      description="Set up a new engagement and assign it to a client."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField label="Project title" htmlFor="title" error={errors.title?.message} required>
          <Input id="title" placeholder="e.g. Acme Website Redesign" {...register("title")} />
        </FormField>

        <FormField label="Client" htmlFor="clientId" error={errors.clientId?.message} required>
          <Controller
            name="clientId"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select id="clientId" options={clientOptions} {...field} />
            )}
          />
        </FormField>

        <FormField label="Description" htmlFor="description" error={errors.description?.message} required>
          <Textarea
            id="description"
            placeholder="What is this project about?"
            rows={3}
            {...register("description")}
          />
        </FormField>

        <FormField
          label="Target deadline"
          htmlFor="targetDeadline"
          error={errors.targetDeadline?.message}
          required
        >
          <Input id="targetDeadline" type="date" {...register("targetDeadline")} />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createProject.isPending}>
            Create project
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
