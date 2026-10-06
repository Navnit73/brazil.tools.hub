import path from "node:path";
import type { NextConfig } from "next";

// Host canônico (mesma fonte que src/config/site.ts): https, sem "www", sem barra final.
const siteHost = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfimagem.com").host;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  // Sem barra final: /ferramentas/ → /ferramentas (308, padrão do Next.js).
  trailingSlash: false,
  // Evita que um package-lock.json fora do repositório seja tomado como raiz.
  turbopack: { root: path.resolve(__dirname) },
  images: {
    formats: ["image/avif", "image/webp"],
  },

  async redirects() {
    return [
      // Uma variação de host só: www → domínio sem www, em um único salto.
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${siteHost}` }],
        destination: `https://${siteHost}/:path*`,
        permanent: true,
      },
      // http → https quando o proxy/CDN repassa o protocolo original (Vercel e Cloudflare já fazem isso na borda).
      {
        source: "/:path*",
        has: [
          { type: "header", key: "x-forwarded-proto", value: "http" },
          { type: "host", value: siteHost },
        ],
        destination: `https://${siteHost}/:path*`,
        permanent: true,
      },
      // URL antiga da ferramenta (unificada em "redimensionar imagem e foto").
      {
        source: "/ferramentas/imagem/redimensionar-foto",
        destination: "/ferramentas/imagem/redimensionar-imagem",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Sem includeSubDomains/preload: só ative depois de confirmar HTTPS em todos os subdomínios.
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
