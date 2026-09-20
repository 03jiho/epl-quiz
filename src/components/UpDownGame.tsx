"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Flame, Trophy } from "lucide-react";
import ResultModal from "@/components/ResultModal";
import { BLOCK_SIZE, STATS, buildRound, isHigher, shareText, type Player } from "@/lib/quiz";

const BEST_KEY = "epl-updown-best";

export default function UpDownGame({
  players,
  dateKey,
  initialSeed,
}: {
  players: Player[];
  dateKey: string;
  /** 서버에서 매 요청 새로 만든 시드 — 새로고침하면 새 조합 */
  initialSeed: string;
}) {
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [picked, setPicked] = useState<"up" | "down" | null>(null);
  const [dead, setDead] = useState(false);
  /** 한 판이 끝날 때마다 바뀌는 시드 — 매번 새 문제 순서 */
  const [seed, setSeed] = useState(initialSeed);

  // 최고 기록은 브라우저에만 저장. 차단된 환경에서도 게임은 그대로 동작한다.
  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
    } catch {
      /* 저장소 접근 불가 — 무시 */
    }
  }, []);

  function saveBest(value: number) {
    setBest(value);
    try {
      localStorage.setItem(BEST_KEY, String(value));
    } catch {
      /* 무시 */
    }
  }

  const currentRound = buildRound(players, seed, round);
  const { left, right, stat, isStatChange } = currentRound;
  const { label, format, get } = STATS[stat];
  const answerHigher = isHigher(currentRound);

  function answer(choice: "up" | "down") {
    if (picked) return;
    setPicked(choice);
    const correct = (choice === "up") === answerHigher;
    setTimeout(() => {
      if (!correct) {
        setDead(true);
        return;
      }
      const next = streak + 1;
      setStreak(next);
      if (next > best) saveBest(next);
      setRound((r) => r + 1);
      setPicked(null);
    }, 1100);
  }

  function restart() {
    setSeed(`${initialSeed}:${Date.now()}:${Math.random()}`);
    setRound(0);
    setStreak(0);
    setPicked(null);
    setDead(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-lg font-bold">
          <Flame className="size-5 text-epl-pink" aria-hidden />
          {streak}
          <span className="text-sm font-normal text-white/50">연속</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm text-white/60">
          <Trophy className="size-4 text-epl-green" aria-hidden />
          최고 {best}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <motion.span
          key={stat}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            isStatChange ? "bg-epl-green text-epl-purple" : "bg-white/10"
          }`}
        >
          {isStatChange ? `스탯 변경 · ${label}` : label}
        </motion.span>
        <span className="text-[11px] text-white/35">{`${BLOCK_SIZE}라운드마다 스탯이 바뀝니다`}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          key={`L-${left.id}-${stat}`}
          initial={{ x: isStatChange || round === 0 ? 0 : 110, opacity: isStatChange ? 0 : 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <PlayerCard player={left} value={format(get(left))} />
        </motion.div>
        <motion.div
          key={`R-${right.id}-${stat}`}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.05 }}
        >
          <PlayerCard
            player={right}
            value={picked ? format(get(right)) : "?"}
            revealed={!!picked}
            higher={answerHigher}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => answer("up")}
          disabled={!!picked}
          className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-epl-green text-lg font-extrabold text-epl-purple transition active:scale-95 disabled:opacity-40"
        >
          <ChevronUp className="size-6" /> 더 높다
        </button>
        <button
          onClick={() => answer("down")}
          disabled={!!picked}
          className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-epl-pink text-lg font-extrabold transition active:scale-95 disabled:opacity-40"
        >
          <ChevronDown className="size-6" /> 더 낮다
        </button>
      </div>

      <p className="text-center text-xs text-white/40">
        오른쪽 선수의 <b className="font-semibold text-white/60">{label}</b> — 왼쪽보다 높을까요,
        낮을까요?
      </p>

      <ResultModal
        open={dead}
        solved={false}
        title={`${streak}연속에서 종료`}
        answerName={`${right.name} — ${format(get(right))}`}
        detail={`${left.name}는 ${format(get(left))} · ${label}`}
        share={shareText(streak, best, dateKey)}
        onClose={restart}
        onRetry={restart}
      />
    </div>
  );
}

function PlayerCard({
  player,
  value,
  revealed,
  higher,
}: {
  player: Player;
  value: string;
  revealed?: boolean;
  higher?: boolean;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <p className="text-base font-bold leading-tight">{player.name}</p>
      <p className="mt-1 text-xs text-white/50">
        {player.team} · {player.position}
      </p>
      <AnimatePresence mode="wait">
        <motion.p
          key={value}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`mt-4 text-3xl font-extrabold ${
            value === "?"
              ? "text-white/25"
              : revealed && !higher
                ? "text-epl-pink"
                : "text-epl-green"
          }`}
        >
          {value}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
