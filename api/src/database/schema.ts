import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'cep.db');

export function createDatabase(): Database.Database {
  const db = new Database(DB_PATH);

  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -64000'); // 64MB cache
  db.pragma('foreign_keys = ON');

  return db;
}

export function createTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS localidades (
      loc_nu INTEGER PRIMARY KEY,
      ufe_sg TEXT NOT NULL,
      loc_no TEXT NOT NULL,
      cep TEXT,
      loc_in_sit INTEGER,
      loc_in_tipo_loc TEXT,
      loc_nu_sub INTEGER,
      loc_no_abrev TEXT,
      mun_nu TEXT
    );

    CREATE TABLE IF NOT EXISTS bairros (
      bai_nu INTEGER PRIMARY KEY,
      ufe_sg TEXT NOT NULL,
      loc_nu INTEGER NOT NULL,
      bai_no TEXT NOT NULL,
      bai_no_abrev TEXT
    );

    CREATE TABLE IF NOT EXISTS logradouros (
      log_nu INTEGER PRIMARY KEY,
      ufe_sg TEXT NOT NULL,
      loc_nu INTEGER NOT NULL,
      bai_nu_ini INTEGER,
      bai_nu_fim INTEGER,
      log_no TEXT NOT NULL,
      log_complemento TEXT,
      cep TEXT NOT NULL,
      tlo_tx TEXT,
      log_sta_tlo TEXT,
      log_no_abrev TEXT
    );

    CREATE TABLE IF NOT EXISTS grandes_usuarios (
      gru_nu INTEGER PRIMARY KEY,
      ufe_sg TEXT NOT NULL,
      loc_nu INTEGER NOT NULL,
      bai_nu INTEGER,
      log_nu INTEGER,
      gru_no TEXT NOT NULL,
      gru_endereco TEXT,
      cep TEXT NOT NULL,
      gru_no_abrev TEXT
    );

    CREATE TABLE IF NOT EXISTS faixa_localidade (
      loc_nu INTEGER NOT NULL,
      cep_ini TEXT NOT NULL,
      cep_fim TEXT NOT NULL,
      loc_in_tipo_faixa TEXT
    );

    CREATE TABLE IF NOT EXISTS faixa_bairro (
      bai_nu INTEGER NOT NULL,
      cep_ini TEXT NOT NULL,
      cep_fim TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS unidades_operacionais (
      uop_nu INTEGER PRIMARY KEY,
      ufe_sg TEXT NOT NULL,
      loc_nu INTEGER NOT NULL,
      bai_nu INTEGER,
      log_nu INTEGER,
      uop_no TEXT NOT NULL,
      uop_endereco TEXT,
      cep TEXT NOT NULL,
      uop_no_abrev TEXT
    );

    CREATE TABLE IF NOT EXISTS meta (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );
  `);
}

export function createIndexes(db: Database.Database): void {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_logradouros_cep ON logradouros(cep);
    CREATE INDEX IF NOT EXISTS idx_logradouros_loc_nu ON logradouros(loc_nu);
    CREATE INDEX IF NOT EXISTS idx_logradouros_busca ON logradouros(ufe_sg, loc_nu);
    CREATE INDEX IF NOT EXISTS idx_grandes_usuarios_cep ON grandes_usuarios(cep);
    CREATE INDEX IF NOT EXISTS idx_localidades_ufe ON localidades(ufe_sg);
    CREATE INDEX IF NOT EXISTS idx_localidades_nome ON localidades(ufe_sg, loc_no);
    CREATE INDEX IF NOT EXISTS idx_bairros_loc ON bairros(loc_nu);
    CREATE INDEX IF NOT EXISTS idx_faixa_loc ON faixa_localidade(loc_nu);
    CREATE INDEX IF NOT EXISTS idx_faixa_loc_cep ON faixa_localidade(cep_ini, cep_fim);
    CREATE INDEX IF NOT EXISTS idx_faixa_bairro ON faixa_bairro(bai_nu);
    CREATE INDEX IF NOT EXISTS idx_unidades_cep ON unidades_operacionais(cep);
  `);
}

export function getDb(): Database.Database {
  const db = new Database(DB_PATH, { readonly: true });
  db.pragma('journal_mode = WAL');
  db.pragma('cache_size = -64000');
  return db;
}
