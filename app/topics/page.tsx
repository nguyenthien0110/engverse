"use client";

import { useTopics } from "@/lib/hooks";
import { useState } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function TopicsPage() {
  const { topics, createTopic, deleteTopic } = useTopics();

  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name) return;
    await createTopic({ name });
    setName("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteTopic(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-semibold mb-4">Topics</h2>

        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1"
            placeholder="New topic..."
          />
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid md:grid-cols-3 gap-4 pr-2">
        {topics?.map((topic) => (
          <div
            key={topic.id}
            className="bg-white p-4 rounded-xl shadow-sm border"
          >
            <Link href={`/topics/${topic.id}`}>
              <h3 className="font-semibold hover:text-blue-600 cursor-pointer">
                {topic.name}
              </h3>
            </Link>

            <button
              onClick={() => setDeleteId(topic.id)}
              className="text-red-500 text-sm mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Topic?"
        description="All sentences inside this topic will also be deleted."
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
