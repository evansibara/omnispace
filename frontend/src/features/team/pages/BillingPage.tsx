import { CreditCard } from "lucide-react";
import { Topbar } from "@/layouts/Topbar";
import { Card, CardContent, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";

/** Out of scope for the PRD's core epics, but linked from the sidebar per
 * the brief's nav spec — kept intentionally minimal rather than faked
 * with invented pricing data. */
export default function BillingPage() {
  const tenant = useAuthStore((s) => s.tenant);

  return (
    <>
      <Topbar title="Billing" description="Your organization's subscription." />
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[var(--color-signal-50)] text-[var(--color-signal-600)]">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Current plan</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
                  {tenant?.plan ?? "—"}
                </p>
                <Badge tone="signal">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
