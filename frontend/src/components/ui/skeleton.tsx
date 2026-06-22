import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--color-paper-200)]",
        className,
      )}
      aria-hidden="true"
    />
  );
}

/** Pre-built skeleton for a project card — matches ProjectCard's layout
 * so loading state doesn't cause a layout jump. */
export function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-2/3" />
      <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-md border border-[var(--color-border-subtle)] bg-white p-3">
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="mt-2 h-4 w-14 rounded-md" />
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-3 w-full" />
        </td>
      ))}
    </tr>
  );
}
