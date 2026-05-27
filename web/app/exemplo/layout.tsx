import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exemplos de Integração - Consulta de CEP",
  description:
    "Exemplos prontos de integração com a API de CEP em JavaScript, jQuery e React. Auto preenchimento de endereço via CEP com código fonte completo.",
  alternates: {
    canonical: "/exemplo/javascript",
  },
};

export default function ExemploLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
