import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { players } from "@/lib/players";

export const alt = "EPL UP&DOWN — 프리미어리그 업다운 게임";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ponytail: 썸네일에 쓰는 글자만 담은 서브셋 폰트(각 26KB). 글자를 추가하면
// scripts/build-og-font.mjs 로 다시 받아야 한다.
const fontDir = join(process.cwd(), "src/app/fonts");
const [bold, black] = await Promise.all([
  readFile(join(fontDir, "NotoSansKR-Bold.ttf")),
  readFile(join(fontDir, "NotoSansKR-Black.ttf")),
]);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at top, #4d0a52 0%, #38003c 55%, #240028 100%)",
          color: "white",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 78, fontWeight: 900, letterSpacing: -2 }}>EPL</div>
          <div style={{ fontSize: 78, fontWeight: 900, letterSpacing: -2, color: "#00ff87" }}>
            UP&amp;DOWN
          </div>
        </div>

        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.75)", marginTop: 10 }}>
          프리미어리그 업다운 게임
        </div>

        <div style={{ display: "flex", gap: 28, marginTop: 42 }}>
          <Card name="Erling Haaland" team="Manchester City" value="€180M" tone="#00ff87" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 40,
              fontWeight: 800,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            VS
          </div>
          <Card name="Cole Palmer" team="Chelsea" value="?" tone="rgba(255,255,255,0.3)" />
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 38 }}>
          <Pill text="▲ 더 높다" bg="#00ff87" color="#38003c" />
          <Pill text="▼ 더 낮다" bg="#ff2882" color="white" />
        </div>

        <div style={{ fontSize: 26, color: "rgba(255,255,255,0.55)", marginTop: 36 }}>
          {`선수 ${players.length}명 · 시장가치 · 이적료 · 주급 · 통산 기록`}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans KR", data: bold, weight: 700, style: "normal" },
        { name: "Noto Sans KR", data: black, weight: 900, style: "normal" },
      ],
    },
  );
}

function Card({
  name,
  team,
  value,
  tone,
}: {
  name: string;
  team: string;
  value: string;
  tone: string;
}) {
  return (
    <div
      style={{
        width: 330,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 20px",
        borderRadius: 28,
        border: "2px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 900 }}>{name}</div>
      <div style={{ fontSize: 22, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{team}</div>
      <div style={{ fontSize: 56, fontWeight: 900, color: tone, marginTop: 18 }}>{value}</div>
    </div>
  );
}

function Pill({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        padding: "14px 34px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 28,
        fontWeight: 900,
      }}
    >
      {text}
    </div>
  );
}
