import UpDownGame from "@/components/UpDownGame";
import { players, todayKey } from "@/lib/players";

// 새로고침할 때마다 새 조합이 나오도록 매 요청 렌더 (캐시 금지)
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="space-y-5">
      <section className="text-center">
        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
          EPL <span className="text-epl-green">UP&amp;DOWN</span>
        </h1>
        <p className="mt-2 text-sm text-white/60">
          선수 {players.length}명 · 시장가치, 이적료, 주급, 통산 기록까지 — 어디까지 맞힐 수 있나?
        </p>
      </section>

      <UpDownGame
        players={players}
        dateKey={todayKey()}
        initialSeed={Math.random().toString(36).slice(2)}
      />
    </div>
  );
}
