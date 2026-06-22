import { Select } from "@/components/ui";
import { PROJECT_STATUSES } from "../types";
import type { ProjectStatus } from "../types";

interface ProjectFiltersProps {
  status: ProjectStatus | "ALL";
  onStatusChange: (status: ProjectStatus | "ALL") => void;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
};

export function ProjectFilters({ status, onStatusChange }: ProjectFiltersProps) {
  const options = [
    { value: "ALL", label: "All statuses" },
    ...PROJECT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  ];

  return (
    <div className="w-full sm:w-44">
      <Select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as ProjectStatus | "ALL")}
        options={options}
        aria-label="Filter by status"
      />
    </div>
  );
}
