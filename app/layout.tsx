import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "PragmaGestion — Pilotage économique BTP",
  description: "Le seul ERP BTP qui se pilote avec 3 chiffres : CA, Coûts, MBH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans custom-scrollbar`}>
        {children}
      </body>
    </html>
  );
}
