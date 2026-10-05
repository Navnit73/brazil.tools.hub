import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { TOOLS_BASE_PATH } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="py-16 text-center">
      <p className="text-sm font-semibold text-primary">Erro 404</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Página não encontrada</h1>
      <p className="mt-2 text-muted">O endereço pode ter mudado ou a ferramenta não existe mais.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href={TOOLS_BASE_PATH} className="btn btn-primary">
          Ver todas as ferramentas
        </Link>
        <Link href="/" className="btn btn-outline">
          Ir para o início
        </Link>
      </div>
    </Container>
  );
}
