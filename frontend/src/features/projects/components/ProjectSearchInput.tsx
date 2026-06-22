import { Search } from "lucide-react";
import { Input } from "@/components/ui";

interface ProjectSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

/** Plain controlled input — debouncing happens one level up via
 * `useDebouncedValue`, keeping this component a dumb, reusable field. */
export function ProjectSearchInput({ value, onChange }: ProjectSearchInputProps) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search projects by title…"
        className="pl-8"
        aria-label="Search projects"
      />
    </div>
  );
}
