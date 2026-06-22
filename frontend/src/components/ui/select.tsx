import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
}

/** A native <select>, styled to match the design system. Native select is
 * deliberate here — it's faster to ship, fully accessible out of the box,
 * and this is a filter control, not a rich combobox. */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-9 w-full appearance-none rounded-md border border-[var(--color-border-default)] bg-white px-3 pr-8 text-sm text-[var(--color-text-primary)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal-500)]",
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]"
          aria-hidden="true"
        />
      </div>
    );
  },
);
Select.displayName = "Select";
