import { Router, Request, Response } from 'express';
import { buscarPorCep, buscarPorEndereco, obterStatus } from '../database/queries';

const router = Router();

const UFS_VALIDAS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
  'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
];

// GET /ws/{cep}/json
router.get('/ws/:cep/json/', (req: Request, res: Response) => {
  const cepInput = req.params.cep.replace(/\D/g, '');

  if (cepInput.length !== 8) {
    res.status(400).json({ erro: true, mensagem: 'CEP inválido. Informe 8 dígitos.' });
    return;
  }

  const resultado = buscarPorCep(cepInput);

  if (!resultado) {
    res.json({ erro: true });
    return;
  }

  res.json(resultado);
});

// GET /ws/{uf}/{cidade}/{logradouro}/json
router.get('/ws/:uf/:cidade/:logradouro/json/', (req: Request, res: Response) => {
  const { uf, cidade, logradouro } = req.params;

  if (!UFS_VALIDAS.includes(uf.toUpperCase())) {
    res.status(400).json({ erro: true, mensagem: 'UF inválida.' });
    return;
  }

  if (cidade.length < 3) {
    res.status(400).json({ erro: true, mensagem: 'Cidade deve ter pelo menos 3 caracteres.' });
    return;
  }

  if (logradouro.length < 3) {
    res.status(400).json({ erro: true, mensagem: 'Logradouro deve ter pelo menos 3 caracteres.' });
    return;
  }

  const resultados = buscarPorEndereco(uf, cidade, logradouro);

  if (resultados.length === 0) {
    res.json([]);
    return;
  }

  res.json(resultados);
});

// GET /status
router.get('/status', (_req: Request, res: Response) => {
  const status = obterStatus();
  res.json({
    servico: 'Consulta de CEP',
    dominio: 'consultadecep.com',
    base: 'Correios - eDNE',
    versao_edne: status.versao_edne || '',
    data_base: status.data_base || '',
    data_importacao: status.data_importacao || '',
    total_logradouros: parseInt(status.total_logradouros || '0'),
    total_localidades: parseInt(status.total_localidades || '0'),
    total_bairros: parseInt(status.total_bairros || '0'),
    total_grandes_usuarios: parseInt(status.total_grandes_usuarios || '0'),
  });
});

export default router;
