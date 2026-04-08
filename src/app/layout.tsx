import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "開示請求診断 | その誹謗中傷、裁けるかも？",
  description:
    "Xアカウントを入力するだけ。独自エンジンが誹謗中傷の投稿を分析して、法的に裁けるかを無料で診断します。",
  icons: {
    icon: "/logo_icon.png",
    apple: "/logo_icon.png",
  },
  openGraph: {
    title: "開示請求診断 | その誹謗中傷、裁けるかも？",
    description:
      "Xアカウントを入力するだけ。独自エンジンが誹謗中傷を分析して開示請求レベルを無料診断。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "開示請求診断",
    description: "あの人の誹謗中傷、開示請求レベルは？無料で診断。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
