import { ImageResponse } from "next/og";
import { players } from "@/lib/players";

export const alt = "EPL UP&DOWN — Premier League higher or lower game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ponytail: 한글 폰트를 따로 싣지 않으려고 썸네일 문구는 영문/숫자만 사용
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
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 78, fontWeight: 900, letterSpacing: -2 }}>EPL</div>
          <div style={{ fontSize: 78, fontWeight: 900, letterSpacing: -2, color: "#00ff87" }}>
            UP&amp;DOWN
          </div>
        </div>

        <div style={{ fontSize: 30, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
          Premier League · Higher or Lower
        </div>

        <div style={{ display: "flex", gap: 28, marginTop: 44 }}>
          <Card name="Erling Haaland" team="Manchester City" value="€180M" tone="#00ff87" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 44,
              fontWeight: 800,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            VS
          </div>
          <Card name="Cole Palmer" team="Chelsea" value="?" tone="rgba(255,255,255,0.3)" />
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          <Pill text="▲ HIGHER" bg="#00ff87" color="#38003c" />
          <Pill text="▼ LOWER" bg="#ff2882" color="white" />
        </div>

        <div style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", marginTop: 38 }}>
          {`${players.length} players · market value, fee, wage, career stats`}
        </div>
      </div>
    ),
    size,
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
      <div style={{ fontSize: 32, fontWeight: 800 }}>{name}</div>
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
