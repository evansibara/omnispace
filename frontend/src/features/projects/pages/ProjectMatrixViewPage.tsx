import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { Topbar } from "@/layouts/Topbar";
import { Button } from "@/components/ui";
import { ProjectCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { RoleGate } from "@/components/common/RoleGate";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUiStore } from "@/store/useUiStore";
import { useProjects } from "../hooks/useProjects";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectSearchInput } from "../components/ProjectSearchInput";
import { ProjectFilters } from "../components/ProjectFilters";
import { ProjectPagination } from "../components/ProjectPagination";
import { CreateProjectModal } from "../components/CreateProjectModal";
import type { ProjectStatus } from "../types";

const PAGE_SIZE = 9;

export default function ProjectMatrixViewPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const openProjectModal = useUiStore((s) => s.openProjectModal);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isError } = useProjects({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: ProjectStatus | "ALL") => {
    setStatus(value);
    setPage(1);
  };

  return (
    <>
      <Topbar
        title="Projects"
        description="Every engagement your agency is running, in one matrix."
        actions={
          <RoleGate allow={["SUPER_ADMIN", "PROJECT_MANAGER"]}>
            <Button size="sm" onClick={() => openProjectModal("create")}>
              <Plus className="h-3.5 w-3.5" />
              New project
            </Button>
          </RoleGate>
        }
      />

      <div className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ProjectSearchInput value={search} onChange={handleSearchChange} />
          <ProjectFilters status={status} onStatusChange={handleStatusChange} />
        </div>

        <div className="mt-5">
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-[var(--color-priority-high)]">
              Couldn't load projects. Try refreshing the page.
            </p>
          )}

          {data && data.items.length === 0 && (
            <EmptyState
              icon={FolderKanban}
              title={debouncedSearch || status !== "ALL" ? "No projects match your filters" : "No projects yet"}
              description={
                debouncedSearch || status !== "ALL"
                  ? "Try a different search term or clear the status filter."
                  : "Create your first project to start tracking work for a client."
              }
            />
          )}

          {data && data.items.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {data && (
          <ProjectPagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            totalItems={data.meta.totalItems}
            onPageChange={setPage}
          />
        )}
      </div>

      <CreateProjectModal />
    </>
  );
}
