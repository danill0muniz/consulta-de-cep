import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Cache-Control': 'public, max-age=3600',
};

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

  // Debug temporário
  if (segmentos[0] === '_debug') {
    return NextResponse.json({ segmentos, url: request.url }, { headers });
  }

  const ultimo = segmentos[segmentos.length - 1];
  const isJson = ultimo === 'json' || ultimo === 'json/';

  // /ws/{cep}/json → segmentos = [cep, "json"]
  // /ws/{uf}/{cidade}/{logradouro}/json → segmentos = [uf, cidade, logradouro, "json"]
  if (segmentos.length === 2 && isJson) {
    return buscarPorCep(segmentos[0]);
  }

  if (segmentos.length === 4 && isJson) {
    return buscarPorEndereco(segmentos[0], segmentos[1], segmentos[2]);
  }

  return NextResponse.json(
    { erro: true, mensagem: 'Rota inválida.', debug_segmentos: segmentos },
    { status: 400, headers }
  );
}

async function buscarPorCep(cepParam: string) {
  const cep = cepParam.replace(/\D/g, '').padStart(8, '0');

  if (cep.length !== 8) {
    return NextResponse.json(
      { erro: true, mensagem: 'CEP inválido. Informe 8 dígitos.' },
      { status: 400, headers }
    );
  }

  // Buscar em logradouros
  const { data: logradouro, error: errLog } = await supabase
    .from('logradouros')
    .select('cep, log_no, log_complemento, tlo_tx, log_sta_tlo, ufe_sg, loc_nu, bai_nu_ini')
    .eq('cep', cep)
    .limit(1)
    .single();

  if (errLog && errLog.code !== 'PGRST116') {
    return NextResponse.json({ erro: true, debug_error: errLog.message, debug_cep: cep }, { headers });
  }

  if (logradouro) {
    const [bairro, localidade] = await Promise.all([
      supabase.from('bairros').select('bai_no').eq('bai_nu', logradouro.bai_nu_ini).limit(1).single(),
      supabase.from('localidades').select('loc_no, mun_nu').eq('loc_nu', logradouro.loc_nu).limit(1).single(),
    ]);

    const nome = logradouro.log_sta_tlo === 'S' && logradouro.tlo_tx
      ? `${logradouro.tlo_tx} ${logradouro.log_no}`
      : logradouro.log_no;

    return NextResponse.json({
      cep: formatarCep(cep),
      logradouro: nome || '',
      complemento: logradouro.log_complemento || '',
      unidade: '',
      bairro: bairro.data?.bai_no || '',
      localidade: localidade.data?.loc_no || '',
      uf: logradouro.ufe_sg || '',
      ibge: localidade.data?.mun_nu || '',
      gia: '', ddd: '', siafi: '',
    }, { headers });
  }

  // Buscar em grandes usuários
  const { data: gu } = await supabase
    .from('grandes_usuarios')
    .select('cep, gru_no, gru_endereco, ufe_sg, loc_nu, bai_nu')
    .eq('cep', cep)
    .limit(1)
    .single();

  if (gu) {
    const [bairro, localidade] = await Promise.all([
      supabase.from('bairros').select('bai_no').eq('bai_nu', gu.bai_nu).limit(1).single(),
      supabase.from('localidades').select('loc_no, mun_nu').eq('loc_nu', gu.loc_nu).limit(1).single(),
    ]);

    return NextResponse.json({
      cep: formatarCep(cep),
      logradouro: gu.gru_no || '',
      complemento: gu.gru_endereco || '',
      unidade: '',
      bairro: bairro.data?.bai_no || '',
      localidade: localidade.data?.loc_no || '',
      uf: gu.ufe_sg || '',
      ibge: localidade.data?.mun_nu || '',
      gia: '', ddd: '', siafi: '',
    }, { headers });
  }

  // Buscar em unidades operacionais
  const { data: uop } = await supabase
    .from('unidades_operacionais')
    .select('cep, uop_no, uop_endereco, ufe_sg, loc_nu, bai_nu')
    .eq('cep', cep)
    .limit(1)
    .single();

  if (uop) {
    const [bairro, localidade] = await Promise.all([
      supabase.from('bairros').select('bai_no').eq('bai_nu', uop.bai_nu).limit(1).single(),
      supabase.from('localidades').select('loc_no, mun_nu').eq('loc_nu', uop.loc_nu).limit(1).single(),
    ]);

    return NextResponse.json({
      cep: formatarCep(cep),
      logradouro: uop.uop_no || '',
      complemento: uop.uop_endereco || '',
      unidade: '',
      bairro: bairro.data?.bai_no || '',
      localidade: localidade.data?.loc_no || '',
      uf: uop.ufe_sg || '',
      ibge: localidade.data?.mun_nu || '',
      gia: '', ddd: '', siafi: '',
    }, { headers });
  }

  // Buscar localidade com CEP direto
  const { data: loc } = await supabase
    .from('localidades')
    .select('loc_no, ufe_sg, mun_nu')
    .eq('cep', cep)
    .limit(1)
    .single();

  if (loc) {
    return NextResponse.json({
      cep: formatarCep(cep),
      logradouro: '', complemento: '', unidade: '', bairro: '',
      localidade: loc.loc_no || '',
      uf: loc.ufe_sg || '',
      ibge: loc.mun_nu || '',
      gia: '', ddd: '', siafi: '',
    }, { headers });
  }

  // Buscar por faixa de localidade
  const { data: faixa } = await supabase
    .from('faixa_localidade')
    .select('loc_nu')
    .lte('cep_ini', cep)
    .gte('cep_fim', cep)
    .limit(1)
    .single();

  if (faixa) {
    const { data: locFaixa } = await supabase
      .from('localidades')
      .select('loc_no, ufe_sg, mun_nu')
      .eq('loc_nu', faixa.loc_nu)
      .limit(1)
      .single();

    if (locFaixa) {
      return NextResponse.json({
        cep: formatarCep(cep),
        logradouro: '', complemento: '', unidade: '', bairro: '',
        localidade: locFaixa.loc_no || '',
        uf: locFaixa.ufe_sg || '',
        ibge: locFaixa.mun_nu || '',
        gia: '', ddd: '', siafi: '',
      }, { headers });
    }
  }

  return NextResponse.json({ erro: true }, { headers });
}

async function buscarPorEndereco(uf: string, cidade: string, logradouro: string) {
  const ufUpper = uf.toUpperCase();
  const cidadeDecoded = decodeURIComponent(cidade);
  const logradouroDecoded = decodeURIComponent(logradouro);

  if (!UFS_VALIDAS.includes(ufUpper)) {
    return NextResponse.json({ erro: true, mensagem: 'UF inválida.' }, { status: 400, headers });
  }
  if (cidadeDecoded.length < 3) {
    return NextResponse.json({ erro: true, mensagem: 'Cidade deve ter pelo menos 3 caracteres.' }, { status: 400, headers });
  }
  if (logradouroDecoded.length < 3) {
    return NextResponse.json({ erro: true, mensagem: 'Logradouro deve ter pelo menos 3 caracteres.' }, { status: 400, headers });
  }

  const { data: localidades } = await supabase
    .from('localidades')
    .select('loc_nu, loc_no, mun_nu')
    .eq('ufe_sg', ufUpper)
    .ilike('loc_no', `%${cidadeDecoded}%`);

  if (!localidades || localidades.length === 0) {
    return NextResponse.json([], { headers });
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
    return NextResponse.json([], { headers });
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

  return NextResponse.json(resultados, { headers });
}

function formatarCep(cep: string): string {
  const limpo = cep.replace(/\D/g, '').padStart(8, '0');
  return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
}
