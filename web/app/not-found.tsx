import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0c0a14] text-white flex flex-col items-center justify-center px-6">
      <div className="size-16 rounded-2xl bg-violet-600 flex items-center justify-center font-mono mb-6">
        <span className="text-white text-2xl font-bold">&lt;/&gt;</span>
      </div>
      <h1 className="text-6xl font-bold tracking-tight mb-3">404</h1>
      <p className="text-lg text-white/50 mb-8">
        Página não encontrada.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors"
        >
          Voltar ao início
        </Link>
        <Link
          href="/#documentacao"
          className="px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 font-medium rounded-xl transition-colors border border-white/[0.08]"
        >
          Documentação
        </Link>
      </div>
    </div>
  );
}
