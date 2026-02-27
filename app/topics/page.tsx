"use client";

import { useTopics } from "@/lib/hooks";
import { useState } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { db } from "@/lib/db";

export default function TopicsPage() {
  const { topics, createTopic, deleteTopic } = useTopics();

  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [openExport, setOpenExport] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createTopic({ name });
    setName("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteTopic(deleteId);
    setDeleteId(null);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleConfirmExport = async () => {
    if (selected.length === 0) return;

    const topicsData = await db.topics.where("id").anyOf(selected).toArray();

    const sentencesData = await db.sentences
      .where("topicId")
      .anyOf(selected)
      .toArray();

    const exportData = topicsData.map((topic) => ({
      name: topic.name,
      sentences: sentencesData
        .filter((s) => s.topicId === topic.id)
        .map((s) => ({
          english: s.english,
          vietnamese: s.vietnamese,
          note: s.note ?? "",
        })),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "engverse-topics.json";
    a.click();
    URL.revokeObjectURL(url);

    setOpenExport(false);
    setSelected([]);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data)) return;

    for (const topic of data) {
      const newTopicId = crypto.randomUUID();

      await db.topics.add({
        id: newTopicId,
        name: topic.name,
        createdAt: Date.now(),
      });

      if (Array.isArray(topic.sentences)) {
        const sentencesToAdd = topic.sentences.map((s: any) => ({
          id: crypto.randomUUID(),
          topicId: newTopicId,
          english: s.english,
          vietnamese: s.vietnamese,
          note: s.note ?? "",
        }));

        await db.sentences.bulkAdd(sentencesToAdd);
      }
    }

    location.reload();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-semibold mb-4">Topics</h2>

        <div className="flex gap-2 mb-4">
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

          <button
            onClick={() => setOpenExport(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Export
          </button>

          <label className="bg-gray-200 px-4 py-2 rounded-lg cursor-pointer">
            Import
            <input
              type="file"
              hidden
              accept=".json"
              onChange={(e) =>
                e.target.files && handleImport(e.target.files[0])
              }
            />
          </label>
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

      {openExport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] max-h-[500px] flex flex-col shadow-lg">
            <div className="p-4 border-b font-semibold text-lg">
              Select Topics to Export
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {topics?.map((topic) => (
                <label
                  key={topic.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(topic.id)}
                    onChange={() => toggleSelect(topic.id)}
                  />
                  <span>{topic.name}</span>
                </label>
              ))}
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  setOpenExport(false);
                  setSelected([]);
                }}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmExport}
                className="px-4 py-2 rounded-lg bg-green-600 text-white"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
