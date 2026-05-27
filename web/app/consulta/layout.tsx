import type { Metadata } from "next";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O que é CEP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CEP (Código de Endereçamento Postal) é um código numérico de 8 dígitos utilizado pelos Correios do Brasil para identificar localidades, logradouros e unidades de distribuição de correspondências. O formato é XXXXX-XXX.",
      },
    },
    {
      "@type": "Question",
      name: "Como consultar um CEP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Digite o CEP com 8 dígitos no campo de busca acima. Você receberá o endereço completo: logradouro, bairro, cidade, estado e código IBGE. Também é possível fazer o caminho inverso: buscar o CEP pelo endereço informando estado, cidade e rua.",
      },
    },
    {
      "@type": "Question",
      name: "A consulta de CEP é gratuita?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim, a consulta é 100% gratuita, sem cadastro e sem limites. Desenvolvedores também podem usar nossa API REST gratuitamente em seus projetos.",
      },
    },
    {
      "@type": "Question",
      name: "De onde vêm os dados?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Os dados são da base oficial eDNE (e-Diretório Nacional de Endereços) dos Correios, que contém mais de 1,5 milhão de logradouros, 83 mil bairros e 11 mil localidades em todos os 27 estados brasileiros.",
      },
    },
    {
      "@type": "Question",
      name: "Como descobrir o CEP de um endereço?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use a busca por endereço: selecione o estado, digite a cidade e o nome da rua. O sistema retornará todos os CEPs correspondentes (até 50 resultados). Quanto mais específica a busca, mais preciso o resultado.",
      },
    },
    {
      "@type": "Question",
      name: "O CEP pode mudar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim, os Correios podem alterar CEPs quando há desmembramento de municípios, criação de novos logradouros ou reorganização da distribuição postal. Nossa base é atualizada periodicamente para refletir essas mudanças.",
      },
    },
    {
      "@type": "Question",
      name: "Posso usar a API no meu sistema?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim! A API é gratuita e não requer cadastro ou API key. Basta fazer uma requisição GET para https://consultadecep.com/ws/{cep}/json/ e você receberá o endereço em formato JSON. Veja a documentação completa em consultadecep.com.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: "https://consultadecep.com" },
    { "@type": "ListItem", position: 2, name: "Consultar CEP", item: "https://consultadecep.com/consulta" },
  ],
};

export const metadata: Metadata = {
  title: "Consultar CEP Grátis - Busca de CEP e Endereço | Consulta de CEP",
  description:
    "Consulte qualquer CEP do Brasil gratuitamente. Busque por CEP para encontrar o endereço completo ou por endereço para descobrir o CEP. Base oficial dos Correios atualizada com 1,5 milhão de logradouros.",
  keywords: [
    "consultar cep", "buscar cep", "cep grátis", "encontrar cep",
    "cep por endereço", "endereço por cep", "correios cep",
    "consulta cep online", "busca cep grátis", "qual meu cep",
  ],
  alternates: {
    canonical: "/consulta",
  },
  openGraph: {
    title: "Consultar CEP Grátis - Busque qualquer CEP do Brasil",
    description: "Consulte CEPs e endereços gratuitamente. Base oficial dos Correios com 1,5M+ logradouros.",
    url: "https://consultadecep.com/consulta",
  },
};

export default function ConsultaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
