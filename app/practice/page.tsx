"use client";

import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

type Direction = "vi-en" | "en-vi" | "random";
type Mode = "topic" | "all";

export default function PracticePage() {
  const topics = useLiveQuery(() => db.topics.toArray(), []);
  const sentences = useLiveQuery(() => db.sentences.toArray(), []);

  const topicList = topics ?? [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sentenceList = sentences ?? [];

  const [mode, setMode] = useState<Mode>("topic");
  const [direction, setDirection] = useState<Direction>("vi-en");
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [randomDirection, setRandomDirection] = useState<Direction>("vi-en");

  const [manualTopicId, setManualTopicId] = useState<string | null>(null);

  const selectedTopicId = manualTopicId ?? topicList[0]?.id ?? "";

  // ✅ dùng sentenceList thay vì sentences trực tiếp
  const filteredSentences = useMemo(() => {
    if (mode === "all") return sentenceList;

    return sentenceList.filter((s) => s.topicId === selectedTopicId);
  }, [mode, sentenceList, selectedTopicId]);

  const currentSentence = filteredSentences[currentIndex];

  const getDirection = () => {
    if (direction === "random") return randomDirection;
    return direction;
  };

  const normalize = (text: string) =>
    text.trim().toLowerCase().replace(/\s+/g, " ");

  const handleStart = () => {
    if (filteredSentences.length === 0) return;

    setStarted(true);
    setCurrentIndex(0);
    setAnswer("");
    setResult(null);

    if (direction === "random") {
      setRandomDirection(Math.random() > 0.5 ? "vi-en" : "en-vi");
    }
  };

  const handleCheck = () => {
    if (!currentSentence) return;

    const correct =
      getDirection() === "vi-en"
        ? currentSentence.english
        : currentSentence.vietnamese;

    if (normalize(answer) === normalize(correct)) {
      setResult("correct");
    } else {
      setResult("wrong");
    }
  };

  const handleNext = () => {
    if (filteredSentences.length === 0) return;

    setAnswer("");
    setResult(null);

    const next =
      currentIndex + 1 >= filteredSentences.length ? 0 : currentIndex + 1;

    setCurrentIndex(next);

    if (direction === "random") {
      setRandomDirection(Math.random() > 0.5 ? "vi-en" : "en-vi");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-none border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-bold">Practice</h1>
      </div>

      {!started ? (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-xl space-y-6">
            {/* Mode */}
            <div className="space-y-2">
              <label className="font-medium">Mode</label>
              <select
                className="w-full border rounded-lg p-2"
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
              >
                <option value="topic">Practice by Topic</option>
                <option value="all">Practice All Topics</option>
              </select>
            </div>

            {/* Topic Select */}
            {mode === "topic" && (
              <div className="space-y-2">
                <label className="font-medium">Topic</label>

                {topicList.length === 0 ? (
                  <p className="text-sm text-gray-500">No topics available</p>
                ) : (
                  <select
                    className="w-full border rounded-lg p-2"
                    value={selectedTopicId}
                    onChange={(e) => setManualTopicId(e.target.value)}
                  >
                    {topicList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Direction */}
            <div className="space-y-2">
              <label className="font-medium">Direction</label>
              <select
                className="w-full border rounded-lg p-2"
                value={direction}
                onChange={(e) => setDirection(e.target.value as Direction)}
              >
                <option value="vi-en">Vietnamese → English</option>
                <option value="en-vi">English → Vietnamese</option>
                <option value="random">Random</option>
              </select>
            </div>

            <button
              onClick={handleStart}
              disabled={filteredSentences.length === 0}
              className="w-full bg-black text-white py-2 rounded-lg disabled:bg-gray-400"
            >
              Start Practice
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-sm text-gray-500">
              {currentIndex + 1} / {filteredSentences.length}
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-lg font-medium">
                {getDirection() === "vi-en"
                  ? currentSentence?.vietnamese
                  : currentSentence?.english}
              </p>
            </div>

            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Your answer..."
            />

            <div className="flex gap-3">
              <button
                onClick={handleCheck}
                className="flex-1 bg-black text-white py-2 rounded-lg"
              >
                Check
              </button>

              <button
                onClick={handleNext}
                className="flex-1 border py-2 rounded-lg"
              >
                Next
              </button>
            </div>

            {result === "correct" && (
              <p className="text-green-600 font-medium">Correct!</p>
            )}

            {result === "wrong" && (
              <p className="text-red-600 font-medium">
                Correct answer:{" "}
                {getDirection() === "vi-en"
                  ? currentSentence?.english
                  : currentSentence?.vietnamese}
              </p>
            )}

            <button
              onClick={() => setStarted(false)}
              className="w-full text-sm text-gray-500 underline"
            >
              Back to setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
