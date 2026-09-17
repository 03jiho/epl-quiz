"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PlayerSearch from "@/components/PlayerSearch";
import ResultModal from "@/components/ResultModal";
import { compareGuess, shareText, MAX_TRIES, type Cell, type Player } from "@/lib/quiz";

const CELL_BG: Record<Cell["state"], string> = {
  hit: "bg-hit",
  near: "bg-near text-black",
  miss: "bg-miss",
};

const HEADERS = ["소속팀", "국적", "POS", "등번호", "나이"];

export default function WordleQuiz({
  players,
  answer,
  dateKey,
}: {
  players: Player[];
  answer: Player;
  dateKey: string;
}) {
  const [guesses, setGuesses] = useState<Player[]>([]);
  const [closed, setClosed] = useState(false);

  const rows = guesses.map((g) => compareGuess(g, answer));
  const solved = guesses.some((g) => g.id === answer.id);
  const over = solved || guesses.length >= MAX_TRIES;
  const remaining = players.filter((p) => !guesses.some((g) => g.id === p.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>
          남은 기회 <span className="font-bold text-epl-green">{MAX_TRIES - guesses.length}</span> /{" "}
          {MAX_TRIES}
        </span>
        <span className="font-mono text-xs">{dateKey}</span>
      </div>

      <PlayerSearch
        players={remaining}
        disabled={over}
        onPick={(p) => setGuesses((g) => [...g, p])}
        placeholder={over ? "게임 종료" : "선수를 추측해보세요…"}
      />

      {guesses.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-5 gap-1 px-1 text-center text-[10px] uppercase tracking-wide text-white/40">
            {HEADERS.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {rows.map((row, i) => (
            <motion.div
              key={guesses[i].id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <p className="px-1 text-sm font-semibold">{guesses[i].name}</p>
              <div className="grid grid-cols-5 gap-1">
                {row.map((c) => (
                  <div
                    key={c.key}
                    className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-1 text-center text-xs font-semibold leading-tight ${CELL_BG[c.state]}`}
                  >
                    <span className="break-keep">{c.value}</span>
                    {c.dir && <span aria-hidden>{c.dir === "up" ? "▲" : "▼"}</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="pt-2 text-center text-xs text-white/40">
        🟩 일치 · 🟨 같은 계열 / 근접 · 🟥 불일치 · ▲ 더 큼 · ▼ 더 작음
      </p>

      <ResultModal
        open={over && !closed}
        solved={solved}
        title={solved ? `${guesses.length}번 만에 정답!` : "아쉽네요"}
        answerName={answer.name}
        detail={`${answer.team} · ${answer.nationality} · ${answer.position} · #${answer.number}`}
        share={shareText(rows, solved, dateKey)}
        onClose={() => setClosed(true)}
        onRetry={() => {
          setGuesses([]);
          setClosed(false);
        }}
      />
    </div>
  );
}
