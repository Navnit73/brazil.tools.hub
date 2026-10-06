"use client";

import { useState, type DragEvent } from "react";

/** Move um item de posição, devolvendo uma lista nova. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Reordenar arrastando (mouse e navegadores que suportam arrastar no toque).
 * Os botões de mover continuam sendo a forma acessível e a garantida no celular.
 */
export function useDragReorder(onMove: (from: number, to: number) => void, disabled = false) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const reset = () => {
    setDragging(null);
    setOver(null);
  };

  const itemProps = (index: number) => ({
    draggable: !disabled,
    onDragStart: (event: DragEvent) => {
      setDragging(index);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    },
    onDragOver: (event: DragEvent) => {
      if (dragging === null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (over !== index) setOver(index);
    },
    onDrop: (event: DragEvent) => {
      if (dragging === null) return;
      event.preventDefault();
      if (dragging !== index) onMove(dragging, index);
      reset();
    },
    onDragEnd: reset,
  });

  return { itemProps, dragging, over };
}
