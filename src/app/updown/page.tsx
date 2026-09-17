import UpDownQuiz from "@/components/quiz/UpDownQuiz";
import { players } from "@/lib/players";

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">이적료 &amp; 스탯 업&amp;다운</h1>
      <UpDownQuiz players={players} />
    </div>
  );
}
