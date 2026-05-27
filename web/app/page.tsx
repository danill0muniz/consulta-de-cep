"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_DISPLAY = "https://consultadecep.com";

interface CepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

function CodeBlock({ children, compact }: { children: string; compact?: boolean }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(children);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="relative group">
      <pre
        className={`bg-white/[0.04] text-violet-300 rounded-xl overflow-x-auto font-mono leading-relaxed border border-white/[0.08] backdrop-blur-sm ${
          compact ? "p-4 text-xs" : "p-5 text-[13px]"
        }`}
      >
        <code>{children}</code>
      </pre>
      <button
        onClick={copiar}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-white/10 hover:bg-white/20 text-white/50 text-xs px-2.5 py-1 rounded-lg"
      >
        {copiado ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}

function CepTester() {
  const [cep, setCep] = useState("");
  const [resultado, setResultado] = useState<CepResult | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function consultar() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setErro("Informe um CEP com 8 dígitos.");
      return;
    }

    setCarregando(true);
    setErro("");
    setResultado(null);

    try {
      const res = await fetch(`${API_URL}/ws/${cepLimpo}/json/`);
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
          placeholder="Ex: 01001-000"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && consultar()}
          inputMode="numeric"
          pattern="[0-9\-]*"
          className="font-mono w-full sm:w-[200px] h-12 px-4 text-base bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
          maxLength={9}
        />
        <button
          onClick={consultar}
          disabled={carregando}
          className="h-12 px-7 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors cursor-pointer"
        >
          {carregando ? "Buscando..." : "Consultar"}
        </button>
      </div>

      {erro && (
        <p className="text-red-400 text-sm font-medium">{erro}</p>
      )}

      {resultado && (
        <div className="mt-2">
          <CodeBlock>{JSON.stringify(resultado, null, 2)}</CodeBlock>
        </div>
      )}
    </div>
  );
}

function MobileMenu() {
  const [aberto, setAberto] = useState(false);

  const links = [
    { href: "/consulta", label: "Consultar CEP" },
    { href: "#documentacao", label: "Documentação" },
    { href: "#exemplos", label: "Exemplos" },
    { href: "#testar", label: "Testar" },
    { href: "/mcp", label: "MCP" },
  ];

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed top-3 right-4 z-[60] flex flex-col justify-center items-center size-10 gap-[5px] cursor-pointer"
        aria-label="Menu"
      >
        <span
          className={`block h-[2px] w-5 rounded-full transition-all duration-300 ${
            aberto ? "rotate-45 translate-y-[7px] bg-white" : "bg-white/70"
          }`}
        />
        <span
          className={`block h-[2px] w-5 bg-white/70 rounded-full transition-all duration-300 ${
            aberto ? "opacity-0 scale-0" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-5 rounded-full transition-all duration-300 ${
            aberto ? "-rotate-45 -translate-y-[7px] bg-white" : "bg-white/70"
          }`}
        />
      </button>

      {/* Overlay */}
      {aberto && (
        <div className="fixed inset-0 z-[55] flex flex-col items-center justify-center gap-10 bg-[#0c0a14]">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setAberto(false)}
              className="text-3xl font-bold text-white/80 hover:text-white animate-[fadeInUp_0.3s_ease-out_forwards]"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [tabAtiva, setTabAtiva] = useState("javascript");

  const exemplos: Record<string, string> = {
    javascript: `// Consulta por CEP
const response = await fetch("${API_DISPLAY}/ws/01001000/json/");
const data = await response.json();

console.log(data.logradouro); // "Praça da Sé"
console.log(data.localidade); // "São Paulo"

// Consulta por endereço
const busca = await fetch("${API_DISPLAY}/ws/SP/São Paulo/Paulista/json/");
const resultados = await busca.json();

resultados.forEach(endereco => {
  console.log(\`\${endereco.cep} - \${endereco.logradouro}\`);
});`,
    python: `import requests

# Consulta por CEP
response = requests.get("${API_DISPLAY}/ws/01001000/json/")
data = response.json()

print(data["logradouro"])  # "Praça da Sé"
print(data["localidade"])  # "São Paulo"

# Consulta por endereço
busca = requests.get("${API_DISPLAY}/ws/SP/São Paulo/Paulista/json/")
for endereco in busca.json():
    print(f"{endereco['cep']} - {endereco['logradouro']}")`,
    php: `<?php
// Consulta por CEP
$json = file_get_contents("${API_DISPLAY}/ws/01001000/json/");
$data = json_decode($json);

echo $data->logradouro; // "Praça da Sé"
echo $data->localidade; // "São Paulo"

// Consulta por endereço
$busca = file_get_contents("${API_DISPLAY}/ws/SP/São Paulo/Paulista/json/");
$resultados = json_decode($busca);

foreach ($resultados as $endereco) {
    echo "{$endereco->cep} - {$endereco->logradouro}\\n";
}
?>`,
    curl: `# Consulta por CEP
curl ${API_DISPLAY}/ws/01001000/json/

# Consulta por endereço
curl "${API_DISPLAY}/ws/SP/São Paulo/Paulista/json/"`,
  };

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
            <Link href="/consulta" className="hover:text-white transition-colors">
              Consultar CEP
            </Link>
            <a href="#documentacao" className="hover:text-white transition-colors">
              Documentação
            </a>
            <a href="#exemplos" className="hover:text-white transition-colors">
              Exemplos
            </a>
            <a href="#testar" className="hover:text-white transition-colors">
              Testar
            </a>
            <Link href="/mcp" className="text-violet-400 hover:text-violet-300 transition-colors">
              MCP
            </Link>
          </nav>
        </div>
      </header>
      <MobileMenu />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.08)_0%,_transparent_50%)]" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-1.5 mb-8">
              <div className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-medium text-white/60">
                Base dos Correios — atualizada periodicamente
              </span>
            </div>

            <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-[1.05]">
              Consulte qualquer{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                CEP do Brasil
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-xl leading-relaxed">
              API REST gratuita, sem cadastro, sem API key, sem limites.
              Integre em minutos.
            </p>

            <div className="mt-10 max-w-xl">
              <CodeBlock>{`curl ${API_DISPLAY}/ws/01001000/json/`}</CodeBlock>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Sem cadastro", "Sem API key", "Sem limites", "CORS", "HTTPS"].map(
                (item) => (
                  <span
                    key={item}
                    className="text-xs font-medium text-white/40 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-full"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { valor: "1,5M+", label: "Logradouros" },
              { valor: "83 mil", label: "Bairros" },
              { valor: "11 mil", label: "Localidades" },
              { valor: "27", label: "Estados" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {stat.valor}
                </div>
                <div className="text-sm text-white/40 mt-1 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentação */}
      <section id="documentacao" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Documentação
            </h2>
            <p className="mt-3 text-white/40 text-lg max-w-3xl leading-relaxed">
              Webservice gratuito de alto desempenho para consulta de Código de Endereçamento Postal (CEP) do Brasil.
              Basta uma requisição HTTP — sem autenticação, sem cadastro.
            </p>
          </div>

          <div className="space-y-16">
            {/* Acessando o webservice */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Acessando o webservice</h3>
              <div className="text-sm text-white/50 space-y-3 max-w-3xl leading-relaxed">
                <p>
                  Para acessar o webservice, um CEP no formato de <strong className="text-white/70">8 dígitos</strong> deve
                  ser fornecido. Após o CEP, informe o tipo de retorno desejado: <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">json</code>.
                </p>
                <p>
                  Exemplo de consulta:{" "}
                  <a
                    href={`${API_DISPLAY}/ws/01001000/json/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors font-mono text-xs"
                  >
                    {API_DISPLAY}/ws/01001000/json/
                  </a>
                </p>
              </div>
            </div>

            {/* Validação do CEP */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Validação do CEP</h3>
              <div className="text-sm text-white/50 space-y-3 max-w-3xl leading-relaxed">
                <p>
                  Quando consultado um CEP de formato inválido — por exemplo: &quot;950100100&quot; (9 dígitos),
                  &quot;95010A10&quot; (alfanumérico), &quot;95010 10&quot; (espaço) — o código de retorno será
                  um <strong className="text-white/70">400</strong> (Bad Request). Antes de acessar o webservice,
                  valide o formato do CEP e certifique-se que o mesmo possua <strong className="text-white/70">8 dígitos numéricos</strong>.
                </p>
                <p>
                  Quando consultado um CEP de formato válido, porém inexistente (ex: &quot;99999999&quot;),
                  o retorno conterá um valor de <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">&quot;erro&quot;: true</code>.
                  Isso significa que o CEP não foi encontrado na base de dados.
                </p>
              </div>
            </div>

            {/* Formato de retorno */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Formato de retorno</h3>
              <p className="text-sm text-white/50 mb-5 max-w-3xl leading-relaxed">
                A resposta é retornada em formato JSON. Veja abaixo um exemplo de consulta e a resposta completa:
              </p>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
                  <span className="text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                    GET
                  </span>
                  <a
                    href={`${API_DISPLAY}/ws/01001000/json/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
                  >
                    /ws/01001000/json/
                  </a>
                </div>
                <div className="p-6">
                  <CodeBlock compact>
                    {`{
  "cep": "01001-000",
  "logradouro": "Praça da Sé",
  "complemento": "- lado ímpar",
  "unidade": "",
  "bairro": "Sé",
  "localidade": "São Paulo",
  "uf": "SP",
  "ibge": "3550308",
  "gia": "",
  "ddd": "",
  "siafi": ""
}`}
                  </CodeBlock>
                </div>
              </div>
            </div>

            {/* Pesquisa de CEP */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Pesquisa de CEP por endereço</h3>
              <div className="text-sm text-white/50 space-y-3 max-w-3xl leading-relaxed">
                <p>
                  Existem situações onde o cliente desconhece o CEP do endereço. Para isso,
                  é possível realizar uma pesquisa informando três parâmetros obrigatórios:
                  <strong className="text-white/70"> UF</strong>,
                  <strong className="text-white/70"> Cidade</strong> e
                  <strong className="text-white/70"> Logradouro</strong>.
                  Cidade e Logradouro devem ter no mínimo 3 caracteres.
                </p>
                <p>
                  O resultado é ordenado pela proximidade do nome do logradouro e possui limite
                  máximo de <strong className="text-white/70">50 CEPs</strong>. Quanto mais específicos os parâmetros,
                  maior a precisão do resultado.
                </p>
                <p>Exemplos de pesquisa por endereço:</p>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { url: `${API_DISPLAY}/ws/RS/Porto Alegre/Domingos/json/`, label: "Busca por \"Domingos\" em Porto Alegre/RS" },
                  { url: `${API_DISPLAY}/ws/SP/São Paulo/Paulista/json/`, label: "Busca por \"Paulista\" em São Paulo/SP" },
                  { url: `${API_DISPLAY}/ws/SP/Ribeirão Preto/Nove de Julho/json/`, label: "Busca por \"Nove de Julho\" em Ribeirão Preto/SP" },
                ].map((ex) => (
                  <div key={ex.url} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <a
                      href={ex.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors break-all"
                    >
                      {ex.url}
                    </a>
                    <span className="text-xs text-white/30 hidden sm:inline">—</span>
                    <span className="text-xs text-white/30">{ex.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
                  <span className="text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                    GET
                  </span>
                  <span className="font-mono text-sm text-white/70">
                    /ws/&#123;uf&#125;/&#123;cidade&#125;/&#123;logradouro&#125;/json/
                  </span>
                </div>
                <div className="p-6">
                  <CodeBlock compact>
                    {`// Resposta (array de resultados)
[
  {
    "cep": "01310-100",
    "logradouro": "Avenida Paulista",
    "complemento": "- até 610 - lado par",
    "bairro": "Bela Vista",
    "localidade": "São Paulo",
    "uf": "SP",
    "ibge": "3550308"
  },
  ...
]`}
                  </CodeBlock>
                  <p className="mt-4 text-xs text-white/30">
                    Quando a cidade ou logradouro não contiver ao menos 3 caracteres, o retorno será
                    um <strong className="text-white/50">400</strong> (Bad Request).
                  </p>
                </div>
              </div>
            </div>

            {/* Limites de uso */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Limites de uso</h3>
              <div className="text-sm text-white/50 space-y-3 max-w-3xl leading-relaxed">
                <p>
                  A API é <strong className="text-white/70">gratuita e sem cadastro</strong>, mas para garantir a
                  disponibilidade do serviço para todos, aplicamos um limite de{" "}
                  <strong className="text-white/70">100 requisições por minuto por IP</strong>.
                </p>
                <p>
                  Ao exceder o limite, a API retornará o código <strong className="text-white/70">429</strong>{" "}
                  (Too Many Requests) com o header <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">Retry-After</code>{" "}
                  indicando quantos segundos aguardar antes de tentar novamente.
                </p>
                <p>
                  Cada resposta inclui os headers <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">X-RateLimit-Limit</code>,{" "}
                  <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">X-RateLimit-Remaining</code> e{" "}
                  <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">X-RateLimit-Reset</code>{" "}
                  para que você possa monitorar seu consumo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exemplos */}
      <section id="exemplos" className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Exemplos de uso
            </h2>
            <p className="mt-3 text-white/40 text-lg">
              Copie e cole no seu projeto.
            </p>
          </div>

          <div>
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {["javascript", "python", "php", "curl"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTabAtiva(tab)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    tabAtiva === tab
                      ? "bg-violet-600 text-white"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  {tab === "javascript"
                    ? "JavaScript"
                    : tab === "python"
                      ? "Python"
                      : tab === "php"
                        ? "PHP"
                        : "cURL"}
                </button>
              ))}
            </div>

            <CodeBlock>{exemplos[tabAtiva]}</CodeBlock>
          </div>
        </div>
      </section>

      {/* Testar */}
      <section id="testar" className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-600/[0.08] to-transparent p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Testar agora
            </h2>
            <p className="mt-3 text-white/40 text-lg mb-10">
              Digite um CEP e veja o resultado em tempo real.
            </p>
            <CepTester />
          </div>
        </div>
      </section>

      {/* Exemplos interativos */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Exemplos interativos
            </h2>
            <p className="mt-3 text-white/40 text-lg">
              Auto preenchimento de endereço via CEP com código fonte completo.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                href: "/exemplo/javascript",
                titulo: "JavaScript",
                descricao: "Fetch API puro, sem dependências.",
              },
              {
                href: "/exemplo/jquery",
                titulo: "jQuery",
                descricao: "Usando $.getJSON para consulta rápida.",
              },
              {
                href: "/exemplo/react",
                titulo: "React",
                descricao: "Componente com hooks (useState + fetch).",
              },
            ].map((ex) => (
              <Link
                key={ex.href}
                href={ex.href}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all"
              >
                <h3 className="font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">
                  {ex.titulo}
                </h3>
                <p className="text-sm text-white/40">
                  {ex.descricao}
                </p>
                <span className="inline-block mt-4 text-xs font-medium text-violet-400/70 group-hover:text-violet-400 transition-colors">
                  Ver exemplo →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre a base */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Sobre a base de dados
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                titulo: "Base oficial dos Correios",
                descricao:
                  "Utilizamos o eDNE (e-Diretório Nacional de Endereços), a base oficial dos Correios com todos os CEPs do Brasil.",
              },
              {
                titulo: "Atualização periódica",
                descricao:
                  "A base é atualizada periodicamente conforme novas versões disponibilizadas pelos Correios, garantindo dados sempre atualizados.",
              },
              {
                titulo: "Cobertura nacional",
                descricao:
                  "Mais de 1,5 milhão de logradouros, 83 mil bairros e 11 mil localidades em todos os 27 estados brasileiros.",
              },
            ].map((item) => (
              <div
                key={item.titulo}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
              >
                <h3 className="font-semibold text-white mb-2">
                  {item.titulo}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {item.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center space-y-2">
            <p className="text-xs text-white/25 leading-relaxed">
              Inspirado no{" "}
              <a
                href="https://viacep.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400/60 hover:text-violet-400 transition-colors underline underline-offset-2"
              >
                ViaCEP
              </a>
              {" "}— o pioneiro em API gratuita de consulta de CEP no Brasil.
            </p>
            <p className="text-xs text-white/20">
              <Link href="/privacidade" className="hover:text-white/40 transition-colors underline underline-offset-2">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
