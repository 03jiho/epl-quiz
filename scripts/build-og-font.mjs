// node scripts/build-og-font.mjs
// OG 썸네일용 한글 서브셋 폰트를 Google Fonts에서 받아 src/app/fonts/에 저장한다.
// 썸네일에 새로운 한글을 쓰면 KOREAN에 글자를 추가하고 다시 실행할 것.
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const ASCII = Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCharCode(0x20 + i)).join(
  "",
);
const KOREAN =
  "프리미어리그 업다운 게임 더 높다 낮다 선수명 시장가치 이적료 주급 통산 기록 몇 연속까지 맞힐 수 있나요 비교하는 은는의";
const SYMBOLS = "€·▲▼—…";

const text = [...new Set(ASCII + KOREAN + SYMBOLS)].join("");
const dir = join(process.cwd(), "src/app/fonts");
// 구형 UA를 보내야 woff2 대신 Satori가 읽을 수 있는 TTF를 준다
const headers = { "User-Agent": "Mozilla/5.0" };

for (const [weight, file] of [
  [700, "NotoSansKR-Bold.ttf"],
  [900, "NotoSansKR-Black.ttf"],
]) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(text)}`,
    { headers },
  ).then((r) => r.text());
  const src = css.match(/url\((https:[^)]+)\)/)?.[1];
  if (!src) throw new Error(`${file}: 폰트 URL을 찾지 못함`);

  const buf = Buffer.from(await fetch(src, { headers }).then((r) => r.arrayBuffer()));
  if (buf.subarray(0, 4).toString("hex") !== "00010000") {
    throw new Error(`${file}: TTF가 아님 (Satori가 읽지 못함)`);
  }
  writeFileSync(join(dir, file), buf);
  console.log(`${file} — ${Math.round(buf.length / 1024)}KB`);
}

writeFileSync(join(dir, "subset-chars.txt"), text);
console.log(`글자 ${text.length}자 포함`);
