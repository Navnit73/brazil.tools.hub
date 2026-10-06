import type { IconName } from "@/components/ui/Icon";
import type { CategorySlug } from "@/types/category";

interface CategoryVisual {
  icon: IconName;
  /** Gradiente do "selo" do ícone (usar com `bg-linear-to-br`). */
  gradient: string;
  /** Sombra colorida do selo. */
  glow: string;
  /** Fundo suave para destaques. */
  soft: string;
}

/** Identidade visual de cada categoria (classes estáticas para o Tailwind detectar). */
export const categoryVisuals: Record<CategorySlug, CategoryVisual> = {
  imagem: { icon: "image", gradient: "from-violet-500 to-fuchsia-500", glow: "shadow-violet-500/30", soft: "bg-violet-50" },
  pdf: { icon: "pdf", gradient: "from-rose-500 to-orange-400", glow: "shadow-rose-500/30", soft: "bg-rose-50" },
  calculadoras: { icon: "calculator", gradient: "from-amber-400 to-orange-500", glow: "shadow-amber-500/30", soft: "bg-amber-50" },
  pix: { icon: "pix", gradient: "from-teal-400 to-cyan-600", glow: "shadow-teal-500/30", soft: "bg-teal-50" },
  documentos: { icon: "document", gradient: "from-sky-500 to-indigo-500", glow: "shadow-sky-500/30", soft: "bg-sky-50" },
  whatsapp: { icon: "chat", gradient: "from-green-500 to-emerald-600", glow: "shadow-green-500/30", soft: "bg-green-50" },
  texto: { icon: "text", gradient: "from-slate-600 to-slate-800", glow: "shadow-slate-500/30", soft: "bg-slate-100" },
};
