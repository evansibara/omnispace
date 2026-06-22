import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";
import { useLogin } from "../hooks/useLogin";
import { Button, Input } from "@/components/ui";
import { FormField } from "@/components/ui/label";

export default function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => login.mutate(values);

  return (
    <AuthLayout
      eyebrow="Workspace access"
      title="One workspace for your agency and every client you serve."
      subtitle="Sign in to manage projects, route tasks, and keep clients looped in — without giving them the keys to your internals."
    >
      <h2 className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
        Sign in
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Enter your credentials to access your workspace.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <FormField label="Work email" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@agency.com"
            {...register("email")}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
          />
        </FormField>

        <Button type="submit" size="lg" isLoading={login.isPending} className="mt-2">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        New agency?{" "}
        <Link to="/register" className="font-medium text-[var(--color-signal-500)] hover:underline">
          Register your organization
        </Link>
      </p>
    </AuthLayout>
  );
}
