import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exemplos - Consulta de CEP",
};

export default function ExemploLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
