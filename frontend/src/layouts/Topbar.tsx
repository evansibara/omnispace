import type { ReactNode } from "react";

interface TopbarProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function Topbar({ title, description, actions }: TopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-white px-6 py-4">
      <div>
        <h1 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
