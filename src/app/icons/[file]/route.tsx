import { notFound } from "next/navigation";
import { renderLogo } from "@/lib/seo/og-image";

/** Ícones PNG do manifest (192 e 512) e logo da Organization no JSON-LD. */
const sizes: Record<string, number> = { "192.png": 192, "512.png": 512 };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(sizes).map((file) => ({ file }));
}

export async function GET(_request: Request, ctx: RouteContext<"/icons/[file]">) {
  const size = sizes[(await ctx.params).file];
  if (!size) notFound();
  return renderLogo(size);
}
