import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-[var(--color-text-primary)]",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

/** Standard label + control + error-message stack used across every
 * form in the app (auth, create-project modal, etc). */
export function FormField({ label, htmlFor, error, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-[var(--color-priority-high)]">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-[var(--color-priority-high)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
