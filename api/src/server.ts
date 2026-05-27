import express from 'express';
import cors from 'cors';
import cepRoutes from './routes/cep';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(cepRoutes);

app.listen(PORT, () => {
  console.log(`API Consulta de CEP rodando na porta ${PORT}`);
});
