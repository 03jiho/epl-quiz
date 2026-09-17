"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Flame } from "lucide-react";
import ResultModal from "@/components/ResultModal";
import { pickPair, statOf, STAT_LABEL, type Player, type StatKey } from "@/lib/quiz";

const STATS: StatKey[] = ["transferFee", "weeklyWage", "goals", "assists"];

export default function UpDownQuiz({ players }: { players: Player[] }) {
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [dead, setDead] = useState(false);

  const stat = STATS[round % STATS.length];
  const [left, right] = pickPair(players, stat, round);
  const leftVal = statOf[stat](left);
  const rightVal = statOf[stat](right);

  function answer(higher: boolean) {
    if (reveal) return;
    const correct = higher === rightVal > leftVal;
    setReveal(true);
    setTimeout(() => {
      if (correct) {
        const next = streak + 1;
        setStreak(next);
        setBest((b) => Math.max(b, next));
        setRound((r) => r + 1);
        setReveal(false);
      } else {
        setBest((b) => Math.max(b, streak));
        setDead(true);
      }
    }, 900);
  }

  function restart() {
    setRound((r) => r + 1);
    setStreak(0);
    setReveal(false);
    setDead(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span className="flex items-center gap-1">
          <Flame className="size-4 text-epl-pink" aria-hidden />
          연속 <span className="font-bold text-epl-pink">{streak}</span>
        </span>
        <span className="text-xs">최고 {best}</span>
      </div>

      <p className="text-center text-sm text-white/60">{STAT_LABEL[stat]} 비교</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-base font-bold">{left.name}</p>
          <p className="mt-1 text-xs text-white/50">{left.team}</p>
          <p className="mt-3 text-3xl font-extrabold text-epl-green">{leftVal}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-base font-bold">{right.name}</p>
          <p className="mt-1 text-xs text-white/50">{right.team}</p>
          {reveal ? (
            <motion.p
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mt-3 text-3xl font-extrabold ${rightVal > leftVal ? "text-epl-green" : "text-epl-pink"}`}
            >
              {rightVal}
            </motion.p>
          ) : (
            <p className="mt-3 text-3xl font-extrabold text-white/30">?</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => answer(true)}
          disabled={reveal}
          className="flex h-14 items-center justify-center gap-2 rounded-xl bg-epl-green font-bold text-epl-purple active:scale-95 disabled:opacity-40"
        >
          <ChevronUp className="size-5" /> 더 높다
        </button>
        <button
          onClick={() => answer(false)}
          disabled={reveal}
          className="flex h-14 items-center justify-center gap-2 rounded-xl bg-epl-pink font-bold active:scale-95 disabled:opacity-40"
        >
          <ChevronDown className="size-5" /> 더 낮다
        </button>
      </div>

      <ResultModal
        open={dead}
        solved={false}
        title={`${streak}연속에서 종료`}
        answerName={`${right.name} — ${rightVal}`}
        detail={`${left.name}는 ${leftVal} (${STAT_LABEL[stat]})`}
        share={`EPL 업&다운\n${streak}연속 정답 🔥 (최고 ${best})`}
        onClose={restart}
        onRetry={restart}
      />
    </div>
  );
}
