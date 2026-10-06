import type { IconName } from "@/components/ui/Icon";
import type { CategorySlug } from "@/types/category";

interface CategoryVisual {
  icon: IconName;
  /** Classes do "selo" do ícone (fundo suave + cor do traço). */
  tile: string;
}

/** Identidade visual de cada categoria nos cards (classes estáticas para o Tailwind detectar). */
export const categoryVisuals: Record<CategorySlug, CategoryVisual> = {
  imagem: { icon: "image", tile: "bg-violet-50 text-violet-700 ring-violet-200" },
  pdf: { icon: "pdf", tile: "bg-rose-50 text-rose-700 ring-rose-200" },
  calculadoras: { icon: "calculator", tile: "bg-amber-50 text-amber-700 ring-amber-200" },
  pix: { icon: "pix", tile: "bg-teal-50 text-teal-700 ring-teal-200" },
  documentos: { icon: "document", tile: "bg-sky-50 text-sky-700 ring-sky-200" },
  whatsapp: { icon: "chat", tile: "bg-green-50 text-green-700 ring-green-200" },
  texto: { icon: "text", tile: "bg-slate-100 text-slate-700 ring-slate-200" },
};
