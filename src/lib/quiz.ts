export type Position = "GK" | "DF" | "MF" | "FW";

export interface Player {
  id: string;
  name: string;
  team: string;
  nationality: string;
  position: Position;
  age: number;
  /** 현재(은퇴 선수는 전성기) 추정 시장가치, €M */
  marketValue: number;
  /** 커리어 최고 이적료, €M */
  transferFee: number;
  /** 주급, £k */
  weeklyWage: number;
  /** 프리미어리그 통산 골 */
  plGoals: number;
  /** 프리미어리그 통산 출전 */
  plApps: number;
  bestSeason: { season: string; goals: number; assists: number };
}

/** 비교 가능한 스탯 — 라운드마다 하나씩 돌아가며 출제된다 */
const euro = (v: number) => `€${v}M`;
const suffix = (unit: string) => (v: number) => `${v}${unit}`;
const outfield = (p: Player) => p.position !== "GK";
const all = () => true;

/**
 * `eligible`은 정답이 뻔해지는 조합을 출제에서 제외한다.
 * (자유이적 €0, 골키퍼의 통산 골 0 등은 비교 자체가 성립하지 않는다)
 */
export const STATS = {
  marketValue: {
    label: "시장가치",
    format: euro,
    get: (p: Player) => p.marketValue,
    eligible: all,
  },
  transferFee: {
    label: "최고 이적료",
    format: euro,
    get: (p: Player) => p.transferFee,
    eligible: (p: Player) => p.transferFee > 0,
  },
  weeklyWage: {
    label: "주급",
    format: (v: number) => `£${v}k`,
    get: (p: Player) => p.weeklyWage,
    eligible: (p: Player) => p.weeklyWage > 0,
  },
  plGoals: {
    label: "PL 통산 골",
    format: suffix("골"),
    get: (p: Player) => p.plGoals,
    eligible: (p: Player) => outfield(p) && p.plGoals > 0,
  },
  plApps: {
    label: "PL 통산 출전",
    format: suffix("경기"),
    get: (p: Player) => p.plApps,
    eligible: all,
  },
  seasonGoals: {
    label: "한 시즌 최다 골",
    format: suffix("골"),
    get: (p: Player) => p.bestSeason.goals,
    eligible: (p: Player) => outfield(p) && p.bestSeason.goals > 0,
  },
  seasonAssists: {
    label: "한 시즌 최다 도움",
    format: suffix("도움"),
    get: (p: Player) => p.bestSeason.assists,
    eligible: (p: Player) => outfield(p) && p.bestSeason.assists > 0,
  },
} as const;

export type StatKey = keyof typeof STATS;
export const STAT_KEYS = Object.keys(STATS) as StatKey[];

/** YYYY-MM-DD 로컬 날짜 문자열 */
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 문자열 → 32bit 정수 (FNV-1a) */
export function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface Round {
  left: Player;
  right: Player;
  stat: StatKey;
}

/**
 * 라운드 구성. 같은 seed·round면 항상 같은 문제가 나온다.
 * 값이 같으면(무승부) 다음 후보로 밀어 정답이 애매한 라운드를 만들지 않는다.
 */
export function buildRound(players: Player[], seed: string, round: number): Round {
  const stat = STAT_KEYS[round % STAT_KEYS.length];
  const { get, eligible } = STATS[stat];
  const pool = players.filter(eligible);
  const a = pool[hash(`${seed}:L:${round}`) % pool.length];
  const start = hash(`${seed}:R:${round}`) % pool.length;

  for (let n = 0; n < pool.length; n++) {
    const b = pool[(start + n) % pool.length];
    if (b.id !== a.id && get(b) !== get(a)) return { left: a, right: b, stat };
  }
  // 모든 선수 값이 같은 극단적 데이터셋 방어
  const fallback = pool[(pool.indexOf(a) + 1) % pool.length];
  return { left: a, right: fallback, stat };
}

/** 오른쪽이 더 큰가? */
export function isHigher(round: Round): boolean {
  const get = STATS[round.stat].get;
  return get(round.right) > get(round.left);
}

/** 결과 공유 텍스트 */
export function shareText(streak: number, best: number, dateKey = todayKey()): string {
  const flames = "🔥".repeat(Math.min(Math.max(Math.floor(streak / 5), 1), 5));
  return `EPL UP&DOWN ${dateKey}\n${streak}연속 정답 ${flames}\n오늘 최고 ${best}연속`;
}
