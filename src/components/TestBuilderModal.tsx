import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import type { LearningContent, LearningTest, TestQuestion } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";

interface TestBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: LearningContent | null;
  onSave: (test: LearningTest | null) => Promise<void>;
}

export function TestBuilderModal({
  isOpen,
  onClose,
  content,
  onSave,
}: TestBuilderModalProps) {
  const { t } = useTranslation();
  const { lt } = useLocale();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState<number>(70);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize form whenever content changes or modal opens
  useEffect(() => {
    if (!isOpen || !content) return;

    if (content.test && content.test.questions && content.test.questions.length > 0) {
      setTitle(content.test.title || "");
      setDescription(content.test.description || "");
      setPassingScore(content.test.passingScore || 70);
      setQuestions(JSON.parse(JSON.stringify(content.test.questions)));
    } else {
      // Default new test with 1 blank question
      const lessonTitle = typeof content.title === "string" ? content.title : lt(content.title);
      setTitle(`${t("quiz.knowledgeCheck")}: ${lessonTitle}`);
      setDescription("");
      setPassingScore(70);
      setQuestions([
        {
          id: `q_${Date.now()}_1`,
          question: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0,
          explanation: "",
        },
      ]);
    }
  }, [isOpen, content, t, lt]);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${prev.length + 1}`,
        question: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.error(t("quiz.atLeastOneQuestion"));
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index].question = text;
      return copy;
    });
  };

  const handleExplanationChange = (index: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index].explanation = text;
      return copy;
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIndex].options];
      opts[optIndex] = text;
      copy[qIndex].options = opts;
      return copy;
    });
  };

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex].correctOptionIndex = optIndex;
      return copy;
    });
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIndex].options.length >= 6) {
        return prev;
      }
      copy[qIndex].options = [...copy[qIndex].options, ""];
      return copy;
    });
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIndex].options.length <= 2) {
        return prev;
      }
      const opts = copy[qIndex].options.filter((_, i) => i !== optIndex);
      copy[qIndex].options = opts;
      if (copy[qIndex].correctOptionIndex >= opts.length) {
        copy[qIndex].correctOptionIndex = 0;
      }
      return copy;
    });
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast.error(t("quiz.testTitle"));
      return;
    }

    if (questions.length === 0) {
      toast.error(t("quiz.atLeastOneQuestion"));
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`${t("quiz.question")} ${i + 1}: ${t("quiz.questionPlaceholder")}`);
        return;
      }
      const validOptions = q.options.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        toast.error(`${t("quiz.question")} ${i + 1}: ${t("quiz.options")}`);
        return;
      }
    }

    const testPayload: LearningTest = {
      title: title.trim(),
      description: description.trim(),
      passingScore: Number(passingScore) || 70,
      questions,
    };

    try {
      setSaving(true);
      await onSave(testPayload);
      toast.success(t("quiz.testSaved"));
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save test");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!confirm(t("quiz.confirmDeleteTest"))) {
      return;
    }
    try {
      setSaving(true);
      await onSave(null);
      toast.success(t("quiz.testDeleted"));
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete test");
    } finally {
      setSaving(false);
    }
  };

  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {t("quiz.testBuilder")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("quiz.testOptionalNotice")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* General Test Settings */}
          <div className="grid sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("quiz.testTitle")} <span className="text-destructive">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("quiz.titlePlaceholder")}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("quiz.passingScore")} <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={10}
                  max={100}
                  step={5}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="text-xs h-9"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("quiz.explanation")}
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("quiz.instructionsPlaceholder")}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <span>{t("quiz.questionsBadge", { count: questions.length })}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {t("quiz.multipleChoice")}
                </Badge>
              </h4>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddQuestion}
                className="h-8 gap-1.5 text-xs font-medium border-primary/30 text-primary hover:bg-primary/5"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("quiz.addQuestion")}
              </Button>
            </div>

            {questions.map((q, qIndex) => (
              <div
                key={q.id || qIndex}
                className="p-4 sm:p-5 rounded-xl border border-border/70 bg-card shadow-xs space-y-4 relative group"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {qIndex + 1}
                    </span>
                    <span className="font-semibold text-xs text-foreground">
                      {t("quiz.question")} {qIndex + 1}
                    </span>
                  </div>

                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                      title={t("quiz.removeQuestion")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {/* Question Text Prompt */}
                <div className="space-y-1">
                  <Textarea
                    rows={2}
                    value={q.question}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    placeholder={t("quiz.questionPlaceholder")}
                    className="text-xs leading-relaxed"
                  />
                </div>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {t("quiz.options")}
                  </span>

                  <div className="grid gap-2">
                    {q.options.map((opt, optIndex) => {
                      const isCorrect = q.correctOptionIndex === optIndex;

                      return (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border transition-all ${
                            isCorrect
                              ? "border-emerald-500/60 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-2xs"
                              : "border-border/60 bg-background hover:border-border/90"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetCorrectOption(qIndex, optIndex)}
                            className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-muted text-muted-foreground hover:bg-emerald-500/20 hover:text-emerald-600"
                            }`}
                            title={t("quiz.selectCorrect")}
                          >
                            {isCorrect ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              optionLetters[optIndex] || optIndex + 1
                            )}
                          </button>

                          <Input
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                            placeholder={t("quiz.optionPlaceholder", { letter: optionLetters[optIndex] || optIndex + 1 })}
                            className="h-8 text-xs flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent px-1"
                          />

                          {isCorrect && (
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px] px-2 py-0.5 shrink-0 hidden sm:inline-flex">
                              {t("quiz.correctAnswer")}
                            </Badge>
                          )}

                          {q.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(qIndex, optIndex)}
                              className="h-6 w-6 text-muted-foreground/60 hover:text-destructive shrink-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.options.length < 6 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddOption(qIndex)}
                      className="h-7 text-xs text-muted-foreground hover:text-primary gap-1 px-2"
                    >
                      <Plus className="h-3 w-3" /> {t("quiz.addOption")}
                    </Button>
                  )}
                </div>

                {/* Explanation */}
                <div className="pt-1">
                  <Input
                    value={q.explanation || ""}
                    onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                    placeholder={t("quiz.explanation")}
                    className="text-xs h-8 bg-muted/20 border-border/50"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddQuestion}
              className="w-full py-5 border-dashed border-2 gap-2 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("quiz.addQuestion")}
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {content?.test ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteTest}
              disabled={saving}
              className="gap-1.5 text-xs mr-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("quiz.deleteTest")}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? t("common.saving") || "Saving..." : t("quiz.saveTest")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
