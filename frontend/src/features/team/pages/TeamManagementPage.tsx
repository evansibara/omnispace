import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Topbar } from "@/layouts/Topbar";
import { Card, CardContent, Badge } from "@/components/ui";
import { Avatar } from "@/components/ui/avatar";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { fetchTenantStaff } from "../api/team.api";
import type { ApiError, User } from "@/types";

export default function TeamManagementPage() {
  const { data: staff, isLoading, isError } = useQuery<User[], ApiError>({
    queryKey: ["team"],
    queryFn: fetchTenantStaff,
  });

  return (
    <>
      <Topbar title="Team" description="Everyone with internal access to this workspace." />
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)]">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Job title</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={4} />)}

                {!isLoading && isError && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-sm text-[var(--color-priority-high)]">
                      Couldn't load your team.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  staff?.map((member) => (
                    <tr key={member.id} className="border-b border-[var(--color-border-subtle)] last:border-0">
                      <td className="flex items-center gap-2.5 p-3">
                        <Avatar name={member.fullName} src={member.avatarUrl} size="sm" />
                        {member.fullName}
                      </td>
                      <td className="p-3 text-[var(--color-text-secondary)]">
                        {member.role.replace("_", " ")}
                      </td>
                      <td className="p-3 text-[var(--color-text-secondary)]">{member.jobTitle ?? "—"}</td>
                      <td className="p-3">
                        <Badge tone={member.isActive ? "done" : "neutral"} dot>
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!isLoading && !isError && staff?.length === 0 && (
              <div className="p-6">
                <EmptyState
                  icon={Users}
                  title="No staff yet"
                  description="Invite your colleagues to start assigning them to projects."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
