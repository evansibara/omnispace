import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import {
  registerTenantSchema,
  type RegisterTenantFormValues,
} from "../schemas/register-tenant.schema";
import { useRegisterTenant } from "../hooks/useRegisterTenant";
import { Button, Input } from "@/components/ui";
import { FormField } from "@/components/ui/label";

export default function RegisterTenantPage() {
  const registerTenant = useRegisterTenant();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterTenantFormValues>({
    resolver: zodResolver(registerTenantSchema),
  });

  const onSubmit = (values: RegisterTenantFormValues) => {
    registerTenant.mutate({
      organizationName: values.organizationName,
      fullName: values.fullName,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <AuthLayout
      eyebrow="New organization"
      title="Bring your whole agency in — projects, staff, and clients — under one roof."
      subtitle="You'll be set up as the Super Admin. Invite your team and connect your first client once you're in."
    >
      <h2 className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
        Register your organization
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Creates a new isolated workspace for your agency.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <FormField
          label="Organization name"
          htmlFor="organizationName"
          error={errors.organizationName?.message}
          required
        >
          <Input
            id="organizationName"
            placeholder="Acme Studio"
            autoComplete="organization"
            {...register("organizationName")}
          />
        </FormField>

        <FormField label="Your full name" htmlFor="fullName" error={errors.fullName?.message} required>
          <Input id="fullName" placeholder="Jane Cooper" autoComplete="name" {...register("fullName")} />
        </FormField>

        <FormField label="Work email" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            placeholder="you@agency.com"
            autoComplete="email"
            {...register("email")}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            {...register("password")}
          />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </FormField>

        <Button type="submit" size="lg" isLoading={registerTenant.isPending} className="mt-2">
          Create organization
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        Already on OmniSpace?{" "}
        <Link to="/login" className="font-medium text-[var(--color-signal-500)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
