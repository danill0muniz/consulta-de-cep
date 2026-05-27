"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_DISPLAY = "https://consultadecep.com";

const CODIGO_FONTE = `import { useState } from "react";

const API_URL = "${API_URL}";
const API_DISPLAY = "https://consultadecep.com";

function BuscaCep() {
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function buscar(valor) {
    const cepLimpo = valor.replace(/\\D/g, "");
    if (cepLimpo.length !== 8) return;

    setCarregando(true);
    setErro("");

    try {
      const response = await fetch(\`\${API_URL}/ws/\${cepLimpo}/json/\`);
      const dados = await response.json();

      if (dados.erro) {
        setEndereco(null);
        setErro("CEP não encontrado.");
      } else {
        setEndereco(dados);
        setErro("");
      }
    } catch {
      setErro("Erro ao consultar o CEP.");
      setEndereco(null);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Auto Preenchimento de Endereço via CEP</h1>
      <p>Digite o CEP e ao sair do campo o endereço será preenchido.</p>

      <div style={{ marginBottom: 16 }}>
        <label>CEP:</label>
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          onBlur={(e) => buscar(e.target.value)}
          maxLength={9}
          placeholder="00000-000"
          style={{ width: "100%", padding: "8px 12px", fontSize: 14 }}
        />
      </div>

      {carregando && <p>Buscando...</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {endereco && (
        <>
          <div style={{ marginBottom: 12 }}>
            <label>Rua:</label>
            <input value={endereco.logradouro} readOnly style={{ width: "100%", padding: "8px 12px" }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Bairro:</label>
            <input value={endereco.bairro} readOnly style={{ width: "100%", padding: "8px 12px" }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Cidade:</label>
            <input value={endereco.localidade} readOnly style={{ width: "100%", padding: "8px 12px" }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Estado:</label>
            <input value={endereco.uf} readOnly style={{ width: "100%", padding: "8px 12px" }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>IBGE:</label>
            <input value={endereco.ibge} readOnly style={{ width: "100%", padding: "8px 12px" }} />
          </div>
        </>
      )}
    </div>
  );
}

export default BuscaCep;`;

function CodeBlock({ children }: { children: string }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(children);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="relative group">
      <pre className="bg-white/[0.04] text-violet-300 rounded-xl overflow-x-auto font-mono text-xs leading-relaxed border border-white/[0.08] p-5">
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

function DemoForm() {
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [ibge, setIbge] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function buscar() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setCarregando(true);
    setRua("..."); setBairro("..."); setCidade("..."); setUf("..."); setIbge("...");

    try {
      const res = await fetch(`${API_URL}/ws/${cepLimpo}/json/`);
      const dados = await res.json();

      if (dados.erro) {
        setRua(""); setBairro(""); setCidade(""); setUf(""); setIbge("");
      } else {
        setRua(dados.logradouro);
        setBairro(dados.bairro);
        setCidade(dados.localidade);
        setUf(dados.uf);
        setIbge(dados.ibge);
      }
    } catch {
      setRua(""); setBairro(""); setCidade(""); setUf(""); setIbge("");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-4 max-w-md">
      <div>
        <label className="text-sm text-white/50 block mb-1">CEP:</label>
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          onBlur={buscar}
          maxLength={9}
          placeholder="00000-000"
          className="w-full h-10 px-3 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white placeholder:text-white/20 text-sm font-mono focus:outline-none focus:border-violet-500/50"
        />
      </div>
      {carregando && <p className="text-sm text-violet-400">Buscando...</p>}
      {[
        { label: "Rua", value: rua },
        { label: "Bairro", value: bairro },
        { label: "Cidade", value: cidade },
        { label: "Estado", value: uf },
        { label: "IBGE", value: ibge },
      ].map((campo) => (
        <div key={campo.label}>
          <label className="text-sm text-white/50 block mb-1">{campo.label}:</label>
          <input
            type="text"
            value={campo.value}
            readOnly
            className="w-full h-10 px-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white/70 text-sm"
          />
        </div>
      ))}
    </div>
  );
}

export default function ExemploReact() {
  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
      <header className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-lg bg-violet-600 flex items-center justify-center font-mono">
              <span className="text-white text-[11px] font-bold">&lt;/&gt;</span>
            </div>
            <span className="text-base font-semibold tracking-tight">
              Consulta de CEP
            </span>
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-sm text-white/50">Exemplo React</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-wrap gap-2 mb-12">
          {[
            { href: "/exemplo/javascript", label: "JavaScript", ativo: false },
            { href: "/exemplo/jquery", label: "jQuery", ativo: false },
            { href: "/exemplo/react", label: "React", ativo: true },
          ].map((ex) => (
            <Link
              key={ex.href}
              href={ex.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                ex.ativo
                  ? "bg-violet-600 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              {ex.label}
            </Link>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Exemplo com React
        </h1>
        <p className="text-white/50 text-lg mb-10 max-w-2xl">
          Componente React com auto preenchimento de endereço via CEP usando hooks (useState + fetch).
          Digite o CEP e ao sair do campo o endereço será preenchido.
        </p>

        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6 text-white/80">
            Teste ao vivo
          </h2>
          <DemoForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6 text-white/80">
            Código fonte do componente
          </h2>
          <CodeBlock>{CODIGO_FONTE}</CodeBlock>
        </div>
      </main>
    </div>
  );
}
