import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";

interface ProjectPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function ProjectPagination({ page, totalPages, totalItems, onPageChange }: ProjectPaginationProps) {
  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] px-1 py-4">
      <p className="text-xs text-[var(--color-text-muted)]">
        Page <span className="font-mono">{page}</span> of{" "}
        <span className="font-mono">{totalPages}</span> · {totalItems} project
        {totalItems === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
