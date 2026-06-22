export type {
  Project,
  ProjectSummary,
  ProjectStatus,
  ProjectClient,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectListFilters,
} from "@/types";
export { PROJECT_STATUSES } from "@/types";

/** Lightweight client-org option used to populate the "Client Assignment"
 * select in the Create Project modal. */
export interface ClientOption {
  id: string;
  companyName: string;
}
