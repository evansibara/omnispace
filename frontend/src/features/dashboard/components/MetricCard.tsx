import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  sparklineData?: number[];
}

/**
 * The dashboard's signature element: a large mono-font figure paired with
 * a deliberately understated sparkline — precision-instrument feel rather
 * than a generic icon-in-a-circle stat card.
 */
export function MetricCard({ label, value, icon: Icon, trend, sparklineData }: MetricCardProps) {
  const isPositive = (trend ?? 0) >= 0;
  const chartData = (sparklineData ?? []).map((v, i) => ({ i, v }));

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--color-text-primary)]">
            {value}
          </p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-signal-50)] text-[var(--color-signal-600)]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {trend !== undefined ? (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isPositive ? "text-[var(--color-status-done)]" : "text-[var(--color-priority-high)]",
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}% vs last month
          </span>
        ) : (
          <span />
        )}

        {chartData.length > 1 && (
          <div className="h-7 w-20" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="var(--color-signal-500)"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}
