"use client";

import dynamic from "next/dynamic";
import { ToolLoading } from "@/components/tool/ToolLoading";

/**
 * Componentes interativos das ferramentas. Cada um vira um chunk separado,
 * baixado só na página da própria ferramenta. Para registrar uma nova
 * ferramenta, adicione uma chave aqui e use-a em `src/data/tools.ts`.
 */
export const toolComponents = {
  "image/resize": dynamic(() => import("./image/ResizeImage"), { ssr: false, loading: ToolLoading }),
  "image/compress": dynamic(() => import("./image/CompressImage"), { ssr: false, loading: ToolLoading }),
  "image/editor": dynamic(() => import("./image/ImageEditor"), { ssr: false, loading: ToolLoading }),
  "image/convert": dynamic(() => import("./image/ConvertImage"), { ssr: false, loading: ToolLoading }),
  "image/jpg-to-webp": dynamic(() => import("./image/ConvertJpgToWebp"), { ssr: false, loading: ToolLoading }),
  "pdf/merge": dynamic(() => import("./pdf/MergePdf"), { ssr: false, loading: ToolLoading }),
  "calculator/percentage": dynamic(() => import("./calculator/PercentageCalculator"), { ssr: false, loading: ToolLoading }),
  "pix/qr-code": dynamic(() => import("./pix/PixQrCode"), { ssr: false, loading: ToolLoading }),
};

export type ToolComponentKey = keyof typeof toolComponents;
