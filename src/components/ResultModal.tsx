"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, RotateCcw, X } from "lucide-react";

export default function ResultModal({
  open,
  solved,
  title,
  answerName,
  detail,
  share,
  onClose,
  onRetry,
}: {
  open: boolean;
  solved: boolean;
  title: string;
  answerName: string;
  detail?: string;
  /** 클립보드로 복사할 공유 텍스트. 없으면 공유 버튼 숨김 */
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
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-white/15 bg-epl-purple-light p-6 text-center"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="닫기"
              className="ml-auto block rounded-lg p-1 text-white/50 hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
            <p className="text-4xl">{solved ? "🎉" : "😵"}</p>
            <h2 className="mt-2 text-xl font-extrabold">{title}</h2>
            <p className="mt-1 text-sm text-white/70">
              정답: <span className="font-semibold text-epl-green">{answerName}</span>
            </p>
            {detail && <p className="mt-1 text-sm text-white/60">{detail}</p>}

            {share && (
              <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-black/25 p-3 text-left text-sm leading-relaxed">
                {share}
              </pre>
            )}

            <div className="mt-5 flex gap-2">
              {share && (
                <button
                  onClick={copy}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-epl-green font-bold text-epl-purple active:scale-95"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "복사됨!" : "결과 공유"}
                </button>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 font-bold active:scale-95"
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
