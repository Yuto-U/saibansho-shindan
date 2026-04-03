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
  title: "裁判所行き診断 | その誹謗中傷、裁けるかも？",
  description:
    "Xアカウントを入力するだけ。AIが誹謗中傷の投稿を分析して、法的に裁けるかを無料で診断します。",
  icons: {
    icon: "/logo_icon.png",
    apple: "/logo_icon.png",
  },
  openGraph: {
    title: "裁判所行き診断 | その誹謗中傷、裁けるかも？",
    description:
      "Xアカウントを入力するだけ。AIが誹謗中傷を分析して裁判所行きレベルを無料診断。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "裁判所行き診断",
    description: "あの人の誹謗中傷、裁判所行きレベルは？無料で診断。",
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
