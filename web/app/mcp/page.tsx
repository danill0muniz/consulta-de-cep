"use client";

import { useState } from "react";
import Link from "next/link";

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
          compact ? "text-xs p-4" : "text-sm p-6"
        }`}
      >
        <code>{children}</code>
      </pre>
      <button
        onClick={copiar}
        className="absolute top-3 right-3 text-xs text-white/30 hover:text-white/70 bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1 rounded-lg transition-all cursor-pointer"
      >
        {copiado ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}

export default function McpPage() {
  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
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
            <Link href="/#documentacao" className="hover:text-white transition-colors">
              Documentação
            </Link>
            <Link href="/#exemplos" className="hover:text-white transition-colors">
              Exemplos
            </Link>
            <Link href="/mcp" className="text-violet-400 hover:text-violet-300 transition-colors">
              MCP
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6">
            <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
            Model Context Protocol
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            MCP Server para{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
              Consulta de CEP
            </span>
          </h1>
          <p className="mt-4 text-lg text-white/50 max-w-2xl leading-relaxed">
            Integre a consulta de CEP diretamente nas suas ferramentas de IA.
            Claude, ChatGPT, Cursor, Windsurf, VS Code e qualquer cliente MCP compatível.
          </p>
        </div>

        {/* O que é MCP */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">O que é MCP?</h2>
          <div className="text-sm text-white/50 space-y-3 leading-relaxed">
            <p>
              O <strong className="text-white/70">Model Context Protocol (MCP)</strong> é um padrão aberto que permite
              que assistentes de IA acessem ferramentas externas de forma padronizada. Com o MCP Server do Consulta de CEP,
              qualquer IA compatível pode buscar CEPs e endereços brasileiros diretamente durante uma conversa.
            </p>
            <p>
              Em vez de você copiar e colar CEPs manualmente, basta pedir:{" "}
              <em className="text-violet-300">&quot;Busca o CEP da Praça da Sé em São Paulo&quot;</em> — e a IA
              faz a consulta automaticamente.
            </p>
          </div>
        </section>

        {/* Tools disponíveis */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Tools disponíveis</h2>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                  TOOL
                </span>
                <code className="text-sm font-mono text-white/80">buscar_cep</code>
              </div>
              <p className="text-sm text-white/50 mb-3">
                Consulta um CEP e retorna o endereço completo (logradouro, bairro, cidade, UF, IBGE).
              </p>
              <div className="text-xs text-white/30">
                <strong className="text-white/50">Parâmetro:</strong>{" "}
                <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">cep</code> — 8 dígitos (ex: 01001000)
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                  TOOL
                </span>
                <code className="text-sm font-mono text-white/80">buscar_endereco</code>
              </div>
              <p className="text-sm text-white/50 mb-3">
                Pesquisa CEPs por endereço. Retorna até 50 resultados.
              </p>
              <div className="text-xs text-white/30 space-y-1">
                <div>
                  <strong className="text-white/50">Parâmetros:</strong>{" "}
                  <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">uf</code> — sigla do estado (ex: SP),{" "}
                  <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">cidade</code> — nome da cidade,{" "}
                  <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">logradouro</code> — nome da rua
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instalação */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Instalação</h2>

          {/* Claude.ai (chat) */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Claude.ai (chat web)</h3>
            <p className="text-sm text-white/50 mb-4">
              No Claude.ai, vá em <strong className="text-white/70">Settings → Integrations → Add More</strong> e adicione a URL:
            </p>
            <CodeBlock compact>{`https://consultadecep.com/api/mcp`}</CodeBlock>
            <p className="text-xs text-white/30 mt-2">
              Funciona direto no navegador — sem instalar nada. Basta adicionar e começar a usar.
            </p>
          </div>

          {/* Claude Code / Claude Desktop */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              Claude Code / Claude Desktop
            </h3>
            <p className="text-sm text-white/50 mb-4">
              Adicione ao seu arquivo de configuração MCP (<code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">~/.claude/settings.json</code> ou <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">claude_desktop_config.json</code>):
            </p>
            <CodeBlock compact>{`{
  "mcpServers": {
    "consultadecep": {
      "command": "npx",
      "args": ["-y", "@consultadecep/mcp-server"]
    }
  }
}`}</CodeBlock>
          </div>

          {/* Cursor */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Cursor</h3>
            <p className="text-sm text-white/50 mb-4">
              Adicione ao arquivo <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">.cursor/mcp.json</code> do seu projeto:
            </p>
            <CodeBlock compact>{`{
  "mcpServers": {
    "consultadecep": {
      "command": "npx",
      "args": ["-y", "@consultadecep/mcp-server"]
    }
  }
}`}</CodeBlock>
          </div>

          {/* VS Code */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">VS Code (Copilot)</h3>
            <p className="text-sm text-white/50 mb-4">
              Adicione ao <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">.vscode/mcp.json</code>:
            </p>
            <CodeBlock compact>{`{
  "servers": {
    "consultadecep": {
      "command": "npx",
      "args": ["-y", "@consultadecep/mcp-server"]
    }
  }
}`}</CodeBlock>
          </div>

          {/* Windsurf */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Windsurf</h3>
            <p className="text-sm text-white/50 mb-4">
              Adicione ao <code className="bg-white/[0.06] text-violet-300 px-1.5 py-0.5 rounded">~/.codeium/windsurf/mcp_config.json</code>:
            </p>
            <CodeBlock compact>{`{
  "mcpServers": {
    "consultadecep": {
      "command": "npx",
      "args": ["-y", "@consultadecep/mcp-server"]
    }
  }
}`}</CodeBlock>
          </div>

          {/* ChatGPT */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ChatGPT</h3>
            <p className="text-sm text-white/50 mb-4">
              Use nosso GPT pronto na loja do ChatGPT — basta clicar e começar a consultar:
            </p>
            <a
              href="https://chatgpt.com/g/g-6a16dd603bd0819196e0ce6773ef625a-consulta-de-cep"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#10a37f]/10 border border-[#10a37f]/20 hover:bg-[#10a37f]/20 transition-all group"
            >
              <svg className="size-8 text-[#10a37f]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
              </svg>
              <div>
                <span className="text-sm font-semibold text-[#10a37f] group-hover:text-[#0d8c6d] transition-colors">
                  Usar no ChatGPT
                </span>
                <span className="block text-xs text-white/30 mt-0.5">
                  Abrir GPT &quot;Consulta de CEP&quot; na loja
                </span>
              </div>
              <svg className="size-4 text-white/20 group-hover:text-white/40 transition-colors ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>

            <details className="mt-6">
              <summary className="text-sm text-white/40 cursor-pointer hover:text-white/60 transition-colors">
                Ou crie seu próprio GPT personalizado
              </summary>
              <div className="mt-4 space-y-4">
                <ol className="text-sm text-white/50 space-y-3 list-decimal list-inside leading-relaxed">
                  <li>
                    Acesse{" "}
                    <a href="https://chatgpt.com/gpts/editor" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
                      chatgpt.com/gpts/editor
                    </a>
                  </li>
                  <li>Na aba <strong className="text-white/70">Configure</strong>, dê um nome e uma descrição</li>
                  <li>Em <strong className="text-white/70">Actions</strong> → <strong className="text-white/70">Create new action</strong> → <strong className="text-white/70">Import from URL</strong>:</li>
                </ol>
                <CodeBlock compact>{`https://consultadecep.com/api/openapi`}</CodeBlock>
                <p className="text-xs text-white/30">Clique em Save e pronto — seu GPT já consulta CEPs.</p>
              </div>
            </details>
          </div>
        </section>

        {/* Exemplos de uso */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Exemplos de uso com IA</h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <p className="text-sm text-white/70 mb-3 font-medium">Buscar um CEP:</p>
              <div className="bg-white/[0.04] rounded-lg px-4 py-3 text-sm font-mono text-violet-300 border border-white/[0.06]">
                &quot;Qual o endereço do CEP 01001-000?&quot;
              </div>
              <div className="mt-3 text-xs text-white/30">
                A IA chamará <code className="text-violet-300/70">buscar_cep</code> com o CEP informado e retornará o endereço completo.
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <p className="text-sm text-white/70 mb-3 font-medium">Pesquisar por endereço:</p>
              <div className="bg-white/[0.04] rounded-lg px-4 py-3 text-sm font-mono text-violet-300 border border-white/[0.06]">
                &quot;Busca o CEP da Avenida Paulista em São Paulo&quot;
              </div>
              <div className="mt-3 text-xs text-white/30">
                A IA chamará <code className="text-violet-300/70">buscar_endereco</code> com UF=SP, cidade=São Paulo e logradouro=Paulista.
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <p className="text-sm text-white/70 mb-3 font-medium">Uso em desenvolvimento:</p>
              <div className="bg-white/[0.04] rounded-lg px-4 py-3 text-sm font-mono text-violet-300 border border-white/[0.06]">
                &quot;Preciso do CEP do escritório na Rua Nove de Julho em Ribeirão Preto para configurar no .env&quot;
              </div>
              <div className="mt-3 text-xs text-white/30">
                A IA busca o endereço e já pode sugerir a configuração com o CEP correto.
              </div>
            </div>
          </div>
        </section>

        {/* Código fonte */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Código fonte</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            O MCP Server é open source e está disponível no{" "}
            <a
              href="https://github.com/danill0muniz/consulta-de-cep/tree/main/mcp-server"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
            >
              GitHub
            </a>
            . Contribuições são bem-vindas.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 mt-auto">
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
        </div>
      </footer>
    </div>
  );
}
