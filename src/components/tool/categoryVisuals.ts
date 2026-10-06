import type { IconName } from "@/components/ui/Icon";
import type { CategorySlug } from "@/types/category";

interface CategoryVisual {
  icon: IconName;
  /** Contêiner tonal do Material 3: fundo claro + cor "on-container" (ícones e chips). */
  tone: string;
}

/** Identidade visual de cada categoria (classes estáticas para o Tailwind detectar). */
export const categoryVisuals: Record<CategorySlug, CategoryVisual> = {
  imagem: { icon: "image", tone: "bg-sky-100 text-sky-900" },
  pdf: { icon: "pdf", tone: "bg-red-100 text-red-900" },
  calculadoras: { icon: "calculator", tone: "bg-amber-100 text-amber-900" },
  pix: { icon: "pix", tone: "bg-teal-100 text-teal-900" },
  documentos: { icon: "document", tone: "bg-orange-100 text-orange-900" },
  whatsapp: { icon: "chat", tone: "bg-green-100 text-green-900" },
  texto: { icon: "text", tone: "bg-stone-200 text-stone-800" },
};
