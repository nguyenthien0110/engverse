"use client";

import { useParams } from "next/navigation";
import { useSentences } from "@/lib/hooks";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function TopicDetail() {
  const { topicId } = useParams<{ topicId: string }>();
  const { sentences, createSentence, deleteSentence } = useSentences(topicId);

  const [eng, setEng] = useState("");
  const [vie, setVie] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!eng || !vie) return;
    await createSentence({
      topicId,
      english: eng,
      vietnamese: vie,
    });
    setEng("");
    setVie("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteSentence(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-semibold mb-4">Sentences</h2>

        <div className="grid md:grid-cols-2 gap-2 mb-4">
          <input
            value={eng}
            onChange={(e) => setEng(e.target.value)}
            placeholder="English"
            className="border rounded-lg px-4 py-2"
          />
          <input
            value={vie}
            onChange={(e) => setVie(e.target.value)}
            placeholder="Vietnamese"
            className="border rounded-lg px-4 py-2"
          />
        </div>

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Sentence
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {sentences?.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="font-semibold">{s.english}</p>
            <p className="text-gray-500">{s.vietnamese}</p>
            <button
              onClick={() => setDeleteId(s.id)}
              className="text-red-500 text-sm mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Sentence?"
        description="This sentence will be permanently removed."
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
