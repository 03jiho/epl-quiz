// node scripts/check-players.mjs — 데이터셋 + 퀴즈 로직 자체 점검
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  searchPlayers,
  dailyPlayer,
  positionGroup,
  statOf,
  compareGuess,
  shareText,
  similarity,
  careerScore,
  pickPair,
} from "../src/lib/quiz.ts";

const players = JSON.parse(readFileSync(new URL("../src/data/epl_players.json", import.meta.url)));

// 데이터셋 무결성
assert.ok(players.length >= 30, `선수 30명 이상 필요, 현재 ${players.length}`);
assert.equal(new Set(players.map((p) => p.id)).size, players.length, "id 중복");
for (const p of players) {
  for (const k of ["id", "name", "nationality", "team", "position", "careerClubs", "bestSeason"]) {
    assert.ok(p[k] != null, `${p.id}: ${k} 누락`);
  }
  assert.ok(["GK", "DF", "MF", "FW"].includes(p.position), `${p.id}: 잘못된 포지션`);
  assert.ok(p.number >= 1 && p.number <= 99, `${p.id}: 등번호 범위`);
  assert.ok(p.age > 15 && p.age < 100, `${p.id}: 나이 범위`);
  assert.ok(p.careerClubs.length >= 1, `${p.id}: 커리어 클럽 없음`);
  assert.ok(
    p.careerClubs.includes(p.team) || p.team === "Retired",
    `${p.id}: 현 소속팀이 커리어에 없음`,
  );
  for (const key of Object.keys(statOf)) {
    assert.equal(typeof statOf[key](p), "number", `${p.id}: ${key} 숫자 아님`);
  }
}

// 자동완성
assert.equal(searchPlayers(players, "").length, 0, "빈 검색어는 결과 없음");
assert.equal(searchPlayers(players, "salah")[0].name, "Mohamed Salah");
assert.equal(searchPlayers(players, "SAL")[0].name, "Mohamed Salah", "대소문자 무시");
assert.ok(searchPlayers(players, "a", 5).length <= 5, "limit 적용");

// 일일 정답: 같은 날짜는 고정, 다른 날짜는 갈린다
assert.equal(
  dailyPlayer(players, "wordle", "2026-09-17").id,
  dailyPlayer(players, "wordle", "2026-09-17").id,
);
const spread = new Set(
  Array.from(
    { length: 60 },
    (_, i) => dailyPlayer(players, "wordle", `2026-09-${String(i + 1).padStart(2, "0")}`).id,
  ),
);
assert.ok(spread.size > 10, `일일 정답이 편중됨 (${spread.size}종)`);

// 포지션 그룹(노란색 판정)
assert.equal(positionGroup("FW"), positionGroup("MF"));
assert.notEqual(positionGroup("FW"), positionGroup("GK"));

// Wordle 판정
const byId = (id) => players.find((p) => p.id === id);
const salah = byId("salah");
const haaland = byId("haaland");
const alisson = byId("alisson");

const self = compareGuess(salah, salah);
assert.ok(
  self.every((c) => c.state === "hit"),
  "자기 자신은 전부 hit",
);
assert.ok(
  self.every((c) => c.dir === undefined),
  "일치하면 방향 표시 없음",
);

const vs = compareGuess(haaland, salah);
assert.equal(vs.find((c) => c.key === "team").state, "miss");
assert.equal(vs.find((c) => c.key === "position").state, "hit", "FW vs FW");
assert.equal(
  compareGuess(alisson, salah).find((c) => c.key === "position").state,
  "miss",
  "GK vs FW는 그룹도 다름",
);
assert.equal(
  compareGuess(byId("rodri"), salah).find((c) => c.key === "position").state,
  "near",
  "MF vs FW는 같은 그룹",
);
// 나이: 살라(33)를 하란드(25)로 추측 → 정답이 더 많다 = up
assert.equal(vs.find((c) => c.key === "age").dir, "up");

// 공유 텍스트
const share = shareText([compareGuess(haaland, salah), self], true, "2026-09-17");
assert.ok(share.startsWith("EPL Wordle 2026-09-17 2/6"), share);
assert.ok(share.includes("🟩🟩🟩🟩🟩"), "정답 줄은 전부 초록");
assert.ok(/[🔼🔽]/u.test(share), "숫자 힌트 방향 이모지 포함");
assert.ok(!share.includes(salah.name), "정답 이름은 공유 텍스트에 없음");

// 연관도: 자기 자신 > 같은 팀 > 무관
const same = similarity(byId("gakpo"), byId("vvd")).score; // 같은 팀 + 같은 국적
const other = similarity(alisson, byId("vieira")).score;
assert.ok(similarity(salah, salah).score > same, "자기 자신이 최고점");
assert.ok(same > other, `같은 팀/국적이 더 높아야 함 (${same} vs ${other})`);
assert.ok(similarity(salah, salah).percent <= 100, "퍼센트 상한");

// 커리어 점수: 적게 열수록 높고 0 미만 없음
assert.equal(careerScore(1, 0), 100);
assert.ok(careerScore(3, 1) < careerScore(1, 0));
assert.equal(careerScore(20, 20), 0);

// Up&Down 페어: 서로 다르고 값이 갈린다
for (const stat of Object.keys(statOf)) {
  for (let seed = 0; seed < 30; seed++) {
    const [a, b] = pickPair(players, stat, seed);
    assert.notEqual(a.id, b.id, `${stat}/${seed}: 같은 선수`);
    assert.notEqual(statOf[stat](a), statOf[stat](b), `${stat}/${seed}: 무승부`);
  }
}

console.log(`OK — ${players.length}명, 일일 정답 ${spread.size}종/60일, 4개 모드 로직 통과`);
