import { describe, it, expect } from "vitest";
import {
  computeTemaPerf,
  computeHubStats,
  formatTime,
  secondsToHumanShort,
  scoreColorClass,
} from "./simuladoUtils";
import type { SimuladoSession } from "@/types";

const makeSession = (overrides: Partial<SimuladoSession> = {}): SimuladoSession => ({
  id: "s1",
  userId: "u1",
  disciplina: "Clínica",
  questionIds: [1, 2],
  answers: {},
  score: 70,
  correct: 7,
  wrong: 2,
  blank: 1,
  timeUsedSec: 1800,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("computeTemaPerf", () => {
  it("returns empty array for no questions", () => {
    expect(computeTemaPerf([], {})).toEqual([]);
  });

  it("counts correct answers per tema", () => {
    const questions = [
      { dbId: 1, tema: "Cardio", correta: "A" },
      { dbId: 2, tema: "Cardio", correta: "B" },
      { dbId: 3, tema: "Pneumo", correta: "C" },
    ];
    const answers = { "1": "A", "2": "A", "3": "C" }; // Cardio: 1/2, Pneumo: 1/1
    const result = computeTemaPerf(questions, answers);
    const cardio = result.find((t) => t.tema === "Cardio")!;
    const pneumo = result.find((t) => t.tema === "Pneumo")!;
    expect(cardio.correct).toBe(1);
    expect(cardio.total).toBe(2);
    expect(cardio.pct).toBe(50);
    expect(pneumo.pct).toBe(100);
  });

  it("sorts worst first (ascending pct)", () => {
    const questions = [
      { dbId: 1, tema: "A", correta: "X" },
      { dbId: 2, tema: "B", correta: "X" },
    ];
    const answers = { "1": "X", "2": "Y" }; // A=100%, B=0%
    const [first] = computeTemaPerf(questions, answers);
    expect(first.tema).toBe("B"); // worst first
  });

  it("counts blank answers as wrong", () => {
    const questions = [{ dbId: 1, tema: "A", correta: "X" }];
    const result = computeTemaPerf(questions, {}); // no answer
    expect(result[0].correct).toBe(0);
    expect(result[0].pct).toBe(0);
  });
});

describe("computeHubStats", () => {
  it("returns zeros for empty sessions", () => {
    expect(computeHubStats([])).toEqual({
      total: 0,
      avgScore: 0,
      evolution: 0,
      totalQuestions: 0,
    });
  });

  it("sums total questions across sessions", () => {
    const sessions = [
      makeSession({ questionIds: [1, 2, 3] }),
      makeSession({ questionIds: [4, 5] }),
    ];
    expect(computeHubStats(sessions).totalQuestions).toBe(5);
  });

  it("computes average score", () => {
    const sessions = [
      makeSession({ score: 60 }),
      makeSession({ score: 80 }),
    ];
    expect(computeHubStats(sessions).avgScore).toBe(70);
  });
});

describe("formatTime", () => {
  it("formats seconds to HH:MM:SS", () => {
    expect(formatTime(3661)).toBe("01:01:01");
    expect(formatTime(0)).toBe("00:00:00");
    expect(formatTime(90)).toBe("00:01:30");
  });
});

describe("secondsToHumanShort", () => {
  it("shows minutes only when under 1 hour", () => {
    expect(secondsToHumanShort(45 * 60)).toBe("45min");
  });
  it("shows hours and minutes", () => {
    expect(secondsToHumanShort(90 * 60)).toBe("1h30min");
  });
  it("shows hours only when minutes are zero", () => {
    expect(secondsToHumanShort(60 * 60)).toBe("1h");
  });
});

describe("scoreColorClass", () => {
  it("returns success for ≥70", () => {
    expect(scoreColorClass(70)).toBe("text-success");
    expect(scoreColorClass(100)).toBe("text-success");
  });
  it("returns warning for 50–69", () => {
    expect(scoreColorClass(50)).toBe("text-warning");
    expect(scoreColorClass(69)).toBe("text-warning");
  });
  it("returns destructive for <50", () => {
    expect(scoreColorClass(49)).toBe("text-destructive");
    expect(scoreColorClass(0)).toBe("text-destructive");
  });
});
