import type { Metadata } from "next";
import { Quicksand, Nunito } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";
import AuthButton from "@/components/AuthButton";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

export const metadata: Metadata = {
  title: "The Common Denominator - Math Made Fun & Accessible",
  description: "Where numbers meet real life. Making mathematical concepts fun and accessible through connections to all areas of life and the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${quicksand.variable}`}>
      <body>
        <Header authButton={<AuthButton />} />
        <main>{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
