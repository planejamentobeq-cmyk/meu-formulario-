import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Separação de Materiais",
  description: "Formulário de separação de materiais - EPI EPC e Ferramentas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
