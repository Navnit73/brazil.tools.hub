import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="rounded-m-md bg-md-surface-low p-6 text-center">
      <p className="font-display font-medium text-md-on-surface">{title}</p>
      {children && <div className="mt-1 text-sm text-md-on-surface-variant">{children}</div>}
    </div>
  );
}
