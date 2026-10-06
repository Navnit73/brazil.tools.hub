"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { PDFDocumentProxy } from "../lib/render";
import { getThumbnail, type Thumbnail } from "../lib/thumbnails";

interface PageThumbnailProps {
  doc: PDFDocumentProxy;
  /** A partir de 1. */
  pageNumber: number;
  /** Rotação extra (graus) aplicada só na visualização. */
  rotation?: number;
  className?: string;
}

/** Proporção da moldura (largura / altura): folha em pé. */
const FRAME_RATIO = 3 / 4;

/**
 * Miniatura de uma página, desenhada só quando entra na tela.
 * A rotação é aplicada com CSS: girar não exige desenhar a página de novo.
 */
export function PageThumbnail({ doc, pageNumber, rotation = 0, className }: PageThumbnailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [thumbnail, setThumbnail] = useState<{ doc: PDFDocumentProxy; page: number; value: Thumbnail } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    getThumbnail(doc, pageNumber).then(
      (value) => !cancelled && setThumbnail({ doc, page: pageNumber, value }),
      () => !cancelled && setFailed(true),
    );
    return () => {
      cancelled = true;
    };
  }, [visible, doc, pageNumber]);

  const current = thumbnail && thumbnail.doc === doc && thumbnail.page === pageNumber ? thumbnail.value : null;

  return (
    <div
      ref={ref}
      className={cn("relative grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-m-sm bg-md-surface-high", className)}
    >
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL local (blob:), sem otimização possível
        <img
          src={current.url}
          alt=""
          draggable={false}
          className="max-h-full max-w-full bg-white shadow-sm ring-1 ring-black/10 transition-transform duration-200"
          style={{ transform: rotationTransform(current.width / current.height, rotation) }}
        />
      ) : failed ? (
        <span className="px-2 text-center text-xs text-md-on-surface-variant">Prévia indisponível</span>
      ) : (
        <span className="loading loading-spinner loading-sm text-md-on-surface-variant" aria-hidden="true" />
      )}
    </div>
  );
}

/** Gira a imagem e a reduz o suficiente para continuar cabendo na moldura. */
function rotationTransform(imageRatio: number, rotation: number): string {
  // O ângulo acumulado (ex.: 450°) faz a animação seguir sempre no sentido do clique.
  const quarterTurn = Math.abs(rotation / 90) % 2 === 1;
  if (!quarterTurn) return `rotate(${rotation}deg)`;
  // Tamanho exibido (em alturas da moldura) antes de girar, como em object-fit: contain.
  const width = Math.min(FRAME_RATIO, imageRatio);
  const height = width / imageRatio;
  // Depois de girar, largura e altura trocam de lugar.
  const scale = Math.min(1, FRAME_RATIO / height, 1 / width);
  return `rotate(${rotation}deg) scale(${scale.toFixed(3)})`;
}
