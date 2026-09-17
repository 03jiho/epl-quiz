import CareerQuiz from "@/components/quiz/CareerQuiz";
import { players, dailyPlayer, todayKey } from "@/lib/players";

export const revalidate = 3600;

export default function Page() {
  const dateKey = todayKey();
  // 클럽이 3곳 이상인 선수만 정답 후보 — 한 클럽만 뛴 선수는 퀴즈가 성립하지 않는다
  const pool = players.filter((p) => p.careerClubs.length >= 3);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">커리어 경로 추리</h1>
      <CareerQuiz
        players={players}
        answer={dailyPlayer(pool, "career", dateKey)}
        dateKey={dateKey}
      />
    </div>
  );
}
