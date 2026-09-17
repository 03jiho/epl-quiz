import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import EplHeader from "@/components/EplHeader";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EPL UP&DOWN — 프리미어리그 업다운 게임",
  description:
    "두 선수의 시장가치·이적료·주급·통산 기록을 비교하는 프리미어리그 업다운 게임. 몇 연속까지 맞힐 수 있나?",
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
