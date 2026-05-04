import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

import { LegalFooter } from "@/components/legal/LegalFooter";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "STRAX | Diagnostico estructural empresarial para CEOs y fundadores",
  description:
    "Diagnostico estructural empresarial para detectar ineficiencias operativas, dependencia del fundador, problemas de procesos, datos y tecnologia que erosionan margen y rentabilidad.",
  keywords: [
    "diagnostico empresarial",
    "diagnostico estructural empresarial",
    "ineficiencias operativas",
    "rentabilidad empresarial",
    "procesos empresariales",
    "dependencia del fundador",
    "consultoria de operaciones",
    "transformacion empresarial",
    "diagnostico para CEO",
    "problemas de margen",
  ],
  openGraph: {
    title: "STRAX | Diagnostico estructural empresarial",
    description:
      "Detecta fugas de rentabilidad, dependencia del fundador y fricciones operativas con una lectura estructural para CEOs y fundadores.",
    type: "website",
    locale: "es_CO",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <LegalFooter />
        </Providers>
      </body>
    </html>
  );
}
