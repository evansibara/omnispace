export function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper-50)]">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-signal-500)] border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
