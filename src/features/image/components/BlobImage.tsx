"use client";

import { useEffect, useRef, type ImgHTMLAttributes } from "react";

interface BlobImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  blob: Blob;
}

/** Exibe um Blob/File local; a URL temporária é criada e liberada junto com o elemento. */
export function BlobImage({ blob, alt = "", ...props }: BlobImageProps) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  // eslint-disable-next-line @next/next/no-img-element -- URL local (blob:), sem otimização possível
  return <img ref={ref} alt={alt} decoding="async" {...props} />;
}
