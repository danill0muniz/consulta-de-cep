"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

interface Endereco {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  erro?: boolean;
}

function ResultadoCep({ endereco }: { endereco: Endereco }) {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-6 sm:p-8">
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: "CEP", valor: endereco.cep },
          { label: "Logradouro", valor: endereco.logradouro },
          { label: "Complemento", valor: endereco.complemento },
          { label: "Bairro", valor: endereco.bairro },
          { label: "Cidade", valor: endereco.localidade },
          { label: "Estado", valor: endereco.uf },
          { label: "IBGE", valor: endereco.ibge },
        ]
          .filter((c) => c.valor)
          .map((campo) => (
            <div key={campo.label}>
              <p className="text-xs text-white/40 mb-0.5">{campo.label}</p>
              <p className="text-sm font-medium">{campo.valor}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

function isCep(texto: string): boolean {
  return /^\d{5}-?\d{0,3}$/.test(texto.trim()) && texto.replace(/\D/g, "").length >= 5;
}

function BuscaUnificada() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Endereco[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [dica, setDica] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscar = useCallback(async (texto?: string) => {
    const q = (texto ?? query).trim();
    if (!q) return;

    setCarregando(true);
    setErro("");
    setResultados([]);
    setDica("");

    const limpo = q.replace(/\D/g, "");

    try {
      // Se parece CEP (só números, 8 dígitos)
      if (/^\d{5,8}$/.test(limpo) && limpo.length === 8) {
        const res = await fetch(`/ws/${limpo}/json/`);
        const data = await res.json();
        if (data.erro) {
          setErro("CEP não encontrado.");
        } else {
          setResultados([data]);
        }
        return;
      }

      // Se parece CEP com hífen
      if (/^\d{5}-\d{3}$/.test(q.trim())) {
        const cep = q.replace(/\D/g, "");
        const res = await fetch(`/ws/${cep}/json/`);
        const data = await res.json();
        if (data.erro) {
          setErro("CEP não encontrado.");
        } else {
          setResultados([data]);
        }
        return;
      }

      // Busca por endereço — tentar extrair UF, cidade e logradouro
      const partes = q.split(/[,\s]+/).filter(Boolean);

      // Tentar encontrar UF nas partes
      const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];
      let uf = "";
      let restante = [...partes];

      for (let i = partes.length - 1; i >= 0; i--) {
        if (UFS.includes(partes[i].toUpperCase())) {
          uf = partes[i].toUpperCase();
          restante.splice(i, 1);
          break;
        }
      }

      if (!uf || restante.length < 2) {
        setErro("Para buscar por endereço, informe a rua, cidade e estado.");
        setDica("Exemplos: \"Paulista, São Paulo, SP\" ou \"Diana Perdizes SP\"");
        return;
      }

      // Última palavra(s) = logradouro, penúltima(s) = cidade
      // Heurística: se tem vírgula, separar por vírgula
      const comVirgula = q.replace(new RegExp(`\\b${uf}\\b`, "i"), "").split(",").map(s => s.trim()).filter(Boolean);

      let cidade = "";
      let logradouro = "";

      if (comVirgula.length >= 2) {
        logradouro = comVirgula[0];
        cidade = comVirgula[1];
      } else {
        // Sem vírgula: primeira palavra = logradouro, última = cidade (ou vice-versa)
        // Tentar buscar as últimas palavras como cidade
        logradouro = restante.slice(0, Math.ceil(restante.length / 2)).join(" ");
        cidade = restante.slice(Math.ceil(restante.length / 2)).join(" ");
      }

      if (cidade.length < 3 || logradouro.length < 3) {
        setErro("Cidade e logradouro devem ter pelo menos 3 caracteres.");
        setDica("Exemplos: \"Paulista, São Paulo, SP\" ou \"Nove de Julho, Ribeirão Preto, SP\"");
        return;
      }

      const res = await fetch(`/ws/${uf}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`);
      const data = await res.json();

      if (Array.isArray(data) && data.length === 0) {
        // Tentar invertendo cidade e logradouro
        const res2 = await fetch(`/ws/${uf}/${encodeURIComponent(logradouro)}/${encodeURIComponent(cidade)}/json/`);
        const data2 = await res2.json();
        if (Array.isArray(data2) && data2.length > 0) {
          setResultados(data2);
        } else {
          setErro("Nenhum endereço encontrado.");
          setDica("Tente separar com vírgulas: \"Rua, Cidade, UF\"");
        }
      } else if (Array.isArray(data)) {
        setResultados(data);
      } else {
        setErro("Erro na busca.");
      }
    } catch {
      setErro("Erro ao consultar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [query]);

  function onQueryChange(texto: string) {
    setQuery(texto);

    // Auto-buscar se digitou CEP completo
    const limpo = texto.replace(/\D/g, "");
    if (limpo.length === 8 && /^\d{5}-?\d{3}$/.test(texto.trim())) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => buscar(texto), 400);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              placeholder="Digite um CEP ou endereço (ex: Paulista, São Paulo, SP)"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
              className="w-full h-14 pl-12 pr-4 text-base bg-white/[0.06] border border-white/[0.1] rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>
          <button
            onClick={() => buscar()}
            disabled={carregando || !query.trim()}
            className="h-14 px-7 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-2xl transition-colors cursor-pointer whitespace-nowrap"
          >
            {carregando ? "Buscando..." : "Consultar"}
          </button>
        </div>
        {!query && (
          <div className="flex flex-wrap gap-2 mt-3">
            {["01001-000", "Paulista, São Paulo, SP", "Diana, São Paulo, SP"].map((ex) => (
              <button
                key={ex}
                onClick={() => { setQuery(ex); buscar(ex); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>
      {erro && (
        <div>
          <p className="text-sm text-red-400">{erro}</p>
          {dica && <p className="text-xs text-white/30 mt-1">{dica}</p>}
        </div>
      )}
      {resultados.length > 0 && (
        <div className="space-y-3">
          {resultados.length > 1 && (
            <p className="text-sm text-white/40">{resultados.length} resultados</p>
          )}
          {resultados.map((r, i) => (
            <ResultadoCep key={i} endereco={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConsultaPage() {
  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0c0a14]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-lg bg-violet-600 flex items-center justify-center font-mono">
              <span className="text-white text-[11px] font-bold">&lt;/&gt;</span>
            </div>
            <span className="text-base font-semibold tracking-tight">Consulta de CEP</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-8 text-[13px] font-medium text-white/50">
            <Link href="/#documentacao" className="hover:text-white transition-colors">API</Link>
            <Link href="/consulta" className="text-violet-400">Consultar</Link>
            <Link href="/mcp" className="hover:text-white transition-colors">MCP</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">
            Consultar CEP
          </h1>
          <p className="text-lg text-white/50 leading-relaxed">
            Digite um CEP ou endereço para buscar. Base oficial dos Correios.
          </p>
        </div>

        {/* Busca unificada */}
        <section className="mb-20">
          <BuscaUnificada />
        </section>

        {/* Conteúdo SEO */}
        <section className="space-y-16 text-sm text-white/50 leading-relaxed">
          {/* O que é CEP */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">O que é CEP?</h2>
            <p className="mb-3">
              O <strong className="text-white/70">CEP (Código de Endereçamento Postal)</strong> é um sistema
              de códigos numéricos criado pelos Correios do Brasil para organizar e agilizar a
              distribuição de correspondências e encomendas em todo o território nacional.
            </p>
            <p className="mb-3">
              Cada CEP possui <strong className="text-white/70">8 dígitos numéricos</strong> no formato
              XXXXX-XXX, onde os primeiros dígitos identificam a região, sub-região, setor,
              subsetor e divisor de subsetor, permitindo uma localização precisa do destino.
            </p>
            <p>
              O sistema de CEP foi implantado em 1972 e hoje cobre mais de{" "}
              <strong className="text-white/70">1,5 milhão de logradouros</strong> em todos os 27 estados
              brasileiros, incluindo o Distrito Federal.
            </p>
          </div>

          {/* Como funciona */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Como funciona a consulta de CEP?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="size-8 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-violet-400 text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/70 mb-1">Busca por CEP</h3>
                  <p>Digite o CEP com 8 dígitos e receba o endereço completo: logradouro, bairro, cidade, estado e código IBGE.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-8 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-violet-400 text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/70 mb-1">Busca por endereço</h3>
                  <p>Não sabe o CEP? Informe o estado, a cidade e o nome da rua para encontrar todos os CEPs correspondentes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-8 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-violet-400 text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/70 mb-1">Base atualizada</h3>
                  <p>Os dados são da base oficial eDNE dos Correios, atualizada periodicamente, garantindo informações confiáveis e precisas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estrutura do CEP */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Estrutura do CEP brasileiro</h2>
            <p className="mb-4">
              O CEP é composto por 8 dígitos divididos em duas partes separadas por hífen (XXXXX-XXX).
              Cada grupo de dígitos tem um significado:
            </p>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-white/40 font-medium">Dígito</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium">Identificação</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium hidden sm:table-cell">Exemplo</th>
                  </tr>
                </thead>
                <tbody className="text-white/60">
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-4 py-3 font-mono text-violet-400">X____-___</td>
                    <td className="px-4 py-3">Região</td>
                    <td className="px-4 py-3 hidden sm:table-cell">0 = Grande São Paulo</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-4 py-3 font-mono text-violet-400">_X___-___</td>
                    <td className="px-4 py-3">Sub-região</td>
                    <td className="px-4 py-3 hidden sm:table-cell">01 = Centro de SP</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-4 py-3 font-mono text-violet-400">__X__-___</td>
                    <td className="px-4 py-3">Setor</td>
                    <td className="px-4 py-3 hidden sm:table-cell">010 = Sé</td>
                  </tr>
                  <tr className="border-b border-white/[0.04]">
                    <td className="px-4 py-3 font-mono text-violet-400">___X_-___</td>
                    <td className="px-4 py-3">Subsetor</td>
                    <td className="px-4 py-3 hidden sm:table-cell">0100 = Praça da Sé</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-violet-400">____X-XXX</td>
                    <td className="px-4 py-3">Sufixo</td>
                    <td className="px-4 py-3 hidden sm:table-cell">01001-000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Faixas de CEP */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Faixas de CEP por região</h2>
            <p className="mb-4">
              O primeiro dígito do CEP indica a região do país. Veja a distribuição:
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { faixa: "01000-000 a 19999-999", regiao: "Grande São Paulo" },
                { faixa: "20000-000 a 28999-999", regiao: "Rio de Janeiro e Espírito Santo" },
                { faixa: "29000-000 a 29999-999", regiao: "Espírito Santo" },
                { faixa: "30000-000 a 39999-999", regiao: "Minas Gerais" },
                { faixa: "40000-000 a 49999-999", regiao: "Bahia e Sergipe" },
                { faixa: "50000-000 a 56999-999", regiao: "Pernambuco e Alagoas" },
                { faixa: "57000-000 a 57999-999", regiao: "Alagoas" },
                { faixa: "58000-000 a 58999-999", regiao: "Paraíba" },
                { faixa: "59000-000 a 59999-999", regiao: "Rio Grande do Norte" },
                { faixa: "60000-000 a 63999-999", regiao: "Ceará" },
                { faixa: "64000-000 a 64999-999", regiao: "Piauí" },
                { faixa: "65000-000 a 65999-999", regiao: "Maranhão" },
                { faixa: "66000-000 a 68899-999", regiao: "Pará e Amapá" },
                { faixa: "69000-000 a 69299-999", regiao: "Amazonas" },
                { faixa: "69900-000 a 69999-999", regiao: "Acre" },
                { faixa: "70000-000 a 72799-999", regiao: "Distrito Federal e Goiás" },
                { faixa: "74000-000 a 76799-999", regiao: "Goiás e Tocantins" },
                { faixa: "78000-000 a 78899-999", regiao: "Mato Grosso" },
                { faixa: "79000-000 a 79999-999", regiao: "Mato Grosso do Sul" },
                { faixa: "80000-000 a 87999-999", regiao: "Paraná" },
                { faixa: "88000-000 a 89999-999", regiao: "Santa Catarina" },
                { faixa: "90000-000 a 99999-999", regiao: "Rio Grande do Sul" },
              ].map((item) => (
                <div key={item.faixa} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-white/[0.02]">
                  <span className="font-mono text-xs text-violet-400 whitespace-nowrap">{item.faixa}</span>
                  <span className="text-xs text-white/40">—</span>
                  <span className="text-xs">{item.regiao}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Perguntas frequentes</h2>
            <div className="space-y-4">
              {[
                {
                  p: "O que é CEP?",
                  r: "CEP (Código de Endereçamento Postal) é um código numérico de 8 dígitos utilizado pelos Correios do Brasil para identificar localidades e logradouros, facilitando a entrega de correspondências e encomendas.",
                },
                {
                  p: "Como consultar um CEP?",
                  r: "Digite o CEP com 8 dígitos no campo de busca acima. Você receberá o endereço completo com logradouro, bairro, cidade, estado e código IBGE.",
                },
                {
                  p: "A consulta de CEP é gratuita?",
                  r: "Sim, a consulta é 100% gratuita, sem cadastro e sem limites. Desenvolvedores também podem usar nossa API REST gratuitamente.",
                },
                {
                  p: "De onde vêm os dados?",
                  r: "Os dados são da base oficial eDNE (e-Diretório Nacional de Endereços) dos Correios, com mais de 1,5 milhão de logradouros em todos os 27 estados.",
                },
                {
                  p: "Como descobrir o CEP de um endereço?",
                  r: "Digite o endereço no campo de busca no formato \"Rua, Cidade, UF\" (ex: Paulista, São Paulo, SP). O sistema retornará todos os CEPs correspondentes.",
                },
                {
                  p: "O CEP pode mudar?",
                  r: "Sim. Os Correios podem alterar CEPs quando há desmembramento de municípios ou reorganização postal. Nossa base é atualizada periodicamente.",
                },
                {
                  p: "Posso usar a API no meu sistema?",
                  r: "Sim! A API é gratuita e não requer cadastro. Basta fazer uma requisição GET para consultadecep.com/ws/{cep}/json/ e você receberá o endereço em JSON.",
                },
              ].map((faq) => (
                <details key={faq.p} className="group rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  <summary className="px-6 py-4 cursor-pointer text-sm font-medium text-white/70 hover:text-white transition-colors list-none flex items-center justify-between">
                    {faq.p}
                    <svg
                      className="size-4 text-white/30 group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-4 text-sm text-white/50 leading-relaxed">
                    {faq.r}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* CTA para devs */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Desenvolvedor?</h2>
            <p className="text-white/50 mb-6">
              Integre a consulta de CEP no seu sistema com nossa API REST gratuita.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/#documentacao"
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Ver documentação
              </Link>
              <Link
                href="/mcp"
                className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm font-medium rounded-xl transition-colors border border-white/[0.08]"
              >
                Integrar com IA
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity mb-3">
            <div className="size-6 rounded-md bg-violet-600 flex items-center justify-center font-mono">
              <span className="text-white text-[9px] font-bold">&lt;/&gt;</span>
            </div>
            <span className="text-sm font-semibold">Consulta de CEP</span>
          </Link>
          <p className="text-xs text-white/30">
            Base de dados: Correios (eDNE) — consultadecep.com
          </p>
          <p className="text-xs text-white/20 mt-2">
            <Link href="/privacidade" className="hover:text-white/40 transition-colors underline underline-offset-2">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
