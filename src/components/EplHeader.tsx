import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

export default function EplHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-epl-purple/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2">
          <ArrowUpDown className="size-6 text-epl-green" aria-hidden />
          <span className="text-lg font-extrabold tracking-tight">
            EPL <span className="text-epl-pastel">UP&amp;DOWN</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
