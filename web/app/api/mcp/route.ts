import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';

const API_BASE = 'https://consultadecep.com';

function createServer() {
  const server = new McpServer({
    name: 'consultadecep',
    version: '1.0.0',
  });

  server.registerTool(
    'buscar_cep',
    {
      title: 'Buscar CEP',
      description: 'Consulta um CEP brasileiro e retorna endereço completo (logradouro, bairro, cidade, UF, IBGE). Base oficial dos Correios.',
      inputSchema: {
        cep: z.string().describe('CEP com 8 dígitos (ex: 01001000 ou 01001-000)'),
      },
    },
    async ({ cep }) => {
      const cepLimpo = cep.replace(/\D/g, '');

      if (cepLimpo.length !== 8) {
        return {
          content: [{ type: 'text' as const, text: 'CEP inválido. Informe 8 dígitos numéricos.' }],
          isError: true,
        };
      }

      const res = await fetch(`${API_BASE}/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        return {
          content: [{ type: 'text' as const, text: `CEP ${cepLimpo} não encontrado na base dos Correios.` }],
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  server.registerTool(
    'buscar_endereco',
    {
      title: 'Buscar endereço',
      description: 'Pesquisa CEPs por endereço (UF + cidade + logradouro). Retorna até 50 resultados. Base oficial dos Correios.',
      inputSchema: {
        uf: z.string().describe('Sigla do estado com 2 letras (ex: SP, RJ, MG)'),
        cidade: z.string().describe('Nome da cidade (mínimo 3 caracteres)'),
        logradouro: z.string().describe('Nome da rua/avenida (mínimo 3 caracteres)'),
      },
    },
    async ({ uf, cidade, logradouro }) => {
      if (cidade.length < 3 || logradouro.length < 3) {
        return {
          content: [{ type: 'text' as const, text: 'Cidade e logradouro devem ter pelo menos 3 caracteres.' }],
          isError: true,
        };
      }

      const url = `${API_BASE}/ws/${encodeURIComponent(uf)}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`;
      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data) && data.length === 0) {
        return {
          content: [{ type: 'text' as const, text: `Nenhum endereço encontrado para "${logradouro}" em ${cidade}/${uf}.` }],
        };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  return server;
}

async function handleMcpRequest(req: Request): Promise<Response> {
  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);
  const response = await transport.handleRequest(req);

  return response;
}

export async function POST(req: Request) {
  return handleMcpRequest(req);
}

export async function GET(req: Request) {
  return handleMcpRequest(req);
}

export async function DELETE(req: Request) {
  return handleMcpRequest(req);
}
