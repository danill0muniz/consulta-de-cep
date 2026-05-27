import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

const CACHE_CEP = 'public, s-maxage=2592000, stale-while-revalidate=15552000';
const CACHE_ENDERECO = 'public, s-maxage=2592000, stale-while-revalidate=15552000';

function json(data: unknown, cache: string, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': cache,
      'CDN-Cache-Control': cache,
      'Vercel-CDN-Cache-Control': cache,
    },
  });
}

const UFS_VALIDAS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
  'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
  'RO','RR','RS','SC','SE','SP','TO'
];

const UF_INFO: Record<string, { estado: string; regiao: string; ddd: string }> = {
  AC: { estado: 'Acre', regiao: 'Norte', ddd: '68' },
  AL: { estado: 'Alagoas', regiao: 'Nordeste', ddd: '82' },
  AM: { estado: 'Amazonas', regiao: 'Norte', ddd: '92' },
  AP: { estado: 'Amapá', regiao: 'Norte', ddd: '96' },
  BA: { estado: 'Bahia', regiao: 'Nordeste', ddd: '71' },
  CE: { estado: 'Ceará', regiao: 'Nordeste', ddd: '85' },
  DF: { estado: 'Distrito Federal', regiao: 'Centro-Oeste', ddd: '61' },
  ES: { estado: 'Espírito Santo', regiao: 'Sudeste', ddd: '27' },
  GO: { estado: 'Goiás', regiao: 'Centro-Oeste', ddd: '62' },
  MA: { estado: 'Maranhão', regiao: 'Nordeste', ddd: '98' },
  MG: { estado: 'Minas Gerais', regiao: 'Sudeste', ddd: '31' },
  MS: { estado: 'Mato Grosso do Sul', regiao: 'Centro-Oeste', ddd: '67' },
  MT: { estado: 'Mato Grosso', regiao: 'Centro-Oeste', ddd: '65' },
  PA: { estado: 'Pará', regiao: 'Norte', ddd: '91' },
  PB: { estado: 'Paraíba', regiao: 'Nordeste', ddd: '83' },
  PE: { estado: 'Pernambuco', regiao: 'Nordeste', ddd: '81' },
  PI: { estado: 'Piauí', regiao: 'Nordeste', ddd: '86' },
  PR: { estado: 'Paraná', regiao: 'Sul', ddd: '41' },
  RJ: { estado: 'Rio de Janeiro', regiao: 'Sudeste', ddd: '21' },
  RN: { estado: 'Rio Grande do Norte', regiao: 'Nordeste', ddd: '84' },
  RO: { estado: 'Rondônia', regiao: 'Norte', ddd: '69' },
  RR: { estado: 'Roraima', regiao: 'Norte', ddd: '95' },
  RS: { estado: 'Rio Grande do Sul', regiao: 'Sul', ddd: '51' },
  SC: { estado: 'Santa Catarina', regiao: 'Sul', ddd: '48' },
  SE: { estado: 'Sergipe', regiao: 'Nordeste', ddd: '79' },
  SP: { estado: 'São Paulo', regiao: 'Sudeste', ddd: '11' },
  TO: { estado: 'Tocantins', regiao: 'Norte', ddd: '63' },
};

function enriquecer(dados: Record<string, string>) {
  const info = UF_INFO[dados.uf] || {};
  return {
    cep: dados.cep || '',
    logradouro: dados.logradouro || '',
    complemento: dados.complemento || '',
    unidade: dados.unidade || '',
    bairro: dados.bairro || '',
    localidade: dados.localidade || '',
    uf: dados.uf || '',
    estado: info.estado || '',
    regiao: info.regiao || '',
    ibge: dados.ibge || '',
    gia: dados.gia || '',
    ddd: dados.ddd || info.ddd || '',
    siafi: dados.siafi || '',
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  const { params: segmentos } = await params;

  const ultimo = segmentos[segmentos.length - 1];
  const isJson = ultimo === 'json' || ultimo === 'json/';

  if (segmentos.length === 2 && isJson) {
    return buscarPorCep(segmentos[0]);
  }

  if (segmentos.length === 4 && isJson) {
    return buscarPorEndereco(segmentos[0], segmentos[1], segmentos[2]);
  }

  return json({ erro: true, mensagem: 'Rota inválida.' }, 'no-store', 400);
}

async function buscarPorCep(cepParam: string) {
  const cep = cepParam.replace(/\D/g, '').padStart(8, '0');

  if (cep.length !== 8) {
    return json({ erro: true, mensagem: 'CEP inválido. Informe 8 dígitos.' }, CACHE_CEP, 400);
  }

  const { data, error } = await supabase.rpc('buscar_cep', { p_cep: cep });

  if (error || data?.erro) {
    return json({ erro: true }, CACHE_CEP);
  }

  return json(enriquecer({ ...data, cep: formatarCep(data.cep || cep) }), CACHE_CEP);
}

const PREFIXOS_LOGRADOURO = /^(rua|avenida|av\.?|alameda|al\.?|travessa|tv\.?|praça|pc\.?|pç\.?|rodovia|rod\.?|estrada|est\.?|largo|viela|beco|passagem|servidão|via)\s+/i;

async function buscarPorEndereco(uf: string, cidade: string, logradouro: string) {
  const ufUpper = uf.toUpperCase();
  const cidadeDecoded = decodeURIComponent(cidade);
  const logradouroDecoded = decodeURIComponent(logradouro).replace(PREFIXOS_LOGRADOURO, '');

  if (!UFS_VALIDAS.includes(ufUpper)) {
    return json({ erro: true, mensagem: 'UF inválida.' }, 'no-store', 400);
  }
  if (cidadeDecoded.length < 3) {
    return json({ erro: true, mensagem: 'Cidade deve ter pelo menos 3 caracteres.' }, 'no-store', 400);
  }
  if (logradouroDecoded.length < 3) {
    return json({ erro: true, mensagem: 'Logradouro deve ter pelo menos 3 caracteres.' }, 'no-store', 400);
  }

  const { data: localidades } = await supabase
    .from('localidades')
    .select('loc_nu, loc_no, mun_nu')
    .eq('ufe_sg', ufUpper)
    .ilike('loc_no', `%${cidadeDecoded}%`);

  if (!localidades || localidades.length === 0) {
    return json([], CACHE_ENDERECO);
  }

  const locNus = localidades.map(l => l.loc_nu);
  const locMap = new Map(localidades.map(l => [l.loc_nu, l]));

  const { data: logradouros } = await supabase
    .from('logradouros')
    .select('cep, log_no, log_complemento, tlo_tx, log_sta_tlo, ufe_sg, loc_nu, bai_nu_ini')
    .eq('ufe_sg', ufUpper)
    .in('loc_nu', locNus)
    .ilike('log_no', `%${logradouroDecoded}%`)
    .order('log_no')
    .limit(50);

  if (!logradouros || logradouros.length === 0) {
    return json([], CACHE_ENDERECO);
  }

  const baiNus = [...new Set(logradouros.map(l => l.bai_nu_ini).filter(Boolean))];
  const munNus = [...new Set(localidades.map(l => l.mun_nu).filter(Boolean))];

  const [{ data: bairros }, { data: extras }] = await Promise.all([
    supabase.from('bairros').select('bai_nu, bai_no').in('bai_nu', baiNus),
    supabase.from('municipios_extra').select('codigo_ibge, siafi_id, ddd').in('codigo_ibge', munNus),
  ]);

  const bairroMap = new Map((bairros || []).map(b => [b.bai_nu, b.bai_no]));
  const extraMap = new Map((extras || []).map(e => [e.codigo_ibge, e]));

  const resultados = logradouros.map(l => {
    const loc = locMap.get(l.loc_nu);
    const extra = extraMap.get(loc?.mun_nu) || { ddd: '', siafi_id: '' };
    const nome = l.log_sta_tlo === 'S' && l.tlo_tx
      ? `${l.tlo_tx} ${l.log_no}` : l.log_no;

    return enriquecer({
      cep: formatarCep(l.cep),
      logradouro: nome || '',
      complemento: l.log_complemento || '',
      unidade: '',
      bairro: bairroMap.get(l.bai_nu_ini) || '',
      localidade: loc?.loc_no || '',
      uf: l.ufe_sg || '',
      ibge: loc?.mun_nu || '',
      gia: '',
      ddd: extra.ddd || '',
      siafi: extra.siafi_id || '',
    });
  });

  return json(resultados, CACHE_ENDERECO);
}

function formatarCep(cep: string): string {
  const limpo = cep.replace(/\D/g, '').padStart(8, '0');
  return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
}
