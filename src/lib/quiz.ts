export type Position = "GK" | "DF" | "MF" | "FW";

export interface Player {
  id: string;
  name: string;
  nationality: string;
  team: string;
  position: Position;
  number: number;
  age: number;
  /** 최고 이적료, 단위 €M */
  transferFee: number;
  /** 주급, 단위 £k */
  weeklyWage: number;
  /** 시간순 소속 클럽 */
  careerClubs: string[];
  bestSeason: { season: string; goals: number; assists: number };
}

export type QuizMode = "wordle" | "goltexto" | "career" | "updown";

/** Wordle 노란색(범주 일치) 판정용 포지션 그룹 */
export function positionGroup(p: Position): "ATT" | "DEF" {
  return p === "FW" || p === "MF" ? "ATT" : "DEF";
}

/** 이름 부분 일치 자동완성. 앞부분 일치 우선. */
export function searchPlayers(players: Player[], query: string, limit = 8): Player[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return players
    .filter((p) => p.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const ai = a.name.toLowerCase().indexOf(q);
      const bi = b.name.toLowerCase().indexOf(q);
      return ai - bi || a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

/** YYYY-MM-DD 로컬 날짜 문자열 */
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 문자열 → 32bit 정수 (FNV-1a). 날짜+모드 시드로 일일 정답을 고정. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** 같은 날짜·모드면 항상 같은 선수. 서버/클라이언트 동일 결과. */
export function dailyPlayer(players: Player[], mode: QuizMode, dateKey = todayKey()): Player {
  return players[hash(`${dateKey}:${mode}`) % players.length];
}

/** Up&Down 비교용 스탯 접근자 */
export const statOf = {
  transferFee: (p: Player) => p.transferFee,
  weeklyWage: (p: Player) => p.weeklyWage,
  goals: (p: Player) => p.bestSeason.goals,
  assists: (p: Player) => p.bestSeason.assists,
} as const;

export type StatKey = keyof typeof statOf;

export const STAT_LABEL: Record<StatKey, string> = {
  transferFee: "최고 이적료 (€M)",
  weeklyWage: "주급 (£k)",
  goals: "최고 시즌 골",
  assists: "최고 시즌 어시스트",
};

/* ── ① Wordle 판정 ───────────────────────────────────────── */

export type CellState = "hit" | "near" | "miss";
export interface Cell {
  key: "team" | "nationality" | "position" | "number" | "age";
  label: string;
  value: string;
  state: CellState;
  /** 숫자 속성에서 정답이 더 큰지(up) 작은지(down) */
  dir?: "up" | "down";
}

function numCell(
  key: Cell["key"],
  label: string,
  guess: number,
  answer: number,
  nearWithin: number,
): Cell {
  const diff = answer - guess;
  return {
    key,
    label,
    value: String(guess),
    state: diff === 0 ? "hit" : Math.abs(diff) <= nearWithin ? "near" : "miss",
    dir: diff === 0 ? undefined : diff > 0 ? "up" : "down",
  };
}

/** 추측 선수 1명 → 5개 속성 판정 */
export function compareGuess(guess: Player, answer: Player): Cell[] {
  return [
    {
      key: "team",
      label: "소속팀",
      value: guess.team,
      state: guess.team === answer.team ? "hit" : "miss",
    },
    {
      key: "nationality",
      label: "국적",
      value: guess.nationality,
      state: guess.nationality === answer.nationality ? "hit" : "miss",
    },
    {
      key: "position",
      label: "포지션",
      value: guess.position,
      state:
        guess.position === answer.position
          ? "hit"
          : positionGroup(guess.position) === positionGroup(answer.position)
            ? "near"
            : "miss",
    },
    numCell("number", "등번호", guess.number, answer.number, 3),
    numCell("age", "나이", guess.age, answer.age, 2),
  ];
}

export const MAX_TRIES = 6;

const EMOJI: Record<CellState, string> = { hit: "🟩", near: "🟨", miss: "🟥" };

/** 결과 공유용 이모지 텍스트 (정답 이름은 숨김) */
export function shareText(rows: Cell[][], solved: boolean, dateKey = todayKey()): string {
  const grid = rows
    .map((row) =>
      row
        .map((c) => EMOJI[c.state] + (c.state !== "hit" && c.dir ? (c.dir === "up" ? "🔼" : "🔽") : ""))
        .join(""),
    )
    .join("\n");
  return `EPL Wordle ${dateKey} ${solved ? rows.length : "X"}/${MAX_TRIES}\n${grid}`;
}

/* ── ② Goltexto 연관도 ───────────────────────────────────── */

export interface Similarity {
  score: number;
  /** 만점 대비 % */
  percent: number;
  reasons: string[];
}

const SAME_CLUB = 200;

/** 같은 팀 +1000, 국적 +500, 포지션 +300, 공유 커리어 클럽당 +200, 나이/등번호 근접 가산 */
export function similarity(guess: Player, answer: Player): Similarity {
  let score = 0;
  const reasons: string[] = [];

  if (guess.team === answer.team) {
    score += 1000;
    reasons.push(`같은 팀 (${guess.team})`);
  }
  if (guess.nationality === answer.nationality) {
    score += 500;
    reasons.push(`같은 국적 (${guess.nationality})`);
  }
  if (guess.position === answer.position) {
    score += 300;
    reasons.push(`같은 포지션 (${guess.position})`);
  } else if (positionGroup(guess.position) === positionGroup(answer.position)) {
    score += 100;
    reasons.push("비슷한 포지션");
  }

  const shared = guess.careerClubs.filter((c) => answer.careerClubs.includes(c));
  if (shared.length) {
    score += shared.length * SAME_CLUB;
    reasons.push(`거쳐간 클럽 ${shared.length}곳 일치 (${shared.join(", ")})`);
  }

  const ageGap = Math.abs(guess.age - answer.age);
  if (ageGap <= 3) {
    score += (4 - ageGap) * 50;
    reasons.push(`나이 ±${ageGap}`);
  }
  if (guess.number === answer.number) {
    score += 150;
    reasons.push(`같은 등번호 (${guess.number})`);
  }

  const max = 1000 + 500 + 300 + answer.careerClubs.length * SAME_CLUB + 200 + 150;
  return { score, percent: Math.round((score / max) * 100), reasons };
}

/* ── ③ 커리어 경로 점수 ──────────────────────────────────── */

/** 클럽을 적게 열수록, 적게 틀릴수록 고득점 (0~100) */
export function careerScore(revealed: number, wrongGuesses: number): number {
  return Math.max(0, 100 - (revealed - 1) * 15 - wrongGuesses * 10);
}

/* ── ④ Up & Down ────────────────────────────────────────── */

/** 시드로 두 명을 뽑는다. 값이 같으면 다음 후보로 밀어 무승부를 피한다. */
export function pickPair(players: Player[], stat: StatKey, seed: number): [Player, Player] {
  const a = players[hash(`pair-a:${seed}`) % players.length];
  let i = hash(`pair-b:${seed}`) % players.length;
  for (let n = 0; n < players.length; n++) {
    const b = players[(i + n) % players.length];
    if (b.id !== a.id && statOf[stat](b) !== statOf[stat](a)) return [a, b];
  }
  i = (players.indexOf(a) + 1) % players.length;
  return [a, players[i]];
}
