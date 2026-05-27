import { NextResponse } from 'next/server';

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'Consulta de CEP',
    description: 'API gratuita para consulta de CEP com base oficial dos Correios (eDNE). Sem cadastro, sem API key.',
    version: '1.0.0',
  },
  servers: [
    { url: 'https://consultadecep.com' },
  ],
  paths: {
    '/ws/{cep}/json/': {
      get: {
        operationId: 'buscarCep',
        summary: 'Buscar endereço por CEP',
        description: 'Consulta um CEP brasileiro e retorna o endereço completo (logradouro, bairro, cidade, UF, código IBGE).',
        parameters: [
          {
            name: 'cep',
            in: 'path',
            required: true,
            description: 'CEP com 8 dígitos numéricos (ex: 01001000)',
            schema: { type: 'string', pattern: '^\\d{8}$' },
          },
        ],
        responses: {
          '200': {
            description: 'Endereço encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    cep: { type: 'string', example: '01001-000' },
                    logradouro: { type: 'string', example: 'Praça da Sé' },
                    complemento: { type: 'string', example: '- lado ímpar' },
                    unidade: { type: 'string' },
                    bairro: { type: 'string', example: 'Sé' },
                    localidade: { type: 'string', example: 'São Paulo' },
                    uf: { type: 'string', example: 'SP' },
                    ibge: { type: 'string', example: '3550308' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/ws/{uf}/{cidade}/{logradouro}/json/': {
      get: {
        operationId: 'buscarEndereco',
        summary: 'Pesquisar CEPs por endereço',
        description: 'Pesquisa CEPs informando UF, cidade e logradouro. Retorna até 50 resultados. Cidade e logradouro devem ter no mínimo 3 caracteres.',
        parameters: [
          {
            name: 'uf',
            in: 'path',
            required: true,
            description: 'Sigla do estado com 2 letras (ex: SP, RJ, MG)',
            schema: { type: 'string', minLength: 2, maxLength: 2 },
          },
          {
            name: 'cidade',
            in: 'path',
            required: true,
            description: 'Nome da cidade (mínimo 3 caracteres)',
            schema: { type: 'string', minLength: 3 },
          },
          {
            name: 'logradouro',
            in: 'path',
            required: true,
            description: 'Nome da rua sem prefixo de tipo (ex: use "Diana" ao invés de "Rua Diana", "Paulista" ao invés de "Avenida Paulista"). Mínimo 3 caracteres.',
            schema: { type: 'string', minLength: 3 },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de endereços encontrados',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      cep: { type: 'string' },
                      logradouro: { type: 'string' },
                      complemento: { type: 'string' },
                      bairro: { type: 'string' },
                      localidade: { type: 'string' },
                      uf: { type: 'string' },
                      ibge: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
