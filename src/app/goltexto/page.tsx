import GoltextoQuiz from "@/components/quiz/GoltextoQuiz";
import { players, dailyPlayer, todayKey } from "@/lib/players";

export const revalidate = 3600;

export default function Page() {
  const dateKey = todayKey();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Goltexto</h1>
      <GoltextoQuiz
        players={players}
        answer={dailyPlayer(players, "goltexto", dateKey)}
        dateKey={dateKey}
      />
    </div>
  );
}
