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
  "pdf/split": dynamic(() => import("./pdf/SplitPdf"), { ssr: false, loading: ToolLoading }),
  "pdf/compress": dynamic(() => import("./pdf/CompressPdf"), { ssr: false, loading: ToolLoading }),
  "pdf/to-jpg": dynamic(() => import("./pdf/PdfToJpg"), { ssr: false, loading: ToolLoading }),
  "pdf/to-png": dynamic(() => import("./pdf/PdfToPng"), { ssr: false, loading: ToolLoading }),
  "pdf/to-image": dynamic(() => import("./pdf/PdfToImage"), { ssr: false, loading: ToolLoading }),
  "pdf/from-jpg": dynamic(() => import("./pdf/JpgToPdf"), { ssr: false, loading: ToolLoading }),
  "pdf/from-png": dynamic(() => import("./pdf/PngToPdf"), { ssr: false, loading: ToolLoading }),
  "pdf/to-text": dynamic(() => import("./pdf/PdfToText"), { ssr: false, loading: ToolLoading }),
  "pdf/extract-pages": dynamic(() => import("./pdf/ExtractPages"), { ssr: false, loading: ToolLoading }),
  "pdf/remove-pages": dynamic(() => import("./pdf/RemovePages"), { ssr: false, loading: ToolLoading }),
  "pdf/rotate": dynamic(() => import("./pdf/RotatePdf"), { ssr: false, loading: ToolLoading }),
  "pdf/organize": dynamic(() => import("./pdf/OrganizePdf"), { ssr: false, loading: ToolLoading }),
  "pdf/add-pages": dynamic(() => import("./pdf/AddPages"), { ssr: false, loading: ToolLoading }),
  "pdf/protect": dynamic(() => import("./pdf/ProtectPdf"), { ssr: false, loading: ToolLoading }),
  "pdf/unlock": dynamic(() => import("./pdf/UnlockPdf"), { ssr: false, loading: ToolLoading }),
  "calculator/percentage": dynamic(() => import("./calculator/PercentageCalculator"), { ssr: false, loading: ToolLoading }),
  "pix/qr-code": dynamic(() => import("./pix/PixQrCode"), { ssr: false, loading: ToolLoading }),
};

export type ToolComponentKey = keyof typeof toolComponents;
