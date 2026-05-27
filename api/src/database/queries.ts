import { getDb } from './schema';
import type Database from 'better-sqlite3';

let db: Database.Database;

function getDatabase(): Database.Database {
  if (!db) {
    db = getDb();
  }
  return db;
}

interface CepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

function formatarCep(cep: string): string {
  return cep.replace(/\D/g, '').padStart(8, '0');
}

export function buscarPorCep(cepInput: string): CepResult | null {
  const cep = formatarCep(cepInput);
  const database = getDatabase();

  // Buscar em logradouros
  const logradouro = database.prepare(`
    SELECT
      l.cep,
      CASE WHEN l.log_sta_tlo = 'S' AND l.tlo_tx IS NOT NULL
        THEN l.tlo_tx || ' ' || l.log_no
        ELSE l.log_no
      END as logradouro,
      COALESCE(l.log_complemento, '') as complemento,
      COALESCE(b.bai_no, '') as bairro,
      loc.loc_no as localidade,
      l.ufe_sg as uf,
      COALESCE(loc.mun_nu, '') as ibge
    FROM logradouros l
    LEFT JOIN bairros b ON b.bai_nu = l.bai_nu_ini
    LEFT JOIN localidades loc ON loc.loc_nu = l.loc_nu
    WHERE l.cep = ?
  `).get(cep) as any;

  if (logradouro) {
    return {
      cep: formatarCepExibicao(cep),
      logradouro: logradouro.logradouro || '',
      complemento: logradouro.complemento || '',
      unidade: '',
      bairro: logradouro.bairro || '',
      localidade: logradouro.localidade || '',
      uf: logradouro.uf || '',
      ibge: logradouro.ibge || '',
      gia: '',
      ddd: '',
      siafi: '',
    };
  }

  // Buscar em grandes usuários
  const gu = database.prepare(`
    SELECT
      g.cep,
      g.gru_no as logradouro,
      COALESCE(g.gru_endereco, '') as complemento,
      COALESCE(b.bai_no, '') as bairro,
      loc.loc_no as localidade,
      g.ufe_sg as uf,
      COALESCE(loc.mun_nu, '') as ibge
    FROM grandes_usuarios g
    LEFT JOIN bairros b ON b.bai_nu = g.bai_nu
    LEFT JOIN localidades loc ON loc.loc_nu = g.loc_nu
    WHERE g.cep = ?
  `).get(cep) as any;

  if (gu) {
    return {
      cep: formatarCepExibicao(cep),
      logradouro: gu.logradouro || '',
      complemento: gu.complemento || '',
      unidade: '',
      bairro: gu.bairro || '',
      localidade: gu.localidade || '',
      uf: gu.uf || '',
      ibge: gu.ibge || '',
      gia: '',
      ddd: '',
      siafi: '',
    };
  }

  // Buscar em unidades operacionais
  const uop = database.prepare(`
    SELECT
      u.cep,
      u.uop_no as logradouro,
      COALESCE(u.uop_endereco, '') as complemento,
      COALESCE(b.bai_no, '') as bairro,
      loc.loc_no as localidade,
      u.ufe_sg as uf,
      COALESCE(loc.mun_nu, '') as ibge
    FROM unidades_operacionais u
    LEFT JOIN bairros b ON b.bai_nu = u.bai_nu
    LEFT JOIN localidades loc ON loc.loc_nu = u.loc_nu
    WHERE u.cep = ?
  `).get(cep) as any;

  if (uop) {
    return {
      cep: formatarCepExibicao(cep),
      logradouro: uop.logradouro || '',
      complemento: uop.complemento || '',
      unidade: '',
      bairro: uop.bairro || '',
      localidade: uop.localidade || '',
      uf: uop.uf || '',
      ibge: uop.ibge || '',
      gia: '',
      ddd: '',
      siafi: '',
    };
  }

  // Buscar por faixa de CEP (localidades com CEP único)
  const localidade = database.prepare(`
    SELECT
      loc.cep,
      loc.loc_no as localidade,
      loc.ufe_sg as uf,
      COALESCE(loc.mun_nu, '') as ibge
    FROM localidades loc
    WHERE loc.cep = ?
  `).get(cep) as any;

  if (localidade) {
    return {
      cep: formatarCepExibicao(cep),
      logradouro: '',
      complemento: '',
      unidade: '',
      bairro: '',
      localidade: localidade.localidade || '',
      uf: localidade.uf || '',
      ibge: localidade.ibge || '',
      gia: '',
      ddd: '',
      siafi: '',
    };
  }

  // Buscar por faixa de localidade (cidades pequenas com CEP geral)
  const faixaLoc = database.prepare(`
    SELECT
      loc.loc_no as localidade,
      loc.ufe_sg as uf,
      COALESCE(loc.mun_nu, '') as ibge,
      loc.cep
    FROM faixa_localidade fl
    JOIN localidades loc ON loc.loc_nu = fl.loc_nu
    WHERE CAST(? AS INTEGER) BETWEEN CAST(fl.cep_ini AS INTEGER) AND CAST(fl.cep_fim AS INTEGER)
    LIMIT 1
  `).get(cep) as any;

  if (faixaLoc) {
    return {
      cep: formatarCepExibicao(cep),
      logradouro: '',
      complemento: '',
      unidade: '',
      bairro: '',
      localidade: faixaLoc.localidade || '',
      uf: faixaLoc.uf || '',
      ibge: faixaLoc.ibge || '',
      gia: '',
      ddd: '',
      siafi: '',
    };
  }

  return null;
}

export function buscarPorEndereco(uf: string, cidade: string, logradouro: string): CepResult[] {
  const database = getDatabase();

  const ufUpper = uf.toUpperCase();
  const cidadeLike = `%${cidade}%`;
  const logradouroLike = `%${logradouro}%`;

  const resultados = database.prepare(`
    SELECT
      l.cep,
      CASE WHEN l.log_sta_tlo = 'S' AND l.tlo_tx IS NOT NULL
        THEN l.tlo_tx || ' ' || l.log_no
        ELSE l.log_no
      END as logradouro,
      COALESCE(l.log_complemento, '') as complemento,
      COALESCE(b.bai_no, '') as bairro,
      loc.loc_no as localidade,
      l.ufe_sg as uf,
      COALESCE(loc.mun_nu, '') as ibge
    FROM logradouros l
    LEFT JOIN bairros b ON b.bai_nu = l.bai_nu_ini
    LEFT JOIN localidades loc ON loc.loc_nu = l.loc_nu
    WHERE l.ufe_sg = ?
      AND loc.loc_no LIKE ?
      AND l.log_no LIKE ?
    ORDER BY l.log_no, l.cep
    LIMIT 50
  `).all(ufUpper, cidadeLike, logradouroLike) as any[];

  return resultados.map(r => ({
    cep: formatarCepExibicao(r.cep),
    logradouro: r.logradouro || '',
    complemento: r.complemento || '',
    unidade: '',
    bairro: r.bairro || '',
    localidade: r.localidade || '',
    uf: r.uf || '',
    ibge: r.ibge || '',
    gia: '',
    ddd: '',
    siafi: '',
  }));
}

export function obterStatus(): Record<string, string> {
  const database = getDatabase();

  const metas = database.prepare('SELECT chave, valor FROM meta').all() as { chave: string; valor: string }[];

  const status: Record<string, string> = {};
  for (const meta of metas) {
    status[meta.chave] = meta.valor;
  }

  return status;
}

function formatarCepExibicao(cep: string): string {
  const limpo = cep.replace(/\D/g, '').padStart(8, '0');
  return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
}
