import Link from "next/link";
import { Grid3x3, Radar, Route, ArrowUpDown, CalendarDays } from "lucide-react";
import { players, dailyPlayer, todayKey, type QuizMode } from "@/lib/players";

const MODES: {
  mode: QuizMode;
  title: string;
  desc: string;
  Icon: typeof Grid3x3;
  accent: string;
}[] = [
  {
    mode: "wordle",
    title: "EPL Wordle",
    desc: "팀·국적·포지션·등번호·나이 힌트로 6번 안에 선수 맞히기",
    Icon: Grid3x3,
    accent: "text-epl-green",
  },
  {
    mode: "goltexto",
    title: "Goltexto",
    desc: "입력한 선수와 정답의 연관도 점수를 보고 좁혀가기",
    Icon: Radar,
    accent: "text-epl-cyan",
  },
  {
    mode: "career",
    title: "커리어 경로",
    desc: "거쳐간 클럽을 하나씩 열며 추리. 적게 열수록 고득점",
    Icon: Route,
    accent: "text-epl-pastel",
  },
  {
    mode: "updown",
    title: "이적료 업&다운",
    desc: "두 선수의 이적료·주급·골/어시스트 비교",
    Icon: ArrowUpDown,
    accent: "text-epl-pink",
  },
];

export default function Home() {
  const today = todayKey();
  const daily = dailyPlayer(players, "wordle", today);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
          오늘의 <span className="text-epl-green">EPL 퀴즈</span>
        </h1>
        <p className="mt-2 text-sm text-white/70">
          선수 {players.length}명 · {today} 기준 매일 정답이 바뀝니다.
        </p>
      </section>

      <section className="flex items-center gap-3 rounded-2xl border border-epl-green/30 bg-epl-green/10 p-4">
        <CalendarDays className="size-5 shrink-0 text-epl-green" aria-hidden />
        <p className="text-sm">
          <span className="font-semibold">Daily Challenge</span> 준비 완료 — 오늘의 Wordle 정답은{" "}
          <span className="font-mono text-epl-green">
            {daily.name.slice(0, 1)}
            {"•".repeat(Math.max(daily.name.length - 1, 1))}
          </span>
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {MODES.map(({ mode, title, desc, Icon, accent }) => (
          <Link
            key={mode}
            href={`/${mode}`}
            className="group min-h-28 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25 hover:bg-white/10 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Icon className={`size-5 ${accent}`} aria-hidden />
              <h2 className="text-lg font-bold">{title}</h2>
            </div>
            <p className="mt-2 text-sm text-white/70">{desc}</p>
          </Link>
        ))}
      </section>

      <p className="text-center text-xs text-white/40">Step 3에서 각 모드 화면이 연결됩니다.</p>
    </div>
  );
}
