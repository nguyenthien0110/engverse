"use client";
import { useTopics } from "@/lib/hooks";
import { useSentences } from "@/lib/hooks";

export default function Dashboard() {
  const { topics } = useTopics();
  const { sentences } = useSentences();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500">Total Topics</p>
          <p className="text-3xl font-bold">{topics?.length ?? 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-500">Total Sentences</p>
          <p className="text-3xl font-bold">{sentences?.length ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
