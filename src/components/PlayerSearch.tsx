"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { searchPlayers, type Player } from "@/lib/quiz";

export default function PlayerSearch({
  players,
  onPick,
  disabled,
  placeholder = "선수 이름 검색…",
}: {
  players: Player[];
  onPick: (p: Player) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const results = searchPlayers(players, query);

  function pick(p: Player) {
    onPick(p);
    setQuery("");
  }

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40"
        aria-hidden
      />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) pick(results[0]);
        }}
        disabled={disabled}
        placeholder={placeholder}
        aria-label="선수 검색"
        autoComplete="off"
        className="h-12 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 text-base outline-none placeholder:text-white/40 focus:border-epl-green/60 disabled:opacity-40"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-white/15 bg-epl-purple-light shadow-xl">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => pick(p)}
                className="flex w-full items-center gap-2 px-3 py-3 text-left hover:bg-white/10"
              >
                <span className="font-semibold">{p.name}</span>
                <span className="ml-auto text-xs text-white/50">
                  {p.team} · {p.position}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
