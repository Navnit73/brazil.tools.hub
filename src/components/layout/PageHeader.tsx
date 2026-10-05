import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: ReactNode;
  children?: ReactNode;
}

/** Cabeçalho padrão de páginas de listagem: único `<h1>` da página. */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 text-base text-muted sm:text-lg">{description}</p>
      {children}
    </header>
  );
}
