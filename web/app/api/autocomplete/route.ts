import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tipo = params.get('tipo');
  const uf = params.get('uf')?.toUpperCase();
  const q = params.get('q')?.trim();

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
  };

  if (!tipo || !q || q.length < 2) {
    return new Response('[]', { headers });
  }

  if (tipo === 'cidade' && uf) {
    const { data } = await supabase
      .from('localidades')
      .select('loc_no')
      .eq('ufe_sg', uf)
      .ilike('loc_no', `${q}%`)
      .order('loc_no')
      .limit(10);

    const cidades = (data || []).map((l) => l.loc_no);
    return new Response(JSON.stringify(cidades), { headers });
  }

  if (tipo === 'rua' && uf) {
    const cidade = params.get('cidade')?.trim();
    if (!cidade) return new Response('[]', { headers });

    const { data: locs } = await supabase
      .from('localidades')
      .select('loc_nu')
      .eq('ufe_sg', uf)
      .ilike('loc_no', `${cidade}%`)
      .limit(5);

    if (!locs || locs.length === 0) return new Response('[]', { headers });

    const logQ = q.replace(/^(rua|avenida|av\.?|alameda|al\.?|travessa|tv\.?|praça|rodovia|rod\.?|estrada|est\.?|largo|viela|beco|via)\s+/i, '');

    const { data } = await supabase
      .from('logradouros')
      .select('log_no, tlo_tx, log_sta_tlo')
      .eq('ufe_sg', uf)
      .in('loc_nu', locs.map((l) => l.loc_nu))
      .ilike('log_no', `${logQ}%`)
      .order('log_no')
      .limit(10);

    const ruas = (data || []).map((l) => {
      const nome = l.log_sta_tlo === 'S' && l.tlo_tx ? `${l.tlo_tx} ${l.log_no}` : l.log_no;
      return nome;
    });

    // Remover duplicatas
    return new Response(JSON.stringify([...new Set(ruas)]), { headers });
  }

  return new Response('[]', { headers });
}
