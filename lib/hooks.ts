"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import { Topic, Sentence } from "./db";
import { v4 as uuid } from "uuid";

export function useTopics() {
  const topics = useLiveQuery(() => db.topics.toArray(), []);

  const createTopic = async (data: Omit<Topic, "id" | "createdAt">) => {
    await db.topics.add({
      id: uuid(),
      createdAt: Date.now(),
      ...data,
    });
  };

  const deleteTopic = async (id: string) => {
    await db.sentences.where("topicId").equals(id).delete();
    await db.topics.delete(id);
  };

  return { topics, createTopic, deleteTopic };
}

export function useSentences(topicId?: string) {
  const sentences = useLiveQuery(
    () =>
      topicId
        ? db.sentences.where("topicId").equals(topicId).toArray()
        : db.sentences.toArray(),
    [topicId],
  );

  const createSentence = async (
    data: Omit<Sentence, "id" | "createdAt" | "updatedAt">,
  ) => {
    await db.sentences.add({
      id: uuid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...data,
    });
  };

  const deleteSentence = async (id: string) => {
    await db.sentences.delete(id);
  };

  const updateSentence = async (id: string, data: Partial<Sentence>) => {
    await db.sentences.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  };

  return { sentences, createSentence, deleteSentence, updateSentence };
}
