import fs from 'fs';
import path from 'path';
import { createDatabase, createTables, createIndexes } from '../database/schema';
import type Database from 'better-sqlite3';

const normalize = (s: string) =>
  s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

function carregarMapaTipoLogradouro(): (tloTx: string | null) => string {
  const txtPath = path.join(__dirname, '..', '..', '..', 'tipoLogradouro.txt');
  const conteudo = fs.readFileSync(txtPath, 'utf-8');
  const txtMap = new Map<string, string>();

  for (const linha of conteudo.split(/\r?\n/)) {
    const idx = linha.indexOf(' - ');
    if (idx === -1) continue;
    txtMap.set(normalize(linha.slice(idx + 3).trim()), linha.slice(0, idx).trim());
  }

  const manuais = new Map<string, string>(Object.entries({
    'Comunidade Urbana': 'FAV', 'Comunidade': 'FAV', 'Comunidade Rural': 'FAV',
    'Comunidade Quilombola': 'FAV', 'Comunidade Sitio': 'FAV',
    'Chácaras': 'CH', 'Blocos': 'BL', 'Pracinha': 'PC', 'Bulevar': 'BVD',
    'Calçadão': 'CALC', 'Ruela': 'R', 'Escadão': 'ESC', 'Vicinal': 'EST',
    'Vicinal Municipal': 'EST', 'Marginal': 'AV', 'Anel Viário': 'AV',
    'Semi Anel Viário': 'AV', 'Anel': 'AV', 'Nova Avenida': 'AV',
    'Segunda Avenida': 'AV', 'Terceira Avenida': 'AV', 'Pontilhão': 'PTE',
    'Antiga Estação': 'ETC', 'Quarta Ladeira': 'LD', 'Eixo': 'ART',
    'Eixo Principal': 'ART', 'Eixo Industrial': 'ART', 'Travessia': 'TV',
    'Transversal': 'TV', 'Trilha': 'CAM', 'Alça': 'AC', 'Alça de Acesso': 'AC',
  }));

  return (tloTx: string | null): string => {
    if (!tloTx) return '';
    if (manuais.has(tloTx)) return manuais.get(tloTx)!;

    const norm = normalize(tloTx);
    if (txtMap.has(norm)) return txtMap.get(norm)!;

    const semOrd = normalize(tloTx.replace(/^\d+[ªº]\s+/, ''));
    if (txtMap.has(semOrd)) return txtMap.get(semOrd)!;

    const primeira = norm.split(/\s+/)[0];
    if (primeira && txtMap.has(primeira)) return txtMap.get(primeira)!;

    const primeiraSemOrd = semOrd.split(/\s+/)[0];
    if (primeiraSemOrd && txtMap.has(primeiraSemOrd)) return txtMap.get(primeiraSemOrd)!;

    return '';
  };
}

const BASE_DIR = path.join(__dirname, '..', '..', '..', 'eDNE_Basico_26051', 'Delimitado');

const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

function lerArquivo(nomeArquivo: string): string[][] {
  const caminho = path.join(BASE_DIR, nomeArquivo);
  if (!fs.existsSync(caminho)) {
    console.log(`  Arquivo não encontrado: ${nomeArquivo}, pulando...`);
    return [];
  }

  const conteudo = fs.readFileSync(caminho, 'latin1');
  const linhas = conteudo.split(/\r?\n/).filter(l => l.trim().length > 0);

  return linhas.map(linha => linha.split('@'));
}

function importarLocalidades(db: Database.Database): void {
  console.log('Importando localidades...');
  const registros = lerArquivo('LOG_LOCALIDADE.TXT');

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO localidades (loc_nu, ufe_sg, loc_no, cep, loc_in_sit, loc_in_tipo_loc, loc_nu_sub, loc_no_abrev, mun_nu)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const inserir = db.transaction(() => {
    for (const campos of registros) {
      // loc_nu @ ufe_sg @ loc_no @ cep @ loc_in_sit @ loc_in_tipo_loc @ loc_nu_sub @ loc_no_abrev @ mun_nu
      stmt.run(
        parseInt(campos[0]),
        campos[1],
        campos[2],
        campos[3] || null,
        parseInt(campos[4]) || 0,
        campos[5] || null,
        parseInt(campos[6]) || null,
        campos[7] || null,
        campos[8] || null
      );
    }
  });

  inserir();
  console.log(`  ${registros.length} localidades importadas`);
}

function importarBairros(db: Database.Database): void {
  console.log('Importando bairros...');
  const registros = lerArquivo('LOG_BAIRRO.TXT');

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO bairros (bai_nu, ufe_sg, loc_nu, bai_no, bai_no_abrev)
    VALUES (?, ?, ?, ?, ?)
  `);

  const inserir = db.transaction(() => {
    for (const campos of registros) {
      // bai_nu @ ufe_sg @ loc_nu @ bai_no @ bai_no_abrev
      stmt.run(
        parseInt(campos[0]),
        campos[1],
        parseInt(campos[2]),
        campos[3],
        campos[4] || null
      );
    }
  });

  inserir();
  console.log(`  ${registros.length} bairros importados`);
}

function importarLogradouros(db: Database.Database): void {
  console.log('Importando logradouros...');

  const resolverId = carregarMapaTipoLogradouro();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO logradouros (log_nu, ufe_sg, loc_nu, bai_nu_ini, bai_nu_fim, log_no, log_complemento, cep, tlo_tx, log_sta_tlo, log_no_abrev, id_logradouro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let total = 0;

  for (const uf of UFS) {
    const registros = lerArquivo(`LOG_LOGRADOURO_${uf}.TXT`);

    const inserir = db.transaction(() => {
      for (const campos of registros) {
        const tloTx = campos[8] || null;
        stmt.run(
          parseInt(campos[0]),
          campos[1],
          parseInt(campos[2]),
          parseInt(campos[3]) || null,
          parseInt(campos[4]) || null,
          campos[5],
          campos[6] || null,
          campos[7],
          tloTx,
          campos[9] || null,
          campos[10] || null,
          resolverId(tloTx)
        );
      }
    });

    inserir();
    total += registros.length;
    console.log(`  ${uf}: ${registros.length} logradouros`);
  }

  console.log(`  Total: ${total} logradouros importados`);
}

function importarGrandesUsuarios(db: Database.Database): void {
  console.log('Importando grandes usuários...');
  const registros = lerArquivo('LOG_GRANDE_USUARIO.TXT');

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO grandes_usuarios (gru_nu, ufe_sg, loc_nu, bai_nu, log_nu, gru_no, gru_endereco, cep, gru_no_abrev)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const inserir = db.transaction(() => {
    for (const campos of registros) {
      // gru_nu @ ufe_sg @ loc_nu @ bai_nu @ log_nu @ gru_no @ gru_endereco @ cep @ gru_no_abrev
      stmt.run(
        parseInt(campos[0]),
        campos[1],
        parseInt(campos[2]),
        parseInt(campos[3]) || null,
        parseInt(campos[4]) || null,
        campos[5],
        campos[6] || null,
        campos[7],
        campos[8] || null
      );
    }
  });

  inserir();
  console.log(`  ${registros.length} grandes usuários importados`);
}

function importarFaixaLocalidade(db: Database.Database): void {
  console.log('Importando faixas de CEP por localidade...');
  const registros = lerArquivo('LOG_FAIXA_LOCALIDADE.TXT');

  const stmt = db.prepare(`
    INSERT INTO faixa_localidade (loc_nu, cep_ini, cep_fim, loc_in_tipo_faixa)
    VALUES (?, ?, ?, ?)
  `);

  const inserir = db.transaction(() => {
    for (const campos of registros) {
      // loc_nu @ cep_ini @ cep_fim @ loc_in_tipo_faixa
      stmt.run(
        parseInt(campos[0]),
        campos[1],
        campos[2],
        campos[3] || null
      );
    }
  });

  inserir();
  console.log(`  ${registros.length} faixas importadas`);
}

function importarFaixaBairro(db: Database.Database): void {
  console.log('Importando faixas de CEP por bairro...');
  const registros = lerArquivo('LOG_FAIXA_BAIRRO.TXT');

  const stmt = db.prepare(`
    INSERT INTO faixa_bairro (bai_nu, cep_ini, cep_fim)
    VALUES (?, ?, ?)
  `);

  const inserir = db.transaction(() => {
    for (const campos of registros) {
      // bai_nu @ cep_ini @ cep_fim
      stmt.run(
        parseInt(campos[0]),
        campos[1],
        campos[2]
      );
    }
  });

  inserir();
  console.log(`  ${registros.length} faixas de bairro importadas`);
}

function importarUnidadesOperacionais(db: Database.Database): void {
  console.log('Importando unidades operacionais...');
  const registros = lerArquivo('LOG_UNID_OPER.TXT');

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO unidades_operacionais (uop_nu, ufe_sg, loc_nu, bai_nu, log_nu, uop_no, uop_endereco, cep, uop_no_abrev)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const inserir = db.transaction(() => {
    for (const campos of registros) {
      // uop_nu @ ufe_sg @ loc_nu @ bai_nu @ log_nu @ uop_no @ uop_endereco @ cep @ uop_no_abrev
      stmt.run(
        parseInt(campos[0]),
        campos[1],
        parseInt(campos[2]),
        parseInt(campos[3]) || null,
        parseInt(campos[4]) || null,
        campos[5],
        campos[6] || null,
        campos[7],
        campos[8] || null
      );
    }
  });

  inserir();
  console.log(`  ${registros.length} unidades operacionais importadas`);
}

function main(): void {
  console.log('=== Importação eDNE Básico para SQLite ===\n');

  const dbPath = path.join(__dirname, '..', '..', 'cep.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Banco anterior removido.\n');
  }

  const db = createDatabase();
  createTables(db);

  const inicio = Date.now();

  importarLocalidades(db);
  importarBairros(db);
  importarLogradouros(db);
  importarGrandesUsuarios(db);
  importarFaixaLocalidade(db);
  importarFaixaBairro(db);
  importarUnidadesOperacionais(db);

  console.log('\nCriando índices...');
  createIndexes(db);

  // Salvar metadados
  const stmtMeta = db.prepare('INSERT OR REPLACE INTO meta (chave, valor) VALUES (?, ?)');
  stmtMeta.run('versao_edne', '26051');
  stmtMeta.run('data_importacao', new Date().toISOString());
  stmtMeta.run('data_base', '2026-05-12');

  const totalLogradouros = db.prepare('SELECT COUNT(*) as total FROM logradouros').get() as { total: number };
  const totalLocalidades = db.prepare('SELECT COUNT(*) as total FROM localidades').get() as { total: number };
  const totalBairros = db.prepare('SELECT COUNT(*) as total FROM bairros').get() as { total: number };
  const totalGU = db.prepare('SELECT COUNT(*) as total FROM grandes_usuarios').get() as { total: number };

  stmtMeta.run('total_logradouros', totalLogradouros.total.toString());
  stmtMeta.run('total_localidades', totalLocalidades.total.toString());
  stmtMeta.run('total_bairros', totalBairros.total.toString());
  stmtMeta.run('total_grandes_usuarios', totalGU.total.toString());

  const duracao = ((Date.now() - inicio) / 1000).toFixed(1);

  console.log(`\n=== Importação concluída em ${duracao}s ===`);
  console.log(`  Localidades: ${totalLocalidades.total}`);
  console.log(`  Bairros: ${totalBairros.total}`);
  console.log(`  Logradouros: ${totalLogradouros.total}`);
  console.log(`  Grandes Usuários: ${totalGU.total}`);

  db.close();
}

main();
