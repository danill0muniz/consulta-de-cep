import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data: metas } = await supabase
    .from('meta')
    .select('chave, valor');

  const status: Record<string, string> = {};
  for (const meta of metas || []) {
    status[meta.chave] = meta.valor;
  }

  const { count: totalLogradouros, error: errLog } = await supabase
    .from('logradouros')
    .select('*', { count: 'exact', head: true });

  const { count: totalLocalidades, error: errLoc } = await supabase
    .from('localidades')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    servico: 'Consulta de CEP',
    dominio: 'consultadecep.com',
    base: 'Correios - eDNE',
    versao_edne: status.versao_edne || '',
    data_base: status.data_base || '',
    data_importacao: status.data_importacao || '',
    total_logradouros: totalLogradouros || 0,
    total_localidades: totalLocalidades || 0,
    debug_env: {
      has_url: !!process.env.SUPABASE_URL,
      has_key: !!process.env.SUPABASE_SERVICE_KEY,
      url_preview: process.env.SUPABASE_URL?.slice(0, 20) || 'MISSING',
    },
    debug_errors: {
      logradouros: errLog?.message || null,
      localidades: errLoc?.message || null,
    },
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
