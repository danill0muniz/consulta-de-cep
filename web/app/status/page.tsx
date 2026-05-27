"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ApiStatus } from "@/components/api-status";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const CEP_TESTE = "01001000";

type Status = "verificando" | "operacional" | "degradado" | "fora";

interface Verificacao {
  nome: string;
  descricao: string;
  status: Status;
  latencia?: number;
  detalhe?: string;
}

function indicadorCor(status: Status) {
  switch (status) {
    case "operacional":
      return "bg-emerald-400";
    case "degradado":
      return "bg-amber-400";
    case "fora":
      return "bg-red-400";
    default:
      return "bg-white/20 animate-pulse";
  }
}

function labelStatus(status: Status) {
  switch (status) {
    case "operacional":
      return "Operacional";
    case "degradado":
      return "Degradado";
    case "fora":
      return "Fora do ar";
    default:
      return "Verificando...";
  }
}

function corTextoStatus(status: Status) {
  switch (status) {
    case "operacional":
      return "text-emerald-400";
    case "degradado":
      return "text-amber-400";
    case "fora":
      return "text-red-400";
    default:
      return "text-white/40";
  }
}

function StatusCard({ verificacao }: { verificacao: Verificacao }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-white/[0.15] transition-all">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{verificacao.nome}</h3>
        <div className="flex items-center gap-2">
          <div className={`size-2.5 rounded-full ${indicadorCor(verificacao.status)}`} />
          <span className={`text-sm font-medium ${corTextoStatus(verificacao.status)}`}>
            {labelStatus(verificacao.status)}
          </span>
        </div>
      </div>
      <p className="text-sm text-white/40 leading-relaxed">{verificacao.descricao}</p>
      {verificacao.latencia !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-white/30">Latência:</span>
          <span
            className={`text-xs font-mono font-medium ${
              verificacao.latencia < 200
                ? "text-emerald-400"
                : verificacao.latencia < 500
                  ? "text-amber-400"
                  : "text-red-400"
            }`}
          >
            {verificacao.latencia}ms
          </span>
        </div>
      )}
      {verificacao.detalhe && (
        <p className="mt-2 text-xs text-white/25">{verificacao.detalhe}</p>
      )}
    </div>
  );
}

export default function StatusPage() {
  const [verificacoes, setVerificacoes] = useState<Verificacao[]>([
    {
      nome: "API REST",
      descricao: "Endpoint principal de consulta de CEP via HTTP.",
      status: "verificando",
    },
    {
      nome: "Banco de Dados",
      descricao: "Base SQLite com dados dos Correios (eDNE).",
      status: "verificando",
    },
    {
      nome: "Busca por Endereço",
      descricao: "Pesquisa reversa por UF, cidade e logradouro.",
      status: "verificando",
    },
  ]);
  const [ultimaVerificacao, setUltimaVerificacao] = useState<string>("");

  const verificar = useCallback(async () => {
    const novasVerificacoes: Verificacao[] = [];

    // Teste 1: consulta por CEP (testa API + banco)
    let apiOk = false;
    let latenciaApi = 0;
    try {
      const inicio = performance.now();
      const res = await fetch(`${API_URL}/ws/${CEP_TESTE}/json/`);
      latenciaApi = Math.round(performance.now() - inicio);
      const data = await res.json();

      if (res.ok && data.cep) {
        apiOk = true;
        novasVerificacoes.push({
          nome: "API REST",
          descricao: "Endpoint principal de consulta de CEP via HTTP.",
          status: latenciaApi > 500 ? "degradado" : "operacional",
          latencia: latenciaApi,
          detalhe: `CEP ${CEP_TESTE} retornou "${data.logradouro}" com sucesso.`,
        });
        novasVerificacoes.push({
          nome: "Banco de Dados",
          descricao: "Base SQLite com dados dos Correios (eDNE).",
          status: "operacional",
          detalhe: "Consulta retornou dados válidos — banco respondendo normalmente.",
        });
      } else {
        novasVerificacoes.push({
          nome: "API REST",
          descricao: "Endpoint principal de consulta de CEP via HTTP.",
          status: "degradado",
          latencia: latenciaApi,
          detalhe: `Resposta inesperada: status ${res.status}.`,
        });
        novasVerificacoes.push({
          nome: "Banco de Dados",
          descricao: "Base SQLite com dados dos Correios (eDNE).",
          status: "degradado",
          detalhe: "A API respondeu, mas sem dados válidos.",
        });
      }
    } catch {
      novasVerificacoes.push({
        nome: "API REST",
        descricao: "Endpoint principal de consulta de CEP via HTTP.",
        status: "fora",
        detalhe: "Não foi possível conectar à API.",
      });
      novasVerificacoes.push({
        nome: "Banco de Dados",
        descricao: "Base SQLite com dados dos Correios (eDNE).",
        status: "fora",
        detalhe: "Sem resposta da API — não é possível verificar o banco.",
      });
    }

    // Teste 2: busca por endereço
    try {
      const inicio = performance.now();
      const res = await fetch(`${API_URL}/ws/SP/São Paulo/Paulista/json/`);
      const latencia = Math.round(performance.now() - inicio);
      const data = await res.json();

      if (res.ok && Array.isArray(data) && data.length > 0) {
        novasVerificacoes.push({
          nome: "Busca por Endereço",
          descricao: "Pesquisa reversa por UF, cidade e logradouro.",
          status: latencia > 500 ? "degradado" : "operacional",
          latencia,
          detalhe: `Retornou ${data.length} resultado${data.length > 1 ? "s" : ""} para "Paulista" em São Paulo/SP.`,
        });
      } else {
        novasVerificacoes.push({
          nome: "Busca por Endereço",
          descricao: "Pesquisa reversa por UF, cidade e logradouro.",
          status: apiOk ? "degradado" : "fora",
          latencia,
          detalhe: "A busca não retornou resultados esperados.",
        });
      }
    } catch {
      novasVerificacoes.push({
        nome: "Busca por Endereço",
        descricao: "Pesquisa reversa por UF, cidade e logradouro.",
        status: "fora",
        detalhe: "Não foi possível realizar a busca por endereço.",
      });
    }

    setVerificacoes(novasVerificacoes);
    setUltimaVerificacao(
      new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  }, []);

  useEffect(() => {
    verificar();
    const intervalo = setInterval(verificar, 30000);
    return () => clearInterval(intervalo);
  }, [verificar]);

  const statusGeral: Status = verificacoes.some((v) => v.status === "verificando")
    ? "verificando"
    : verificacoes.every((v) => v.status === "operacional")
      ? "operacional"
      : verificacoes.some((v) => v.status === "fora")
        ? "fora"
        : "degradado";

  return (
    <div className="flex flex-col min-h-full bg-[#0c0a14] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0c0a14]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-lg bg-violet-600 flex items-center justify-center font-mono">
              <span className="text-white text-[11px] font-bold">&lt;/&gt;</span>
            </div>
            <span className="text-base font-semibold tracking-tight">
              Consulta de CEP
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-8 text-[13px] font-medium text-white/50">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/consulta" className="hover:text-white transition-colors">
              Consultar CEP
            </Link>
            <Link href="/mcp" className="hover:text-white transition-colors">
              MCP
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.1)_0%,_transparent_50%)]" />

          <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-28">
            {/* Título + status geral */}
            <div className="mb-14">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Status do Sistema
              </h1>
              <div className="mt-6 flex items-center gap-3">
                <div className={`size-3 rounded-full ${indicadorCor(statusGeral)}`} />
                <span className={`text-lg font-semibold ${corTextoStatus(statusGeral)}`}>
                  {statusGeral === "operacional"
                    ? "Todos os sistemas operacionais"
                    : statusGeral === "degradado"
                      ? "Desempenho degradado em alguns serviços"
                      : statusGeral === "fora"
                        ? "Alguns serviços estão fora do ar"
                        : "Verificando status dos serviços..."}
                </span>
              </div>
              {ultimaVerificacao && (
                <p className="mt-3 text-sm text-white/30">
                  Última verificação: {ultimaVerificacao}
                </p>
              )}
            </div>

            {/* Cards de status */}
            <div className="space-y-4">
              {verificacoes.map((v) => (
                <StatusCard key={v.nome} verificacao={v} />
              ))}
            </div>

            {/* Botão de re-verificação */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={verificar}
                className="h-10 px-6 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                Verificar novamente
              </button>
              <span className="text-xs text-white/25">
                Atualiza automaticamente a cada 30 segundos
              </span>
            </div>

            {/* Info */}
            <div className="mt-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <h2 className="font-semibold text-white mb-3">Como funciona</h2>
              <div className="text-sm text-white/40 space-y-2 leading-relaxed">
                <p>
                  Esta página realiza consultas reais à API para verificar o
                  funcionamento de cada serviço. Uma consulta por CEP testa a API
                  REST e o banco de dados simultaneamente, enquanto uma busca por
                  endereço valida a pesquisa reversa.
                </p>
                <p>
                  A latência exibida é medida do seu navegador até o servidor —
                  pode variar conforme sua conexão e localização.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/30">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-400" />
                  <span>Operacional — tudo normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-amber-400" />
                  <span>Degradado — latência alta ou resposta parcial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-red-400" />
                  <span>Fora do ar — sem resposta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="size-6 rounded-md bg-violet-600 flex items-center justify-center font-mono">
                <span className="text-white text-[9px] font-bold">&lt;/&gt;</span>
              </div>
              <span className="text-sm font-medium text-white/70">
                Consulta de CEP
              </span>
            </Link>
            <p className="text-xs text-white/30">
              Base de dados: Correios (eDNE) — consultadecep.com
            </p>
          </div>
          <div className="mt-4 flex justify-center sm:justify-start">
            <ApiStatus />
          </div>
        </div>
      </footer>
    </div>
  );
}
