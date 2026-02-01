import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://sonar-b-eight.vercel.app"
  ),
  title: "Sonar - AIとの対話で思考を言語化",
  description:
    "AIとの対話を通じて、あなたの考えを言語化し、スタンスを明確にする内省支援ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
