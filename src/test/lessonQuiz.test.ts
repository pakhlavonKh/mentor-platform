import { describe, it, expect } from "vitest";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

interface LearningTest {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

function gradeQuiz(test: LearningTest, answers: Record<string, number>) {
  const total = test.questions.length;
  if (total === 0) {
    return { score: 100, passed: true, correctCount: 0, total: 0 };
  }

  let correctCount = 0;
  test.questions.forEach((q) => {
    if (answers[q.id] === q.correctOptionIndex) {
      correctCount += 1;
    }
  });

  const score = Math.round((correctCount / total) * 100);
  const passed = score >= (test.passingScore ?? 70);

  return {
    score,
    passed,
    correctCount,
    total,
  };
}

function canAdvanceToNextLesson(
  test: LearningTest | null | undefined,
  testResult: { score: number; passed: boolean } | null | undefined
): boolean {
  // If no test configured or no questions in test, tests are optional -> allowed to advance
  const hasTest = Boolean(test && test.questions && test.questions.length > 0);
  if (!hasTest) return true;

  // If test exists, must have passed
  return Boolean(testResult?.passed);
}

function validateTestBeforeSave(test: {
  title: string;
  questions: { question: string; options: string[]; correctOptionIndex: number }[];
}): { valid: boolean; error?: string } {
  if (!test.title.trim()) return { valid: false, error: "Title is required" };
  if (!test.questions.length) return { valid: false, error: "At least one question is required" };

  for (let i = 0; i < test.questions.length; i++) {
    const q = test.questions[i];
    if (!q.question.trim()) {
      return { valid: false, error: `Question ${i + 1} prompt is required` };
    }
    const filledOptions = q.options.filter((o) => o.trim().length > 0);
    if (filledOptions.length < 2) {
      return { valid: false, error: `Question ${i + 1} must have at least 2 options` };
    }
    if (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
      return { valid: false, error: `Question ${i + 1} has invalid correct option index` };
    }
  }

  return { valid: true };
}

describe("Lesson Assessment & Optional Test Logic", () => {
  const sampleTest: LearningTest = {
    id: "test-1",
    title: "SAT Reading Comprehension Quiz",
    passingScore: 70,
    questions: [
      {
        id: "q1",
        question: "What is the primary thesis of the text?",
        options: ["Introduction of theory", "Critique of historical methods", "Summary of conclusions", "Personal anecdote"],
        correctOptionIndex: 1,
      },
      {
        id: "q2",
        question: "Which literary device is employed in paragraph 3?",
        options: ["Hyperbole", "Metaphor", "Alliteration", "Irony"],
        correctOptionIndex: 3,
      },
      {
        id: "q3",
        question: "According to lines 45-50, what caused the shift?",
        options: ["Technological change", "Policy change", "Geographic expansion", "Economic decline"],
        correctOptionIndex: 0,
      },
    ],
  };

  it("accurately calculates score and passes student meeting threshold", () => {
    // 3 out of 3 = 100%
    const perfectResult = gradeQuiz(sampleTest, {
      q1: 1,
      q2: 3,
      q3: 0,
    });
    expect(perfectResult.score).toBe(100);
    expect(perfectResult.passed).toBe(true);
    expect(perfectResult.correctCount).toBe(3);

    // 2 out of 3 = 67% (passing threshold is 70%, so fails)
    const partialResult = gradeQuiz(sampleTest, {
      q1: 1,
      q2: 3,
      q3: 1, // wrong
    });
    expect(partialResult.score).toBe(67);
    expect(partialResult.passed).toBe(false);
    expect(partialResult.correctCount).toBe(2);
  });

  it("passes student if score meets or exceeds custom passing score", () => {
    const lenientTest: LearningTest = {
      ...sampleTest,
      passingScore: 60,
    };

    // 2 out of 3 = 67% >= 60% -> passed!
    const result = gradeQuiz(lenientTest, {
      q1: 1,
      q2: 3,
      q3: 2, // wrong
    });
    expect(result.score).toBe(67);
    expect(result.passed).toBe(true);
  });

  it("allows advancing when tests are optional (no test created for lesson)", () => {
    // Lesson without any test
    expect(canAdvanceToNextLesson(null, null)).toBe(true);
    expect(canAdvanceToNextLesson(undefined, null)).toBe(true);

    // Lesson with empty questions list
    const emptyTest: LearningTest = {
      id: "empty",
      title: "Empty Test",
      passingScore: 70,
      questions: [],
    };
    expect(canAdvanceToNextLesson(emptyTest, null)).toBe(true);
  });

  it("enforces test passing when a test is attached to a lesson", () => {
    // Student has not taken test yet
    expect(canAdvanceToNextLesson(sampleTest, null)).toBe(false);

    // Student took test but failed
    expect(canAdvanceToNextLesson(sampleTest, { score: 33, passed: false })).toBe(false);

    // Student took test and passed
    expect(canAdvanceToNextLesson(sampleTest, { score: 100, passed: true })).toBe(true);
  });

  it("validates test builder configuration before saving", () => {
    // Missing title
    expect(validateTestBeforeSave({ title: "", questions: [] }).valid).toBe(false);

    // Missing questions
    expect(validateTestBeforeSave({ title: "Valid Title", questions: [] }).valid).toBe(false);

    // Question missing prompt
    expect(
      validateTestBeforeSave({
        title: "Valid Title",
        questions: [{ question: "", options: ["A", "B"], correctOptionIndex: 0 }],
      }).valid
    ).toBe(false);

    // Question with fewer than 2 non-empty options
    expect(
      validateTestBeforeSave({
        title: "Valid Title",
        questions: [{ question: "Valid Prompt?", options: ["Only One", ""], correctOptionIndex: 0 }],
      }).valid
    ).toBe(false);

    // Valid test
    expect(
      validateTestBeforeSave({
        title: "Valid Title",
        questions: [{ question: "Valid Prompt?", options: ["Option A", "Option B"], correctOptionIndex: 1 }],
      }).valid
    ).toBe(true);
  });
});
