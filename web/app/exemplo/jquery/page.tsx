"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_DISPLAY = "https://consultadecep.com";

const CODIGO_FONTE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Consulta de CEP - jQuery</title>
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; }
    body { max-width: 500px; margin: 40px auto; padding: 0 20px; }
    label { display: block; margin-top: 12px; font-size: 14px; color: #555; }
    input { width: 100%; padding: 8px 12px; margin-top: 4px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    input:focus { outline: none; border-color: #7c3aed; }
    h1 { font-size: 20px; }
  </style>
</head>
<body>

<h1>Auto Preenchimento de Endereço via CEP</h1>
<p>Digite o CEP e ao sair do campo o endereço será preenchido automaticamente.</p>

<form>
  <label>CEP:
    <input type="text" id="cep" maxlength="9" placeholder="00000-000">
  </label>
  <label>Rua:
    <input type="text" id="rua" readonly>
  </label>
  <label>Bairro:
    <input type="text" id="bairro" readonly>
  </label>
  <label>Cidade:
    <input type="text" id="cidade" readonly>
  </label>
  <label>Estado:
    <input type="text" id="uf" readonly>
  </label>
  <label>IBGE:
    <input type="text" id="ibge" readonly>
  </label>
</form>

<script>
  $(document).ready(function () {
    function limparFormulario() {
      $("#rua").val("");
      $("#bairro").val("");
      $("#cidade").val("");
      $("#uf").val("");
      $("#ibge").val("");
    }

    $("#cep").blur(function () {
      var cep = $(this).val().replace(/\\D/g, "");

      if (cep.length !== 8) {
        limparFormulario();
        return;
      }

      // Preenche com "..." enquanto consulta
      $("#rua").val("...");
      $("#bairro").val("...");
      $("#cidade").val("...");
      $("#uf").val("...");
      $("#ibge").val("...");

      $.getJSON("${API_URL}/ws/" + cep + "/json/", function (dados) {
        if (!("erro" in dados)) {
          $("#rua").val(dados.logradouro);
          $("#bairro").val(dados.bairro);
          $("#cidade").val(dados.localidade);
          $("#uf").val(dados.uf);
          $("#ibge").val(dados.ibge);
        } else {
          limparFormulario();
          alert("CEP não encontrado.");
        }
      });
    });
  });
</script>

</body>
</html>`;

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

  async function buscar() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setRua("..."); setBairro("..."); setCidade("..."); setUf("..."); setIbge("...");

    try {
      const res = await fetch(`${API_URL}/ws/${cepLimpo}/json/`);
      const dados = await res.json();

      if (dados.erro) {
        setRua(""); setBairro(""); setCidade(""); setUf(""); setIbge("");
        return;
      }

      setRua(dados.logradouro);
      setBairro(dados.bairro);
      setCidade(dados.localidade);
      setUf(dados.uf);
      setIbge(dados.ibge);
    } catch {
      setRua(""); setBairro(""); setCidade(""); setUf(""); setIbge("");
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

export default function ExemploJquery() {
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
          <span className="text-sm text-white/50">Exemplo jQuery</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-wrap gap-2 mb-12">
          {[
            { href: "/exemplo/javascript", label: "JavaScript", ativo: false },
            { href: "/exemplo/jquery", label: "jQuery", ativo: true },
            { href: "/exemplo/react", label: "React", ativo: false },
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
          Exemplo com jQuery
        </h1>
        <p className="text-white/50 text-lg mb-10 max-w-2xl">
          Auto preenchimento de endereço via CEP usando jQuery e $.getJSON.
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
            Código fonte completo
          </h2>
          <CodeBlock>{CODIGO_FONTE}</CodeBlock>
        </div>
      </main>
    </div>
  );
}
