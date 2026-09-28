"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, RotateCcw, X } from "lucide-react";
import { STATS, STAT_KEYS, type Player, type StatKey } from "@/lib/quiz";

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
              <b className="font-bold text-epl-green">{right.name}</b>의 {STATS[stat].label}는{" "}
              <b className="font-bold text-white">{STATS[stat].format(STATS[stat].get(right))}</b>
              였습니다.
            </p>

            <StatTable left={left} right={right} active={stat} />

            {(left.transferNote || right.transferNote) && (
              <div className="mt-3 space-y-1 rounded-xl bg-black/25 p-3 text-[11px] leading-relaxed text-white/75">
                {left.transferNote && (
                  <p>
                    <b className="font-semibold text-white">{left.name}</b> — {left.transferNote}
                  </p>
                )}
                {right.transferNote && (
                  <p>
                    <b className="font-semibold text-epl-green">{right.name}</b> —{" "}
                    {right.transferNote}
                  </p>
                )}
              </div>
            )}

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

function StatTable({ left, right, active }: { left: Player; right: Player; active: StatKey }) {
  return (
    <table className="mt-4 w-full table-fixed text-[11px]">
      <thead>
        <tr className="text-white/50">
          <th className="w-[36%] pb-2 text-left font-normal">기록</th>
          <th className="pb-2 text-right font-semibold text-white/85">{short(left.name)}</th>
          <th className="pb-2 text-right font-semibold text-epl-green">{short(right.name)}</th>
        </tr>
      </thead>
      <tbody>
        <Row label="소속" l={left.team} r={right.team} />
        <Row
          label="포지션 · 나이"
          l={`${left.position} · ${left.age}세`}
          r={`${right.position} · ${right.age}세`}
        />
        {STAT_KEYS.map((key) => {
          const { label, format, get } = STATS[key];
          return (
            <Row
              key={key}
              label={label}
              l={format(get(left))}
              r={format(get(right))}
              highlight={key === active}
            />
          );
        })}
      </tbody>
    </table>
  );
}

function Row({
  label,
  l,
  r,
  highlight,
}: {
  label: string;
  l: string;
  r: string;
  highlight?: boolean;
}) {
  const cell = highlight ? "font-extrabold text-white" : "text-white/85";
  return (
    <tr className={highlight ? "bg-epl-green/15" : undefined}>
      <td className={`py-1.5 pl-1.5 ${highlight ? "font-bold text-epl-green" : "text-white/60"}`}>
        {label}
      </td>
      <td className={`py-1.5 pr-1.5 text-right ${cell}`}>{l}</td>
      <td className={`py-1.5 pr-1.5 text-right ${cell}`}>{r}</td>
    </tr>
  );
}

/** 표 머리글이 넘치지 않게 성을 우선 표시 */
function short(name: string) {
  const parts = name.split(" ");
  return parts.length > 1 ? parts.slice(1).join(" ") : name;
}
