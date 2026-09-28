"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, RotateCcw, X } from "lucide-react";
import { STATS, type Player, type StatKey } from "@/lib/quiz";

export default function ResultModal({
  open,
  title,
  left,
  right,
  stat,
  share,
  onClose,
  onRetry,
}: {
  open: boolean;
  title: string;
  /** 기준이 됐던 선수 */
  left: Player;
  /** 맞혀야 했던 선수 */
  right: Player;
  /** 이번 라운드에 비교한 스탯 */
  stat: StatKey;
  /** 클립보드로 복사할 공유 텍스트 */
  share?: string;
  onClose: () => void;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!share) return;
    try {
      await navigator.clipboard.writeText(share);
    } catch {
      // 클립보드 차단 환경(비 HTTPS 등) 대비
      const ta = document.createElement("textarea");
      ta.value = share;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-30 flex items-end justify-center overflow-y-auto bg-black/70 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="my-auto w-full max-w-md rounded-2xl border border-white/15 bg-epl-purple-light p-5"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">😵</span>
              <h2 className="text-lg font-extrabold">{title}</h2>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="ml-auto rounded-lg p-1 text-white/60 hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-2 text-sm text-white/75">
              이번 라운드는 <b className="font-bold text-white">{STATS[stat].label}</b> 비교였습니다.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <PlayerStat player={left} stat={stat} />
              <PlayerStat player={right} stat={stat} answer />
            </div>

            {share && (
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-black/25 p-3 text-sm leading-relaxed">
                {share}
              </pre>
            )}

            <div className="mt-4 flex gap-2">
              {share && (
                <button
                  onClick={copy}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-epl-green font-bold text-epl-purple active:scale-95"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "복사됨!" : "결과 공유"}
                </button>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/25 font-bold active:scale-95"
                >
                  <RotateCcw className="size-4" />
                  다시하기
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlayerStat({
  player,
  stat,
  answer,
}: {
  player: Player;
  stat: StatKey;
  /** 맞혀야 했던 쪽 */
  answer?: boolean;
}) {
  const { format, get } = STATS[stat];
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        answer ? "border-epl-green/60 bg-epl-green/10" : "border-white/15 bg-white/5"
      }`}
    >
      <p className="text-sm font-bold leading-tight">{player.name}</p>
      <p className="mt-1 text-[11px] text-white/60">
        {player.team} · {player.position}
      </p>
      {player.parentClub && (
        <p className="text-[10px] text-white/45">임대 · 원소속 {player.parentClub}</p>
      )}
      <p className={`mt-2 text-2xl font-extrabold ${answer ? "text-epl-green" : "text-white"}`}>
        {format(get(player))}
      </p>
      {stat === "transferFee" && player.transferNote && (
        <p className="mt-2 border-t border-white/10 pt-2 text-[11px] leading-snug text-white/70">
          {player.transferNote}
        </p>
      )}
    </div>
  );
}
