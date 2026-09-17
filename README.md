# ⚽ EPL QUIZ

프리미어리그 팬을 위한 반응형 축구 퀴즈 웹앱. 4가지 모드, 매일 바뀌는 정답, 이모지 결과 공유.

> MVP 단계 — 데이터는 로컬 JSON(Mock)이며 백엔드 없이 바로 실행됩니다.

## 퀴즈 모드

| 모드 | 경로 | 설명 |
| --- | --- | --- |
| **EPL Wordle** | `/wordle` | 소속팀·국적·포지션·등번호·나이 5속성을 비교해 6번 안에 선수 맞히기. 🟩 일치 / 🟨 같은 계열·근접 / 🟥 불일치, 숫자는 ▲▼ 힌트 |
| **Goltexto** | `/goltexto` | 아무 선수나 입력하면 정답과의 연관도(%)와 근거를 알려주는 무제한 추리 모드 |
| **커리어 경로** | `/career` | 거쳐간 클럽을 하나씩 열며 추리. 적게 열고 맞힐수록 고득점(최대 100점) |
| **이적료 업&다운** | `/updown` | 두 선수의 이적료·주급·최고 시즌 골/어시스트 비교. 연속 정답 기록 |

## 주요 기능

- **Daily Challenge** — 날짜+모드를 시드로 한 해시(FNV-1a)로 정답을 고정. 같은 날 접속한 모두가 같은 문제를 풉니다.
- **결과 공유** — Wordle 결과를 `🟩🟥🟨🔽` 이모지 격자로 클립보드에 복사 (정답 이름은 숨김).
- **선수 자동완성** — 이름 부분 일치 검색, 앞부분 일치 우선 정렬.
- **모바일 우선** — 넉넉한 터치 타깃, 375px 기준 레이아웃, EPL 시그니처 컬러(`#38003c`) 테마.

## 기술 스택

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide Icons

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
node scripts/check-players.mjs   # 데이터셋 + 퀴즈 로직 자체 점검
```

## 프로젝트 구조

```
src/
  app/                  # 라우트 (/, /wordle, /goltexto, /career, /updown)
  components/
    EplHeader.tsx       # 공통 헤더
    PlayerSearch.tsx    # 선수 자동완성 입력
    ResultModal.tsx     # 결과 모달 + 클립보드 공유
    quiz/               # 4개 모드 컴포넌트
  lib/
    quiz.ts             # 순수 로직: 판정·연관도·점수·일일 시드
    players.ts          # 데이터 로딩 + 편의 함수
  data/
    epl_players.json    # 선수 46명 (현역 + 레전드)
scripts/
  check-players.mjs     # assert 기반 자체 점검
```

## 데이터 스키마

```jsonc
{
  "id": "salah",
  "name": "Mohamed Salah",
  "nationality": "Egypt",
  "team": "Liverpool",
  "position": "FW",            // GK | DF | MF | FW
  "number": 11,
  "age": 33,
  "transferFee": 42,           // 최고 이적료, €M
  "weeklyWage": 350,           // 주급, £k
  "careerClubs": ["El Mokawloon", "Basel", "Chelsea", "Fiorentina", "Roma", "Liverpool"],
  "bestSeason": { "season": "2017-18", "goals": 32, "assists": 10 }
}
```

선수 데이터는 공개된 프로필 정보 기반의 **근사치**이며 퀴즈용입니다. 정확한 기록은 공식 출처를 확인하세요.

## 백엔드 교체

`src/lib/players.ts` 한 파일만 Supabase 등 원격 조회로 바꾸면 됩니다. 퀴즈 로직(`src/lib/quiz.ts`)은 데이터 소스와 무관한 순수 함수입니다.

## 로드맵

- [ ] 클럽 로고 이미지 / 커리어 타임라인 시각 강화
- [ ] 로컬 스토리지 기반 기록·연속 출석
- [ ] Supabase 연동 및 글로벌 리더보드

## 라이선스

[MIT](./LICENSE)
