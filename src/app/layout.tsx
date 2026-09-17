import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import EplHeader from "@/components/EplHeader";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EPL QUIZ — 프리미어리그 축구 퀴즈",
  description: "Wordle, Goltexto, 커리어 경로, 이적료 업다운. 매일 새로운 EPL 퀴즈.",
};

export const viewport: Viewport = {
  themeColor: "#38003c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} font-sans`}>
        <EplHeader />
        <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">{children}</main>
      </body>
    </html>
  );
}
