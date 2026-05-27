"use client";

import { useState } from "react";
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

const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

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

function BuscaCep() {
  const [cep, setCep] = useState("");
  const [resultado, setResultado] = useState<Endereco | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function buscar() {
    const limpo = cep.replace(/\D/g, "");
    if (limpo.length !== 8) {
      setErro("Informe um CEP com 8 dígitos.");
      return;
    }
    setCarregando(true);
    setErro("");
    setResultado(null);
    try {
      const res = await fetch(`/ws/${limpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErro("CEP não encontrado.");
      } else {
        setResultado(data);
      }
    } catch {
      setErro("Erro ao consultar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          placeholder="Digite o CEP (ex: 01001-000)"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          inputMode="numeric"
          pattern="[0-9\-]*"
          className="flex-1 h-12 px-4 text-base bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all font-mono"
          maxLength={9}
        />
        <button
          onClick={buscar}
          disabled={carregando}
          className="h-12 px-6 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          {carregando ? "Buscando..." : "Consultar"}
        </button>
      </div>
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      {resultado && <ResultadoCep endereco={resultado} />}
    </div>
  );
}

function useAutocomplete(tipo: string, uf: string, cidade?: string) {
  const [query, setQuery] = useState("");
  const [valor, setValor] = useState("");
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [aberto, setAberto] = useState(false);
  const timerRef = useState<ReturnType<typeof setTimeout> | null>(null);

  function onChange(texto: string) {
    setQuery(texto);
    setValor(texto);

    if (timerRef[0]) clearTimeout(timerRef[0]);

    if (texto.length < 2 || !uf) {
      setSugestoes([]);
      setAberto(false);
      return;
    }

    timerRef[0] = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ tipo, uf, q: texto });
        if (cidade) params.set("cidade", cidade);
        const res = await fetch(`/api/autocomplete?${params}`);
        const data: string[] = await res.json();
        setSugestoes(data);
        setAberto(data.length > 0);
      } catch {
        setSugestoes([]);
      }
    }, 250);
  }

  function selecionar(item: string) {
    setValor(item);
    setQuery(item);
    setSugestoes([]);
    setAberto(false);
  }

  function fechar() {
    setTimeout(() => setAberto(false), 150);
  }

  return { valor, query, sugestoes, aberto, onChange, selecionar, fechar, setValor };
}

function AutocompleteInput({
  placeholder,
  valor,
  sugestoes,
  aberto,
  onChange,
  onSelect,
  onBlur,
  onKeyDown,
}: {
  placeholder: string;
  valor: string;
  sugestoes: string[];
  aberto: boolean;
  onChange: (v: string) => void;
  onSelect: (v: string) => void;
  onBlur: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  return (
    <div className="relative">
      <input
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="w-full h-12 px-4 text-base bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
      />
      {aberto && sugestoes.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-white/[0.1] bg-[#1a1525] overflow-hidden shadow-xl">
          {sugestoes.map((s) => (
            <button
              key={s}
              onMouseDown={() => onSelect(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-violet-600/20 hover:text-white transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BuscaEndereco() {
  const [uf, setUf] = useState("");
  const [resultados, setResultados] = useState<Endereco[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const cidadeAc = useAutocomplete("cidade", uf);
  const ruaAc = useAutocomplete("rua", uf, cidadeAc.valor);

  async function buscar() {
    if (!uf) { setErro("Selecione o estado."); return; }
    if (cidadeAc.valor.length < 3) { setErro("Cidade deve ter pelo menos 3 caracteres."); return; }
    if (ruaAc.valor.length < 3) { setErro("Rua deve ter pelo menos 3 caracteres."); return; }
    setCarregando(true);
    setErro("");
    setResultados([]);
    try {
      const res = await fetch(`/ws/${uf}/${encodeURIComponent(cidadeAc.valor)}/${encodeURIComponent(ruaAc.valor)}/json/`);
      const data = await res.json();
      if (Array.isArray(data) && data.length === 0) {
        setErro("Nenhum endereço encontrado.");
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
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <select
          value={uf}
          onChange={(e) => { setUf(e.target.value); cidadeAc.setValor(""); ruaAc.setValor(""); }}
          className="h-12 px-4 text-base bg-white/[0.06] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer"
        >
          <option value="" className="bg-[#0c0a14]">Estado (UF)</option>
          {UFS.map((u) => (
            <option key={u} value={u} className="bg-[#0c0a14]">{u}</option>
          ))}
        </select>
        <AutocompleteInput
          placeholder="Cidade"
          valor={cidadeAc.valor}
          sugestoes={cidadeAc.sugestoes}
          aberto={cidadeAc.aberto}
          onChange={cidadeAc.onChange}
          onSelect={cidadeAc.selecionar}
          onBlur={cidadeAc.fechar}
        />
        <AutocompleteInput
          placeholder="Rua / Logradouro"
          valor={ruaAc.valor}
          sugestoes={ruaAc.sugestoes}
          aberto={ruaAc.aberto}
          onChange={ruaAc.onChange}
          onSelect={ruaAc.selecionar}
          onBlur={ruaAc.fechar}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
        />
      </div>
      <button
        onClick={buscar}
        disabled={carregando}
        className="h-12 px-6 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors cursor-pointer"
      >
        {carregando ? "Buscando..." : "Buscar CEP"}
      </button>
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      {resultados.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-white/40">{resultados.length} resultado{resultados.length > 1 ? "s" : ""}</p>
          {resultados.map((r, i) => (
            <ResultadoCep key={i} endereco={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConsultaPage() {
  const [aba, setAba] = useState<"cep" | "endereco">("cep");

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
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">
            Consultar CEP
          </h1>
          <p className="text-lg text-white/50 leading-relaxed">
            Busque qualquer CEP do Brasil ou encontre o CEP de um endereço.
            Base oficial dos Correios atualizada.
          </p>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAba("cep")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              aba === "cep" ? "bg-violet-600 text-white" : "bg-white/[0.06] text-white/50 hover:text-white"
            }`}
          >
            Buscar por CEP
          </button>
          <button
            onClick={() => setAba("endereco")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              aba === "endereco" ? "bg-violet-600 text-white" : "bg-white/[0.06] text-white/50 hover:text-white"
            }`}
          >
            Buscar por endereço
          </button>
        </div>

        {/* Busca */}
        <section className="mb-20">
          {aba === "cep" ? <BuscaCep /> : <BuscaEndereco />}
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
                  r: "Use a aba \"Buscar por endereço\": selecione o estado, digite a cidade e o nome da rua. O sistema retornará todos os CEPs correspondentes.",
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
