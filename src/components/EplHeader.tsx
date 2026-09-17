import Link from "next/link";
import { Trophy } from "lucide-react";

export default function EplHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-epl-purple/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Trophy className="size-6 text-epl-green" aria-hidden />
          <span className="text-lg font-extrabold tracking-tight">
            EPL <span className="text-epl-pastel">QUIZ</span>
          </span>
        </Link>
        <span className="ml-auto rounded-full bg-epl-pink/20 px-3 py-1 text-xs font-semibold text-epl-pastel">
          MVP
        </span>
      </div>
    </header>
  );
}
