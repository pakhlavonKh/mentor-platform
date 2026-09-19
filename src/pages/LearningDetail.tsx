import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import {
  api,
  type LearningContent,
  type UserLearningProgress,
  downloadAuthenticatedFile,
} from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { DynamicDocumentViewer, type ViewerFileItem } from "@/components/DynamicDocumentViewer";
import { LessonQuiz } from "@/components/LessonQuiz";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Image as ImageIcon,
  Play,
  Download,
  Eye,
  UploadCloud,
  X,
  CheckCircle2,
  File,
  Lock,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
} from "lucide-react";

interface LearningFile {
  url: string;
  mimeType: string;
  name: string;
}

export default function LearningDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { lt } = useLocale();

  const [content, setContent] = useState<LearningContent | null>(null);
  const [allLessons, setAllLessons] = useState<LearningContent[]>([]);
  const [userProgress, setUserProgress] = useState<UserLearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Dynamic In-Browser Document Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFiles, setViewerFiles] = useState<ViewerFileItem[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerTitle, setViewerTitle] = useState("");

  const handleOpenViewer = (files: ViewerFileItem[], index = 0, title = "") => {
    setViewerFiles(files);
    setViewerIndex(index);
    setViewerTitle(title);
    setViewerOpen(true);
  };

  const fetchProgress = useCallback(async () => {
    try {
      const prog = await api.learning.getProgress();
      setUserProgress(prog);
    } catch {
      setUserProgress(null);
    }
  }, []);

  const fetchContentAndList = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [contentData, listData] = await Promise.all([
        api.learning.get(id),
        api.learning.list({ limit: "100" }),
      ]);
      setContent(contentData);
      setAllLessons(listData.data || []);
    } catch (err) {
      console.error(err);
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContentAndList();
    fetchProgress();
  }, [fetchContentAndList, fetchProgress]);

  if (!id) return <Navigate to="/learn" replace />;

  const currentIndex = allLessons.findIndex((l) => l.id === id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const hasTest = Boolean(content?.test && content.test.questions && content.test.questions.length > 0);
  const testResult = id && userProgress?.testResults ? userProgress.testResults[id] : null;
  const isTestPassed = Boolean(testResult?.passed);
  const isLessonCompleted = Boolean(
    (id && userProgress?.completedLessons?.includes(id)) ||
    content?.completed ||
    isTestPassed
  );
  const canAdvanceToNext = !hasTest || isTestPassed;

  const handleMarkComplete = async () => {
    if (!id) return;
    try {
      setMarkingComplete(true);
      await api.learning.markComplete(id);
      toast.success(t("quiz.lessonCompleted") || "Lesson completed!");
      fetchProgress();
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark as completed");
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name + f.size));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name + f.size));
      return [...prev, ...filtered];
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error(t("learning.selectFilesWarning"));
      return;
    }

    const form = new FormData();
    selectedFiles.forEach((f) => form.append("files", f));
    form.append("learningContentId", id as string);

    try {
      setSubmitting(true);
      await api.submissions.upload(form);
      toast.success(t("learning.uploadSuccess"));
      setSelectedFiles([]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || t("learning.uploadFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const renderLessonContent = () => {
    if (!content?.fileUrl) return null;

    const isVideo = content.mimeType?.startsWith("video");
    const isPdf = content.mimeType === "application/pdf";
    const isImage = content.mimeType?.startsWith("image");

    if (isVideo) {
      return (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            {t("learning.videoLesson")}
          </h2>
          <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-sm">
            <video controls className="w-full h-full bg-black">
              <source src={`http://localhost:5000${content.fileUrl}`} type={content.mimeType} />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t("learning.lessonDocument")}
          </h2>
          <iframe
            src={`http://localhost:5000${content.fileUrl}`}
            className="w-full h-96 border border-border rounded-xl shadow-sm"
            title={lt(content.title)}
          />
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <a href={`http://localhost:5000${content.fileUrl}`} target="_blank" rel="noopener noreferrer">
              {t("learning.openInNewTab")}
            </a>
          </Button>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            {t("learning.lessonImage")}
          </h2>
          <img
            src={`http://localhost:5000${content.fileUrl}`}
            alt={lt(content.title)}
            className="w-full max-h-96 object-contain rounded-xl border border-border shadow-sm"
          />
        </div>
      );
    }

    return null;
  };

  const renderFileItem = (file: LearningFile, index: number) => {
    const isPdf = file.mimeType === "application/pdf";
    const isImage = file.mimeType?.startsWith("image");

    const allFiles: ViewerFileItem[] = (content?.files || []).map((f) => ({
      url: f.url,
      originalName: f.name,
      mimeType: f.mimeType,
    }));

    return (
      <div
        key={file.url + index}
        className="flex items-center justify-between p-3 border border-border/80 rounded-xl hover:bg-muted/40 transition-colors"
      >
        <button
          type="button"
          onClick={() => handleOpenViewer(allFiles, index, lt(content!.title))}
          className="flex items-center gap-3 truncate text-left group"
        >
          {isPdf && <FileText className="h-5 w-5 text-red-500 shrink-0" />}
          {isImage && <ImageIcon className="h-5 w-5 text-blue-500 shrink-0" />}
          {!isPdf && !isImage && <FileText className="h-5 w-5 text-muted-foreground shrink-0" />}
          <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {file.name}
          </span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenViewer(allFiles, index, lt(content!.title))}
          >
            <Eye className="h-4 w-4 mr-1" />
            {t("learning.view")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await downloadAuthenticatedFile(file.url, file.name);
              } catch {
                toast.error("Download failed");
              }
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            {t("learning.download")}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-7">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t("common.loading") || "Loading…"}</p>
          </div>
        ) : !content ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{t("learning.noContentFound")}</p>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {lt(content.topic)}
                </Badge>
                {content.duration && (
                  <span className="text-xs text-muted-foreground">• {content.duration}</span>
                )}
                {isLessonCompleted && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs border-0 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("learning.completed")}
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                {lt(content.title)}
              </h1>
              <p className="text-muted-foreground">{lt(content.description)}</p>
            </div>

            {/* Main Lesson Content */}
            {renderLessonContent()}

            {/* Supporting Files */}
            {content.files && content.files.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  {t("learning.supportingMaterials")}
                </h2>
                <div className="space-y-2">
                  {content.files.map((file, idx) => renderFileItem(file, idx))}
                </div>
              </div>
            )}

            {/* Assessment & Lesson Progression Card */}
            <div className="pt-2">
              {hasTest && content.test ? (
                <LessonQuiz
                  contentId={content.id}
                  test={content.test}
                  nextLessonId={nextLesson?.id}
                  previousResult={testResult}
                  onCompleted={fetchProgress}
                />
              ) : (
                <div className="p-6 rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/20 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isLessonCompleted
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isLessonCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <BookOpen className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-lg text-foreground">
                            {isLessonCompleted
                              ? t("quiz.lessonCompleted")
                              : t("quiz.knowledgeCheck")}
                          </h3>
                          <Badge
                            variant={isLessonCompleted ? "default" : "outline"}
                            className={
                              isLessonCompleted
                                ? "bg-emerald-600 text-white text-xs border-0"
                                : "text-xs"
                            }
                          >
                            {isLessonCompleted
                              ? `✅ ${t("learning.completed")}`
                              : t("quiz.testOptionalNotice")}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                          {isLessonCompleted
                            ? t("quiz.completedNoticeDesc")
                            : t("quiz.noTestNoticeDesc")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                      {!isLessonCompleted && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleMarkComplete}
                          disabled={markingComplete}
                          className="text-xs gap-1.5 h-9"
                        >
                          <Check className="h-4 w-4" />
                          {markingComplete
                            ? t("common.saving") || "Saving..."
                            : t("quiz.markCompleteAndNext")}
                        </Button>
                      )}

                      {nextLesson ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            navigate(`/learn/${nextLesson.id}`);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="gradient-primary text-primary-foreground text-xs gap-2 h-9 font-semibold shadow-sm"
                        >
                          {t("quiz.nextLesson")}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => navigate("/learn")}
                          variant="outline"
                          className="text-xs gap-2 h-9"
                        >
                          {t("quiz.backToLessons")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border/60" />

            {/* Submission Form */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {t("learning.submitWork")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("learning.uploadPrompt")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFilesAdded(e.target.files)}
                  className="hidden"
                />

                {/* Custom Drag and Drop Area */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFilesAdded(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[0.99]"
                      : "border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/30"
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {t("learning.dragDropPrompt")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("learning.supportedFormats")}
                  </p>
                </div>

                {/* Selected Files Preview List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {selectedFiles.length} {t("learning.filesSelected")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-destructive hover:underline"
                      >
                        {t("common.cancel") || "Clear all"}
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={file.name + idx}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-card text-xs shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <File className="h-4 w-4 text-primary shrink-0" />
                            <span className="font-medium truncate text-foreground">
                              {file.name}
                            </span>
                            <span className="text-muted-foreground shrink-0">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            title="Remove file"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting || selectedFiles.length === 0}
                  className="gradient-primary text-primary-foreground font-medium rounded-lg px-6 h-10 shadow-sm"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      {t("learning.uploading")}
                    </span>
                  ) : (
                    t("learning.uploadSubmission")
                  )}
                </Button>
              </form>
            </div>

            {/* Bottom Lesson Navigation (Prev / Next) */}
            <div className="pt-6 border-t border-border/60 flex items-center justify-between gap-4">
              {prevLesson ? (
                <Link
                  to={`/learn/${prevLesson.id}`}
                  className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="truncate max-w-[160px] sm:max-w-[240px]">
                    {lt(prevLesson.title)}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                canAdvanceToNext ? (
                  <Link
                    to={`/learn/${nextLesson.id}`}
                    className="flex items-center gap-2 text-xs sm:text-sm font-medium text-primary hover:underline group ml-auto"
                  >
                    <span className="truncate max-w-[160px] sm:max-w-[240px]">
                      {lt(nextLesson.title)}
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div
                    className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/60 cursor-not-allowed ml-auto"
                    title={t("quiz.lessonLockedTooltip")}
                  >
                    <span className="truncate max-w-[160px] sm:max-w-[240px]">
                      {lt(nextLesson.title)}
                    </span>
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                )
              ) : (
                <Link
                  to="/learn"
                  className="flex items-center gap-2 text-xs sm:text-sm font-medium text-primary hover:underline ml-auto"
                >
                  <span>{t("quiz.backToLessons")}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </>
        )}

        {/* Dynamic In-Browser Document Viewer */}
        <DynamicDocumentViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          files={viewerFiles}
          initialIndex={viewerIndex}
          title={viewerTitle}
        />
      </div>
    </PageLayout>
  );
}
