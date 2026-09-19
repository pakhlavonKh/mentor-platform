import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { api, type LearningTest, type TestSubmissionResult } from "@/lib/api";

interface LessonQuizProps {
  contentId: string;
  test: LearningTest;
  nextLessonId?: string | null;
  onCompleted?: () => void;
  previousResult?: { score: number; passed: boolean; completedAt: string } | null;
}

export function LessonQuiz({
  contentId,
  test,
  nextLessonId,
  onCompleted,
  previousResult,
}: LessonQuizProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const questions = test.questions || [];
  const passingScore = test.passingScore || 70;

  // State: "idle" (initial card), "taking" (answering questions), "result" (viewing score)
  const [quizState, setQuizState] = useState<"idle" | "taking" | "result">("idle");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<TestSubmissionResult | null>(null);

  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleStart = () => {
    setAnswers({});
    setCurrentQIndex(0);
    setSubmissionResult(null);
    setQuizState("taking");
  };

  const handleSubmit = async () => {
    // Check if any question was left unanswered
    const unansweredIndex = questions.findIndex((q) => answers[q.id] === undefined);
    if (unansweredIndex !== -1) {
      toast.error(`Please answer Question ${unansweredIndex + 1} before submitting`);
      setCurrentQIndex(unansweredIndex);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.learning.submitTest(contentId, answers);
      setSubmissionResult(res);
      setQuizState("result");
      if (res.passed) {
        toast.success(t("quiz.passedTitle"));
        if (onCompleted) onCompleted();
      } else {
        toast.error(t("quiz.failedTitle"));
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedNext = () => {
    if (nextLessonId) {
      navigate(`/learn/${nextLessonId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/learn");
    }
  };

  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  // View 1: Idle state (Initial overview or already passed card)
  if (quizState === "idle") {
    const hasPassed = previousResult?.passed;

    return (
      <Card className="border border-border/70 shadow-sm overflow-hidden bg-gradient-to-br from-card to-muted/20">
        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                  hasPassed
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {hasPassed ? <Award className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-lg text-foreground">
                    {test.title || t("quiz.knowledgeCheck")}
                  </h3>
                  <Badge
                    variant={hasPassed ? "default" : "outline"}
                    className={hasPassed ? "bg-emerald-600 text-white border-0 text-xs" : "text-xs"}
                  >
                    {hasPassed ? `✅ Passed (${previousResult?.score}%)` : t("quiz.optionalTest")}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {test.description || t("quiz.knowledgeCheckDesc")}
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                  <span>
                    • <strong>{questions.length}</strong> {t("quiz.question")}s
                  </span>
                  <span>
                    • {t("quiz.passingScore")}: <strong>{passingScore}%</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              {hasPassed ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStart}
                    className="text-xs gap-1.5 h-9"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("quiz.retakeTest")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleProceedNext}
                    className="gradient-primary text-primary-foreground text-xs gap-2 h-9 font-semibold shadow-sm"
                  >
                    {nextLessonId ? t("quiz.nextLesson") : t("quiz.backToLessons")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={handleStart}
                  className="gradient-primary text-primary-foreground text-xs gap-2 h-10 px-5 font-semibold shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("quiz.startTest")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // View 2: Taking Quiz Mode
  if (quizState === "taking") {
    const currentQ = questions[currentQIndex];
    const isLast = currentQIndex === questions.length - 1;

    return (
      <Card className="border border-border/80 shadow-md bg-card">
        <CardHeader className="p-5 sm:p-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground mt-0.5">
                {test.title || t("quiz.knowledgeCheck")}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-xs font-medium px-2 py-0.5">
              Pass: {passingScore}%
            </Badge>
          </div>
          {/* Progress bar */}
          <div className="pt-2">
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Current Question */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base sm:text-lg text-foreground leading-snug">
              {currentQ.question}
            </h4>

            {/* Answer Options */}
            <div className="grid gap-2.5">
              {currentQ.options.map((opt, optIndex) => {
                const isSelected = answers[currentQ.id] === optIndex;

                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, optIndex)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs ring-1 ring-primary/40"
                        : "border-border/70 hover:border-border/90 hover:bg-muted/30 bg-card"
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {optionLetters[optIndex] || optIndex + 1}
                    </span>
                    <span className="text-sm text-foreground font-medium flex-1 pt-0.5 leading-relaxed">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
              disabled={currentQIndex === 0}
              className="h-9 gap-1 text-xs"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            {/* Question Quick Jump Dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentQIndex;

                return (
                  <button
                    key={q.id || idx}
                    type="button"
                    onClick={() => setCurrentQIndex(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      isCurrent
                        ? "w-6 bg-primary"
                        : isAnswered
                        ? "w-2.5 bg-primary/40"
                        : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    title={`Question ${idx + 1}`}
                  />
                );
              })}
            </div>

            {isLast ? (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="gradient-primary text-primary-foreground font-semibold h-9 px-5 gap-2 text-xs shadow-sm"
              >
                {submitting ? t("quiz.submitting") : t("quiz.submitTest")}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setCurrentQIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="h-9 gap-1 text-xs"
              >
                {t("common.next") || "Next"} <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // View 3: Result Mode
  if (quizState === "result" && submissionResult) {
    const passed = submissionResult.passed;

    return (
      <Card
        className={`border shadow-md overflow-hidden ${
          passed ? "border-emerald-500/40 bg-card" : "border-amber-500/40 bg-card"
        }`}
      >
        <CardHeader
          className={`p-6 text-center border-b ${
            passed
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-amber-500/10 border-amber-500/20"
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <div
              className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-md ${
                passed ? "bg-emerald-600" : "bg-amber-500"
              }`}
            >
              {passed ? <Award className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              {passed ? t("quiz.passedTitle") : t("quiz.failedTitle")}
            </CardTitle>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {passed
                ? t("quiz.passedDesc", { score: submissionResult.score, required: passingScore })
                : t("quiz.failedDesc", { score: submissionResult.score, required: passingScore })}
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Badge
                className={`text-sm px-3 py-1 ${
                  passed
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30"
                }`}
              >
                {t("quiz.scoreBadge", {
                  score: submissionResult.score,
                  correct: submissionResult.correctCount,
                  total: submissionResult.totalQuestions,
                })}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-foreground">{t("quiz.answersReview")}</h4>
            <div className="space-y-3">
              {submissionResult.results.map((r, idx) => (
                <div
                  key={r.id || idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    r.isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-red-500/30 bg-red-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                      {r.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      {t("quiz.question")} {idx + 1}: {r.question}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${
                        r.isCorrect
                          ? "text-emerald-600 border-emerald-500/30"
                          : "text-red-500 border-red-500/30"
                      }`}
                    >
                      {r.isCorrect ? t("quiz.correct") : t("quiz.incorrect")}
                    </Badge>
                  </div>

                  {/* Explanation if available */}
                  {r.explanation && (
                    <p className="text-muted-foreground pt-1 pl-5 italic border-t border-border/30">
                      💡 {r.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleStart}
              className="gap-2 text-xs w-full sm:w-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("quiz.retakeTest")}
            </Button>

            {passed ? (
              <Button
                type="button"
                size="sm"
                onClick={handleProceedNext}
                className="text-xs gap-2 font-semibold shadow-sm w-full sm:w-auto gradient-primary text-primary-foreground"
              >
                {nextLessonId ? t("quiz.nextLesson") : t("quiz.backToLessons")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{t("quiz.scoreRequiredNotice", { score: passingScore })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
