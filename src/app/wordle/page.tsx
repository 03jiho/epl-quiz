import WordleQuiz from "@/components/quiz/WordleQuiz";
import { players, dailyPlayer, todayKey } from "@/lib/players";

export const revalidate = 3600;

export default function Page() {
  const dateKey = todayKey();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">EPL Wordle</h1>
      <WordleQuiz
        players={players}
        answer={dailyPlayer(players, "wordle", dateKey)}
        dateKey={dateKey}
      />
    </div>
  );
}
