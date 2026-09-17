// node scripts/check-players.mjs — 데이터셋 + 업다운 로직 자체 점검
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { STATS, STAT_KEYS, buildRound, isHigher, shareText, todayKey } from "../src/lib/quiz.ts";

const players = JSON.parse(readFileSync(new URL("../src/data/epl_players.json", import.meta.url)));

// 데이터셋 무결성
assert.ok(players.length >= 50, `선수 50명 이상 필요, 현재 ${players.length}`);
assert.equal(new Set(players.map((p) => p.id)).size, players.length, "id 중복");
assert.equal(new Set(players.map((p) => p.name)).size, players.length, "이름 중복");

for (const p of players) {
  assert.ok(p.name && p.team && p.nationality, `${p.id}: 기본 정보 누락`);
  assert.ok(["GK", "DF", "MF", "FW"].includes(p.position), `${p.id}: 잘못된 포지션`);
  assert.ok(p.age > 15 && p.age < 100, `${p.id}: 나이 범위`);
  for (const key of STAT_KEYS) {
    const v = STATS[key].get(p);
    assert.equal(typeof v, "number", `${p.id}: ${key} 숫자 아님`);
    assert.ok(v >= 0 && Number.isFinite(v), `${p.id}: ${key} 값 이상 (${v})`);
  }
  assert.ok(p.plGoals <= p.plApps, `${p.id}: 통산 골이 출전 수보다 많음`);
  assert.ok(p.bestSeason.goals <= 50 && p.bestSeason.assists <= 30, `${p.id}: 시즌 기록 과다`);
}

// 라운드 구성: 결정적이고, 항상 서로 다른 두 선수 + 무승부 없음
for (let r = 0; r < 200; r++) {
  const a = buildRound(players, "2026-09-17", r);
  const b = buildRound(players, "2026-09-17", r);
  assert.equal(a.left.id, b.left.id, `라운드 ${r}: 같은 시드인데 문제가 다름`);
  assert.equal(a.right.id, b.right.id, `라운드 ${r}: 같은 시드인데 문제가 다름`);
  assert.notEqual(a.left.id, a.right.id, `라운드 ${r}: 같은 선수끼리 비교`);
  const { get, eligible } = STATS[a.stat];
  assert.notEqual(get(a.left), get(a.right), `라운드 ${r}: 값이 같아 정답이 없음`);
  assert.equal(isHigher(a), get(a.right) > get(a.left));
  if (eligible) {
    // 자유이적(€0)이나 골키퍼의 통산 골처럼 정답이 뻔한 조합은 출제되면 안 된다
    assert.ok(eligible(a.left) && eligible(a.right), `라운드 ${r}: ${a.stat} 부적격 선수 출제`);
  }
}

// 시드가 다르면 문제도 달라진다
const runA = Array.from({ length: 20 }, (_, r) => buildRound(players, "seed-a", r).left.id).join();
const runB = Array.from({ length: 20 }, (_, r) => buildRound(players, "seed-b", r).left.id).join();
assert.notEqual(runA, runB, "시드가 달라도 같은 순서");

// 모든 스탯이 출제에 쓰인다
const used = new Set(Array.from({ length: 30 }, (_, r) => buildRound(players, "x", r).stat));
assert.equal(used.size, STAT_KEYS.length, `출제되지 않는 스탯 존재 (${[...used].join()})`);

// 공유 텍스트
const s = shareText(12, 20, "2026-09-17");
assert.ok(s.startsWith("EPL UP&DOWN 2026-09-17"), s);
assert.ok(s.includes("12연속") && s.includes("최고 20"), s);
assert.match(todayKey(), /^\d{4}-\d{2}-\d{2}$/);

// 출제 후보 안에 0이 섞이면 "무조건 더 높다"가 정답인 라운드가 생긴다
for (const key of STAT_KEYS) {
  const { get, eligible } = STATS[key];
  const zeros = players.filter(eligible).filter((p) => get(p) === 0);
  assert.equal(zeros.length, 0, `${key}: 값이 0인 후보 ${zeros.map((p) => p.name).join()}`);
}

console.log(`OK — ${players.length}명, ${STAT_KEYS.length}개 스탯, 200라운드 검증 통과`);
