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
  title: "Consulta de CEP - API gratuita para consulta de CEP",
  description:
    "API gratuita e sem restrições para consulta de CEP. Base oficial dos Correios atualizada. Sem cadastro, sem API key, sem limites.",
  keywords: ["cep", "consulta cep", "api cep", "correios", "endereço", "cep grátis"],
  openGraph: {
    title: "Consulta de CEP",
    description: "API gratuita para consulta de CEP com base dos Correios",
    url: "https://consultadecep.com",
    siteName: "Consulta de CEP",
    type: "website",
  },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
