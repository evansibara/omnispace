import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/formatters";

interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function toneForValue(value: number): string {
  if (value >= 80) return "var(--color-status-done)";
  if (value >= 40) return "var(--color-status-progress)";
  return "var(--color-priority-medium)";
}

const heightMap = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" } as const;

export function ProgressBar({ value, label, showValue = true, size = "md", className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>}
          {showValue && (
            <span className="font-mono text-xs font-medium text-[var(--color-text-primary)]">
              {formatPercent(clamped)}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("w-full overflow-hidden rounded-full bg-[var(--color-paper-200)]", heightMap[size])}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: toneForValue(clamped) }}
        />
      </div>
    </div>
  );
}
