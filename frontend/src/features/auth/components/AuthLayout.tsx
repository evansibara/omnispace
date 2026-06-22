import type { ReactNode } from "react";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Signature layout for the auth flow: a dark "ink" panel on the left
 * carrying the brand mark and a quiet operational visual (the same rail
 * motif used in the dashboard sidebar), paired with a plain paper-white
 * form panel on the right. No stock illustration — the brand has to read
 * through typography and the rail alone.
 */
export function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[var(--color-ink-950)] p-10 text-[var(--color-text-inverse)] lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-signal-500)] font-display text-sm font-bold">
            O
          </span>
          <span className="font-display text-lg font-semibold">OmniSpace</span>
        </div>

        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-signal-300)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-md font-display text-3xl font-semibold leading-tight">
            {title}
          </h1>
          <p className="mt-3 max-w-sm text-sm text-[var(--color-text-muted)]">{subtitle}</p>

          {/* Signature rail: a column of status ticks, echoing the
              tenant-status indicator used throughout the app shell. */}
          <div className="mt-10 flex flex-col gap-2.5">
            {[
              { label: "Tenant isolation", tone: "var(--color-status-done)" },
              { label: "Role-based access", tone: "var(--color-signal-300)" },
              { label: "Audit-ready activity", tone: "var(--color-status-review)" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2.5 text-xs text-[var(--color-text-muted)]">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: row.tone }}
                  aria-hidden="true"
                />
                {row.label}
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[11px] text-[var(--color-ink-500)]">
          © {new Date().getFullYear()} OmniSpace — built for agencies that ship.
        </p>
      </aside>

      <main className="flex items-center justify-center bg-[var(--color-paper-50)] p-6 lg:p-10">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-signal-500)] font-display text-xs font-bold text-white">
              O
            </span>
            <span className="font-display text-base font-semibold text-[var(--color-text-primary)]">
              OmniSpace
            </span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
