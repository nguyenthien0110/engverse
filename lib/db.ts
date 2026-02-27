import Dexie, { Table } from "dexie";

export interface Topic {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface Sentence {
  id: string;
  topicId: string;
  english: string;
  vietnamese: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

class EngDB extends Dexie {
  topics!: Table<Topic>;
  sentences!: Table<Sentence>;

  constructor() {
    super("eng-learning-db");
    this.version(1).stores({
      topics: "id, name, createdAt",
      sentences: "id, topicId, createdAt, updatedAt",
    });
  }
}

export const db = new EngDB();
