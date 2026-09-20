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
  /** 이번 라운드부터 새 스탯 — 사슬이 여기서 끊기고 기준이 새로 잡힌다 */
  isStatChange: boolean;
}

/** 한 스탯으로 이어서 푸는 라운드 수. 이 단위로 사슬이 끊기고 스탯이 바뀐다. */
export const BLOCK_SIZE = 5;

export function statForRound(round: number): StatKey {
  return STAT_KEYS[Math.floor(round / BLOCK_SIZE) % STAT_KEYS.length];
}

/**
 * 난이도 구간. 기준값 대비 배율이며, 가중치만큼 섞여 나온다.
 * 전부 좁게 잡으면 찍기 게임이 되고, 넓게만 잡으면 뻔해진다.
 */
const BANDS: { min: number; max: number; weight: number }[] = [
  { min: 1.12, max: 1.6, weight: 3 }, // 팽팽
  { min: 1.6, max: 2.8, weight: 5 }, // 보통
  { min: 2.8, max: 6, weight: 2 }, // 여유
];
const TOTAL_WEIGHT = BANDS.reduce((sum, b) => sum + b.weight, 0);

function bandFor(seed: string) {
  let roll = hash(`${seed}:band`) % TOTAL_WEIGHT;
  for (const band of BANDS) {
    if (roll < band.weight) return band;
    roll -= band.weight;
  }
  return BANDS[BANDS.length - 1];
}

/**
 * 기준 선수와 견줄 만한 상대를 고른다.
 * 뽑힌 난이도 구간 안에서 먼저 찾고, 후보가 모자라면 구간을 넓힌다.
 */
function pickChallenger(
  pool: Player[],
  anchor: Player,
  get: (p: Player) => number,
  seed: string,
  used: Set<string>,
): Player | null {
  const anchorValue = get(anchor);
  const candidates = pool.filter((p) => !used.has(p.id) && get(p) !== anchorValue);
  if (candidates.length === 0) return null;

  const ratio = (p: Player) => {
    const v = get(p);
    return v > anchorValue ? v / anchorValue : anchorValue / v;
  };
  const band = bandFor(seed);
  const attempts = [
    (p: Player) => ratio(p) >= band.min && ratio(p) <= band.max,
    (p: Player) => ratio(p) >= band.min, // 위쪽으로 넓히기
    (p: Player) => ratio(p) >= 1.12, // 거의 동급인 찍기 라운드만 제외
  ];

  for (const matches of attempts) {
    const near = candidates.filter(matches);
    if (near.length >= 3) return near[hash(seed) % near.length];
  }
  return candidates[hash(seed) % candidates.length];
}

/**
 * 라운드 구성. 같은 seed·round면 항상 같은 문제가 나온다.
 *
 * 맞힌 오른쪽 카드가 다음 라운드의 기준(왼쪽)이 되는 사슬 구조이며,
 * BLOCK_SIZE 라운드마다 스탯이 바뀌면서 사슬이 새로 시작된다.
 * 한 블록 안에서는 같은 선수가 두 번 나오지 않는다.
 */
export function buildRound(players: Player[], seed: string, round: number): Round {
  const stat = statForRound(round);
  const { get, eligible } = STATS[stat];
  const pool = players.filter(eligible);
  const block = Math.floor(round / BLOCK_SIZE);
  const step = round % BLOCK_SIZE;
  const isStatChange = step === 0 && round > 0;

  let left = pool[hash(`${seed}:anchor:${block}`) % pool.length];
  let right = left;
  const used = new Set([left.id]);

  // 블록 시작부터 현재 라운드까지 사슬을 다시 만든다 (최대 BLOCK_SIZE회)
  for (let i = 0; i <= step; i++) {
    const next = pickChallenger(pool, left, get, `${seed}:${block}:${i}`, used);
    if (!next) break;
    used.add(next.id);
    if (i === step) {
      right = next;
      break;
    }
    left = next;
  }

  return { left, right, stat, isStatChange };
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
