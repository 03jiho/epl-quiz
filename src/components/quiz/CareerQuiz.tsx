"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Shield } from "lucide-react";
import PlayerSearch from "@/components/PlayerSearch";
import ResultModal from "@/components/ResultModal";
import { careerScore, type Player } from "@/lib/quiz";

export default function CareerQuiz({
  players,
  answer,
  dateKey,
}: {
  players: Player[];
  answer: Player;
  dateKey: string;
}) {
  const [revealed, setRevealed] = useState(1);
  const [wrong, setWrong] = useState<Player[]>([]);
  const [solved, setSolved] = useState(false);
  const [closed, setClosed] = useState(false);

  const allRevealed = revealed >= answer.careerClubs.length;
  const over = solved || (allRevealed && wrong.length >= 3);
  const score = solved ? careerScore(revealed, wrong.length) : 0;

  function guess(p: Player) {
    if (p.id === answer.id) {
      setSolved(true);
      return;
    }
    setWrong((w) => [...w, p]);
    setRevealed((r) => Math.min(r + 1, answer.careerClubs.length));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>
          공개 클럽 <span className="font-bold text-epl-pastel">{revealed}</span> /{" "}
          {answer.careerClubs.length} · 오답 {wrong.length}
        </span>
        <span className="font-mono text-xs">{dateKey}</span>
      </div>

      <ol className="space-y-2">
        <AnimatePresence initial={false}>
          {answer.careerClubs.slice(0, revealed).map((club, i) => (
            <motion.li
              key={club}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <Shield className="size-5 shrink-0 text-epl-pastel" aria-hidden />
              <span className="font-semibold">{club}</span>
              <span className="ml-auto font-mono text-xs text-white/40">{i + 1}번째</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      {!over && (
        <button
          onClick={() => setRevealed((r) => Math.min(r + 1, answer.careerClubs.length))}
          disabled={allRevealed}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 text-sm font-semibold active:scale-[0.98] disabled:opacity-40"
        >
          <Eye className="size-4" />
          {allRevealed ? "모든 클럽 공개됨" : "클럽 하나 더 열기 (−15점)"}
        </button>
      )}

      <PlayerSearch
        players={players.filter((p) => !wrong.some((w) => w.id === p.id))}
        disabled={over}
        onPick={guess}
        placeholder={over ? "게임 종료" : "이 커리어의 주인공은?"}
      />

      {wrong.length > 0 && (
        <p className="text-center text-xs text-miss">오답: {wrong.map((w) => w.name).join(", ")}</p>
      )}

      <ResultModal
        open={over && !closed}
        solved={solved}
        title={solved ? `${score}점!` : "실패"}
        answerName={answer.name}
        detail={`클럽 ${revealed}개 공개 · 오답 ${wrong.length}회`}
        share={`EPL 커리어 경로 ${dateKey}\n클럽 ${revealed}/${answer.careerClubs.length} 공개 · ${solved ? `${score}점 ⚽` : "실패 😵"}`}
        onClose={() => setClosed(true)}
        onRetry={() => {
          setRevealed(1);
          setWrong([]);
          setSolved(false);
          setClosed(false);
        }}
      />
    </div>
  );
}
