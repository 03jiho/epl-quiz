import raw from "@/data/epl_players.json";
import type { Player } from "./quiz";

// ponytail: 로컬 JSON = 단일 데이터 소스. Supabase 붙일 땐 이 파일만 fetch로 교체.
export const players = raw as Player[];

export const teams = [...new Set(players.map((p) => p.team))].sort();
export const nationalities = [...new Set(players.map((p) => p.nationality))].sort();

export function byId(id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

export * from "./quiz";
