import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade - Consulta de CEP",
  description: "Política de privacidade do serviço Consulta de CEP.",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0c0a14]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="size-8 rounded-lg bg-violet-600 flex items-center justify-center font-mono">
              <span className="text-white text-[11px] font-bold">&lt;/&gt;</span>
            </div>
            <span className="text-base font-semibold tracking-tight">
              Consulta de CEP
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Política de Privacidade
        </h1>
        <p className="text-sm text-white/30 mb-12">
          Última atualização: 27 de maio de 2026
        </p>

        <div className="space-y-10 text-sm text-white/50 leading-relaxed">
          {/* Introdução */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">1. Introdução</h2>
            <p>
              O <strong className="text-white/70">Consulta de CEP</strong> (&quot;nós&quot;, &quot;nosso&quot;) respeita a
              privacidade de todos os usuários do serviço disponível em{" "}
              <strong className="text-white/70">consultadecep.com</strong>. Esta política descreve quais
              informações coletamos, como as utilizamos e quais são seus direitos.
            </p>
          </section>

          {/* Dados coletados */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">2. Dados coletados</h2>
            <p className="mb-3">
              Nosso serviço foi projetado para coletar o <strong className="text-white/70">mínimo de dados possível</strong>.
              Não exigimos cadastro, login ou qualquer informação pessoal para utilização da API.
            </p>
            <p className="mb-2"><strong className="text-white/70">Dados coletados automaticamente:</strong></p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                <strong className="text-white/70">Endereço IP:</strong> utilizado exclusivamente para controle de
                rate limiting (limite de 100 requisições por minuto por IP) e proteção contra abusos.
              </li>
              <li>
                <strong className="text-white/70">Dados da requisição:</strong> URL acessada, método HTTP, horário
                e user-agent do navegador, registrados em logs de acesso do servidor.
              </li>
            </ul>
            <p className="mt-3"><strong className="text-white/70">Dados que NÃO coletamos:</strong></p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Nome, e-mail, telefone ou qualquer dado pessoal identificável</li>
              <li>Cookies de rastreamento ou publicidade</li>
              <li>Dados de geolocalização</li>
              <li>Informações de pagamento</li>
            </ul>
          </section>

          {/* Uso dos dados */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">3. Uso dos dados</h2>
            <p>Os dados coletados são utilizados exclusivamente para:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
              <li>Garantir a disponibilidade e estabilidade do serviço</li>
              <li>Aplicar limites de uso (rate limiting) para proteção contra abusos</li>
              <li>Monitorar e prevenir atividades maliciosas</li>
              <li>Gerar estatísticas agregadas e anônimas de uso</li>
            </ul>
          </section>

          {/* Compartilhamento */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">4. Compartilhamento de dados</h2>
            <p>
              <strong className="text-white/70">Não vendemos, alugamos ou compartilhamos</strong> seus dados com
              terceiros para fins comerciais ou de marketing. Dados podem ser compartilhados apenas nas
              seguintes situações:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
              <li>Quando exigido por lei, ordem judicial ou autoridade competente</li>
              <li>Para proteger nossos direitos, propriedade ou segurança do serviço</li>
              <li>Com provedores de infraestrutura (hospedagem e CDN) que processam dados em nosso nome</li>
            </ul>
          </section>

          {/* Armazenamento e retenção */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">5. Armazenamento e retenção</h2>
            <p>
              Os dados de rate limiting (IP + contador) são armazenados temporariamente em memória e
              expiram automaticamente após <strong className="text-white/70">1 minuto</strong>. Logs de acesso do
              servidor são retidos por até <strong className="text-white/70">30 dias</strong> e depois descartados
              automaticamente.
            </p>
          </section>

          {/* Segurança */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">6. Segurança</h2>
            <p>
              Adotamos medidas técnicas para proteger os dados, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
              <li>Comunicação criptografada via HTTPS/TLS</li>
              <li>Proteção contra abusos via rate limiting</li>
              <li>Infraestrutura hospedada em provedores com certificações de segurança</li>
            </ul>
          </section>

          {/* Direitos do usuário */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">7. Seus direitos</h2>
            <p className="mb-2">
              Em conformidade com a <strong className="text-white/70">Lei Geral de Proteção de Dados (LGPD)</strong>,
              você tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-white/70">Acesso:</strong> solicitar informações sobre os dados que possuímos sobre você</li>
              <li><strong className="text-white/70">Correção:</strong> solicitar a correção de dados incompletos ou inexatos</li>
              <li><strong className="text-white/70">Eliminação:</strong> solicitar a exclusão dos seus dados pessoais</li>
              <li><strong className="text-white/70">Portabilidade:</strong> solicitar a transferência dos seus dados</li>
              <li><strong className="text-white/70">Revogação do consentimento:</strong> revogar o consentimento a qualquer momento</li>
              <li><strong className="text-white/70">Oposição:</strong> opor-se ao tratamento de dados em determinadas circunstâncias</li>
            </ul>
            <p className="mt-3">
              Como nosso serviço não coleta dados pessoais identificáveis, na maioria dos casos
              não há dados pessoais a serem acessados, corrigidos ou eliminados.
            </p>
          </section>

          {/* Base de dados */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">8. Base de dados de CEP</h2>
            <p>
              Os dados de endereços disponibilizados pela API são provenientes da base pública
              do <strong className="text-white/70">eDNE (e-Diretório Nacional de Endereços)</strong> dos Correios.
              Esses dados são de domínio público e não contêm informações pessoais de indivíduos.
            </p>
          </section>

          {/* Menores */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">9. Menores de idade</h2>
            <p>
              Nosso serviço é uma API técnica destinada a desenvolvedores. Não coletamos
              intencionalmente dados de menores de 18 anos. O uso do serviço por menores deve
              ser supervisionado por um responsável legal.
            </p>
          </section>

          {/* Alterações */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">10. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Alterações significativas serão
              comunicadas através do próprio site. Recomendamos revisar esta página regularmente.
            </p>
          </section>

          {/* Contato */}
          <section>
            <h2 className="text-lg font-semibold text-white/90 mb-3">11. Contato</h2>
            <p>
              Para dúvidas, solicitações ou exercício dos seus direitos, entre em contato através
              do repositório do projeto no{" "}
              <a
                href="https://github.com/danill0muniz/consulta-de-cep/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
              >
                GitHub
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity mb-3">
            <div className="size-6 rounded-md bg-violet-600 flex items-center justify-center font-mono">
              <span className="text-white text-[9px] font-bold">&lt;/&gt;</span>
            </div>
            <span className="text-sm font-semibold">Consulta de CEP</span>
          </Link>
          <p className="text-xs text-white/30">
            Base de dados: Correios (eDNE) — consultadecep.com
          </p>
        </div>
      </footer>
    </div>
  );
}
