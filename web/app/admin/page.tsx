"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Analytics {
  periodo: { dias: number; de: string; ate: string };
  total_requests: number;
  requests_por_dia: { dia: string; total: number }[];
  hoje: {
    total: number;
    top_dominios: { nome: string; total: number }[];
    top_ceps: { nome: string; total: number }[];
    top_ips: { nome: string; total: number }[];
  };
  periodo_completo: {
    top_dominios: { nome: string; total: number }[];
    top_ceps: { nome: string; total: number }[];
  };
}

function BarChart({ items, max }: { items: { nome: string; total: number }[]; max: number }) {
  if (items.length === 0) return <p className="text-sm text-white/30">Sem dados</p>;
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.nome} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/60 truncate max-w-[200px]" title={item.nome}>
                {item.nome || "(vazio)"}
              </span>
              <span className="text-xs text-white/40 font-mono ml-2">{item.total.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{ width: `${Math.max((item.total / max) * 100, 2)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
      <h3 className="text-sm font-semibold text-white/70 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [dados, setDados] = useState<Analytics | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [dias, setDias] = useState(7);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch(`/api/analytics?token=${token}&dias=${dias}`);
      const data = await res.json();
      if (data.erro) {
        setErro(data.mensagem || "Token inválido.");
        setAutenticado(false);
      } else {
        setDados(data);
        setAutenticado(true);
      }
    } catch {
      setErro("Erro ao carregar dados.");
    } finally {
      setCarregando(false);
    }
  }, [token, dias]);

  useEffect(() => {
    if (autenticado) carregar();
  }, [dias, autenticado, carregar]);

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#0c0a14] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-4">
          <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-lg bg-violet-600 flex items-center justify-center font-mono">
              <span className="text-white text-[11px] font-bold">&lt;/&gt;</span>
            </div>
            <span className="text-base font-semibold">Admin</span>
          </Link>
          {erro && <p className="text-sm text-red-400">{erro}</p>}
          <input
            type="password"
            placeholder="Token de acesso"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && carregar()}
            className="w-full h-12 px-4 text-[16px] bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
          />
          <button
            onClick={carregar}
            disabled={carregando || !token}
            className="w-full h-12 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors cursor-pointer"
          >
            {carregando ? "Verificando..." : "Entrar"}
          </button>
        </div>
      </div>
    );
  }

  if (!dados) return null;

  const maxDiario = Math.max(...dados.requests_por_dia.map((d) => d.total), 1);

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
      <header className="sticky top-0 z-50 bg-[#0c0a14]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-lg bg-violet-600 flex items-center justify-center font-mono">
              <span className="text-white text-[11px] font-bold">&lt;/&gt;</span>
            </div>
            <span className="text-base font-semibold">Analytics</span>
          </Link>
          <div className="flex items-center gap-3">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDias(d)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  dias === d
                    ? "bg-violet-600 text-white"
                    : "bg-white/[0.06] text-white/50 hover:text-white"
                }`}
              >
                {d}d
              </button>
            ))}
            <button
              onClick={carregar}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              Atualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total (período)", valor: dados.total_requests },
            { label: "Hoje", valor: dados.hoje.total },
            { label: "Domínios hoje", valor: dados.hoje.top_dominios.length },
            { label: "IPs únicos hoje", valor: dados.hoje.top_ips.length },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-xs text-white/40 mb-1">{item.label}</p>
              <p className="text-2xl font-bold">{item.valor.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Gráfico de requests por dia */}
        <Card title={`Requests por dia (${dados.periodo.de} a ${dados.periodo.ate})`}>
          <div className="flex items-end gap-1 h-32">
            {[...dados.requests_por_dia].reverse().map((d) => (
              <div key={d.dia} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-violet-500/80 rounded-t-sm min-h-[2px] transition-all hover:bg-violet-400"
                  style={{ height: `${Math.max((d.total / maxDiario) * 100, 2)}%` }}
                  title={`${d.dia}: ${d.total}`}
                />
                <span className="text-[9px] text-white/20 hidden sm:block">
                  {d.dia.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top listas */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <Card title="Top domínios (hoje)">
            <BarChart items={dados.hoje.top_dominios} max={dados.hoje.top_dominios[0]?.total || 1} />
          </Card>
          <Card title="Top CEPs (hoje)">
            <BarChart items={dados.hoje.top_ceps} max={dados.hoje.top_ceps[0]?.total || 1} />
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Card title={`Top domínios (${dias} dias)`}>
            <BarChart items={dados.periodo_completo.top_dominios} max={dados.periodo_completo.top_dominios[0]?.total || 1} />
          </Card>
          <Card title={`Top CEPs (${dias} dias)`}>
            <BarChart items={dados.periodo_completo.top_ceps} max={dados.periodo_completo.top_ceps[0]?.total || 1} />
          </Card>
        </div>

        <div className="mt-6">
          <Card title="Top IPs (hoje)">
            <BarChart items={dados.hoje.top_ips} max={dados.hoje.top_ips[0]?.total || 1} />
          </Card>
        </div>
      </main>
    </div>
  );
}
