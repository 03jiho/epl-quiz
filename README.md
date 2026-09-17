# ⚽ EPL UP&DOWN

두 프리미어리그 선수의 기록을 비교해 **더 높은지 / 더 낮은지** 맞히는 업다운 게임. 몇 연속까지 갈 수 있나?

**🔗 [https://epl-quiz.vercel.app](https://epl-quiz.vercel.app)**

## 규칙

왼쪽 선수의 값이 공개되고, 오른쪽 선수의 값은 가려져 있습니다. 오른쪽이 더 높은지 낮은지 고르면 됩니다. 하나라도 틀리면 종료, 연속 기록이 점수입니다.

비교 스탯은 라운드마다 돌아가며 출제됩니다.

| 스탯 | 단위 |
| --- | --- |
| 시장가치 | €M |
| 최고 이적료 | €M |
| 주급 | £k |
| PL 통산 골 | 골 |
| PL 통산 출전 | 경기 |
| 한 시즌 최다 골 | 골 |
| 한 시즌 최다 도움 | 도움 |

- **정답이 뻔한 조합은 출제되지 않습니다** — 자유이적(€0) 선수의 이적료 라운드, 골키퍼의 통산 골 라운드 등은 후보에서 제외.
- **무승부 없음** — 두 값이 같으면 다른 선수로 교체해 항상 정답이 존재합니다.
- **연속 기록**은 브라우저(localStorage)에만 저장되며, 결과 화면에서 이모지 텍스트로 복사해 공유할 수 있습니다.

## 선수 데이터

현역 프리미어리그 주축 선수 + 리그 레전드 **90명**. 2026년 여름 이적시장까지 반영했습니다.

정답이 뻔해지는 값(자유이적 €0, 무소속 선수의 주급 0, 골키퍼의 통산 골 등)은 해당 스탯 라운드에서 자동 제외됩니다.

```jsonc
{
  "id": "haaland",
  "name": "Erling Haaland",
  "team": "Manchester City",   // 은퇴 선수는 "레전드"
  "nationality": "Norway",
  "position": "FW",            // GK | DF | MF | FW
  "age": 25,
  "marketValue": 180,          // 현재(은퇴 선수는 전성기) 추정 시장가치, €M
  "transferFee": 60,           // 커리어 최고 이적료, €M
  "weeklyWage": 525,           // 주급, £k
  "plGoals": 105,              // PL 통산 골
  "plApps": 130,               // PL 통산 출전
  "bestSeason": { "season": "2022-23", "goals": 36, "assists": 8 }
}
```

> 수치는 공개 자료 기반의 **근사치**이며 게임용입니다. 정확한 기록은 공식 출처를 확인하세요.

## 기술 스택

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide Icons

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
node scripts/check-players.mjs   # 데이터셋 + 출제 로직 자체 점검
```

## 구조

```
src/
  app/page.tsx            # 게임 화면 (단일 페이지)
  components/
    EplHeader.tsx         # 헤더
    UpDownGame.tsx        # 게임 본체
    ResultModal.tsx       # 결과 모달 + 클립보드 공유
  lib/
    quiz.ts               # 순수 로직: 스탯 정의, 라운드 생성, 공유 텍스트
    players.ts            # 데이터 로딩
  data/epl_players.json   # 선수 90명
scripts/check-players.mjs # assert 기반 자체 점검
```

## 배포

Vercel CLI로 배포합니다 (Git 연동은 아직 없음).

```bash
npx vercel --prod
```

## 로드맵

- [ ] 선수 사진 / 클럽 로고
- [ ] 글로벌 리더보드 (Supabase)
- [ ] 일일 고정 시드 챌린지 (같은 문제로 전 세계 랭킹)

## 라이선스

[MIT](./LICENSE)
