import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://consultadecep.com"),
  title: "Consulta de CEP - API Gratuita de CEP dos Correios | Sem Cadastro",
  description:
    "API REST gratuita para consulta de CEP com base oficial dos Correios (eDNE). Mais de 1,5 milhão de logradouros. Sem cadastro, sem API key, sem limites. Integre em minutos.",
  keywords: ["cep", "consulta cep", "api cep", "correios", "endereço", "cep grátis", "viacep", "busca cep", "logradouro"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Consulta de CEP - API Gratuita dos Correios",
    description: "API REST gratuita para consulta de CEP. Base oficial dos Correios com 1,5M+ logradouros. Sem cadastro, sem limites.",
    url: "https://consultadecep.com",
    siteName: "Consulta de CEP",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Consulta de CEP - API Gratuita dos Correios",
    description: "API REST gratuita para consulta de CEP. Base oficial dos Correios com 1,5M+ logradouros.",
  },
  other: {
    "google-site-verification": "",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Consulta de CEP",
      url: "https://consultadecep.com",
      description: "API REST gratuita para consulta de CEP com base oficial dos Correios",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://consultadecep.com/ws/{cep}/json/",
        "query-input": "required name=cep",
      },
    },
    {
      "@type": "WebApplication",
      name: "Consulta de CEP API",
      url: "https://consultadecep.com",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BRL",
      },
      description:
        "API REST gratuita para consulta de CEP brasileiro. Base oficial dos Correios (eDNE) com mais de 1,5 milhão de logradouros, 83 mil bairros e 11 mil localidades.",
      featureList: [
        "Consulta de CEP por código",
        "Busca de CEP por endereço",
        "Sem cadastro necessário",
        "Sem API key",
        "Sem limites de uso",
        "CORS habilitado",
        "HTTPS",
        "Base dos Correios (eDNE)",
        "MCP Server para IAs",
        "GPT personalizado no ChatGPT",
      ],
    },
    {
      "@type": "Organization",
      name: "Consulta de CEP",
      url: "https://consultadecep.com",
      logo: "https://consultadecep.com/icon.svg",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
