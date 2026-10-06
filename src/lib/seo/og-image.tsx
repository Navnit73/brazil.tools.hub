import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const ogImageSize = { width: 1200, height: 630 };

// Imagens OG são renderizadas fora do navegador e não leem CSS: cores espelham os tokens de globals.css.
const colors = { primary: siteConfig.themeColor, background: "#ffffff", text: "#111827", muted: "#4b5563" };

export function renderOgImage({ eyebrow, title }: { eyebrow: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: colors.background,
          borderTop: `16px solid ${colors.primary}`,
          color: colors.text,
        }}
      >
        <div style={{ fontSize: 32, color: colors.primary, fontWeight: 700 }}>{eyebrow}</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 28, color: colors.muted }}>{`${siteConfig.name} · grátis e sem cadastro`}</div>
      </div>
    ),
    ogImageSize,
  );
}

/** Marca (mesmo desenho de `app/icon.svg`) em PNG, para apple-touch-icon, manifest e logo do JSON-LD. */
export function renderLogo(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: colors.primary }}>
        <svg width={size * 0.75} height={size * 0.75} viewBox="4 6 24 24">
          <path
            d="M9 10h9a4 4 0 0 1 0 8H9zM9 18h10a4 4 0 0 1 0 8H9z"
            fill="none"
            stroke="#fff"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
