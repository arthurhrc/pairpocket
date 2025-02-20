import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PairPocket — Finanças para Casais",
  description: "Controle financeiro compartilhado para casais. Gerencie receitas, despesas e metas juntos.",
  openGraph: {
    title: "PairPocket — Finanças para Casais",
    description: "Controle financeiro compartilhado para casais. Gerencie receitas, despesas e metas juntos.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "PairPocket — Finanças para Casais",
    description: "Controle financeiro compartilhado para casais. Gerencie receitas, despesas e metas juntos.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900">
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
