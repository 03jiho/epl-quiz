"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PlayerSearch from "@/components/PlayerSearch";
import ResultModal from "@/components/ResultModal";
import { similarity, type Player } from "@/lib/quiz";

interface Row {
  player: Player;
  percent: number;
  score: number;
  reasons: string[];
}

function heat(percent: number) {
  if (percent >= 70) return "bg-hit";
  if (percent >= 40) return "bg-near text-black";
  if (percent >= 15) return "bg-epl-pink/60";
  return "bg-white/10";
}

export default function GoltextoQuiz({
  players,
  answer,
  dateKey,
}: {
  players: Player[];
  answer: Player;
  dateKey: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [closed, setClosed] = useState(false);

  const solved = rows.some((r) => r.player.id === answer.id);
  const remaining = players.filter((p) => !rows.some((r) => r.player.id === p.id));
  const ranked = [...rows].sort((a, b) => b.score - a.score);

  function guess(p: Player) {
    const s = similarity(p, answer);
    const correct = p.id === answer.id;
    setRows((prev) => [
      ...prev,
      {
        player: p,
        percent: correct ? 100 : s.percent,
        score: correct ? Infinity : s.score,
        reasons: correct ? ["정답!"] : s.reasons,
      },
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>
          시도 <span className="font-bold text-epl-cyan">{rows.length}</span>회 · 무제한
        </span>
        <span className="font-mono text-xs">{dateKey}</span>
      </div>

      <PlayerSearch
        players={remaining}
        disabled={solved}
        onPick={guess}
        placeholder={solved ? "정답!" : "연관도를 확인할 선수…"}
      />

      <ul className="space-y-2">
        {ranked.map((r, i) => (
          <motion.li
            key={r.player.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-xl px-3 py-3 ${heat(r.percent)}`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-xs opacity-60">#{i + 1}</span>
              <span className="font-semibold">{r.player.name}</span>
              <span className="ml-auto font-mono font-bold">{r.percent}%</span>
            </div>
            {r.reasons.length > 0 && (
              <p className="mt-1 pl-8 text-xs opacity-80">{r.reasons.join(" · ")}</p>
            )}
          </motion.li>
        ))}
      </ul>

      {rows.length === 0 && (
        <p className="text-center text-sm text-white/50">
          아무 선수나 입력하면 정답과의 연관도(같은 팀·국적·포지션·커리어)를 알려줍니다.
        </p>
      )}

      <ResultModal
        open={solved && !closed}
        solved
        title={`${rows.length}번 만에 찾았습니다!`}
        answerName={answer.name}
        detail={`${answer.team} · ${answer.nationality} · ${answer.position}`}
        share={`EPL Goltexto ${dateKey}\n${rows.length}번 만에 정답 🎯`}
        onClose={() => setClosed(true)}
        onRetry={() => {
          setRows([]);
          setClosed(false);
        }}
      />
    </div>
  );
}
