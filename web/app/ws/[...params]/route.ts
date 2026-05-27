import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

const CACHE_CEP = 'public, s-maxage=2592000, stale-while-revalidate=15552000';
const CACHE_ENDERECO = 'public, s-maxage=2592000, stale-while-revalidate=15552000';

function json(data: unknown, cache: string, status = 200) {
  return new Response(JSON.stringify(data), {
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

  return json({ ...data, cep: formatarCep(data.cep || cep) }, CACHE_CEP);
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
  const { data: bairros } = await supabase
    .from('bairros')
    .select('bai_nu, bai_no')
    .in('bai_nu', baiNus);

  const bairroMap = new Map((bairros || []).map(b => [b.bai_nu, b.bai_no]));

  const resultados = logradouros.map(l => {
    const loc = locMap.get(l.loc_nu);
    const nome = l.log_sta_tlo === 'S' && l.tlo_tx
      ? `${l.tlo_tx} ${l.log_no}` : l.log_no;

    return {
      cep: formatarCep(l.cep),
      logradouro: nome || '',
      complemento: l.log_complemento || '',
      unidade: '',
      bairro: bairroMap.get(l.bai_nu_ini) || '',
      localidade: loc?.loc_no || '',
      uf: l.ufe_sg || '',
      ibge: loc?.mun_nu || '',
      gia: '', ddd: '', siafi: '',
    };
  });

  return json(resultados, CACHE_ENDERECO);
}

function formatarCep(cep: string): string {
  const limpo = cep.replace(/\D/g, '').padStart(8, '0');
  return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
}
