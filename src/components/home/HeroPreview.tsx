import { Icon } from "@/components/ui/Icon";

const QR_SIZE = 21;

/** Padrão de QR Code ilustrativo (determinístico, não é um código válido). */
function qrCells(): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= QR_SIZE - 8 && y < 8) || (x < 8 && y >= QR_SIZE - 8);
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (inFinder(x, y)) continue;
      if ((x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0) cells.push([x, y]);
    }
  }
  return cells;
}

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={7} height={7} rx={1.5} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={1} fill="white" />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill="currentColor" />
    </g>
  );
}

/** Composição decorativa do hero: prévias das ferramentas em uso. */
export function HeroPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[32rem] w-full max-w-lg select-none">
      {/* Card principal: compressão de imagem */}
      <div className="absolute left-0 top-12 z-10 w-[18rem] animate-float rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_30px_60px_-25px_rgb(15_23_42/0.35)] backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-[0.75rem] bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
            <Icon name="image" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">foto-praia.jpg</p>
            <p className="text-xs text-slate-500">Comprimir imagem</p>
          </div>
          <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">-84%</span>
        </div>
        <div className="mt-4 aspect-[16/9] overflow-hidden rounded-[1rem] bg-linear-to-br from-sky-300 via-cyan-200 to-amber-100">
          <div className="relative h-full w-full">
            <div className="absolute right-6 top-4 size-8 rounded-full bg-yellow-200 shadow-[0_0_30px_rgb(253_224_71/0.9)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-sky-600/70 to-sky-400/40 [clip-path:polygon(0_40%,20%_25%,45%_45%,70%_20%,100%_40%,100%_100%,0_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-amber-200/90" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-slate-500 line-through">2,4 MB</span>
          <span className="font-semibold text-slate-900">380 KB</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-full rounded-full bg-linear-to-r from-green-500 to-emerald-400" />
        </div>
      </div>

      {/* Card Pix */}
      <div className="absolute right-0 top-0 w-44 animate-float-slow rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_30px_60px_-25px_rgb(15_23_42/0.35)] [animation-delay:-3s]">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-[0.5rem] bg-linear-to-br from-teal-400 to-cyan-600 text-white">
            <Icon name="pix" className="size-4" />
          </span>
          <p className="text-xs font-semibold text-slate-900">QR Code Pix</p>
        </div>
        <svg viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`} className="mt-3 w-full text-slate-900">
          <rect x={-1} y={-1} width={QR_SIZE + 2} height={QR_SIZE + 2} rx={2} fill="white" />
          {qrCells().map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.2} fill="currentColor" />
          ))}
          <Finder x={0} y={0} />
          <Finder x={QR_SIZE - 7} y={0} />
          <Finder x={0} y={QR_SIZE - 7} />
        </svg>
        <p className="mt-2 text-center font-display text-lg font-extrabold text-slate-900">R$ 150,00</p>
      </div>

      {/* Card calculadora */}
      <div className="absolute bottom-6 right-0 z-20 w-60 animate-float rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-[0_30px_60px_-20px_rgb(15_23_42/0.6)] [animation-delay:-1.5s]">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Icon name="calculator" className="size-4 text-amber-400" />
          Calculadora de porcentagem
        </div>
        <p className="mt-3 text-sm text-slate-300">15% de R$ 2.400</p>
        <p className="font-display text-3xl font-extrabold tracking-tight">R$ 360,00</p>
      </div>

      {/* Selo de privacidade */}
      <div className="absolute bottom-10 left-2 z-20 flex animate-float-slow items-center gap-2 rounded-full border border-green-200 bg-white px-3.5 py-2 text-xs font-semibold text-green-800 shadow-lg [animation-delay:-5s]">
        <Icon name="shield" className="size-4 text-green-600" />
        Processado no seu navegador
      </div>
    </div>
  );
}
