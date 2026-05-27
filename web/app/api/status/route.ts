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

  const { count: totalLogradouros } = await supabase
    .from('logradouros')
    .select('*', { count: 'exact', head: true });

  const { count: totalLocalidades } = await supabase
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
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
