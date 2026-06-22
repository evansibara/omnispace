import { Skeleton } from "@/components/ui";

export function DashboardSkeleton() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[var(--color-border-subtle)] bg-white p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-16" />
            <Skeleton className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-64 w-full rounded-lg" />
    </div>
  );
}
