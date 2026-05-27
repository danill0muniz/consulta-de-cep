import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Server e Integrações com IA - Consulta de CEP",
  description:
    "Integre a consulta de CEP nas suas ferramentas de IA. MCP Server para Claude, Cursor e VS Code. GPT personalizado para ChatGPT. Tudo gratuito.",
  alternates: {
    canonical: "/mcp",
  },
  openGraph: {
    title: "MCP Server - Consulta de CEP para IAs",
    description: "Integre a consulta de CEP diretamente no Claude, ChatGPT, Cursor e outras IAs.",
  },
};

export default function McpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
