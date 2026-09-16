import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { api, type LearningContent } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

interface LearningFile {
  url: string;
  mimeType: string;
  name: string;
}

export default function LearningDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { lt } = useLocale();

  const [content, setContent] = useState<LearningContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!id) return;
    api.learning
      .get(id)
      .then((res) => setContent(res))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return <Navigate to="/learn" replace />;

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

  const renderFileItem = (file: LearningFile) => {
    const isPdf = file.mimeType === "application/pdf";
    const isImage = file.mimeType?.startsWith("image");

    return (
      <div
        key={file.url}
        className="flex items-center justify-between p-3 border border-border/80 rounded-xl hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3 truncate">
          {isPdf && <FileText className="h-5 w-5 text-red-500 shrink-0" />}
          {isImage && <ImageIcon className="h-5 w-5 text-blue-500 shrink-0" />}
          {!isPdf && !isImage && <Download className="h-5 w-5 text-muted-foreground shrink-0" />}
          <span className="text-sm font-medium truncate">{file.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(isPdf || isImage) && (
            <Button size="sm" variant="ghost" asChild>
              <a href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-1" />
                {t("learning.view")}
              </a>
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <a href={`http://localhost:5000${file.url}`} download>
              <Download className="h-4 w-4 mr-1" />
              {t("learning.download")}
            </a>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
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
              <h1 className="font-display text-3xl font-bold mb-2 text-foreground">{lt(content.title)}</h1>
              <p className="text-muted-foreground">{lt(content.description)}</p>
            </div>

            {/* Main Lesson Content */}
            {renderLessonContent()}

            {/* Supporting Files */}
            {content.files && content.files.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-foreground">{t("learning.supportingMaterials")}</h2>
                <div className="space-y-2">{content.files.map(renderFileItem)}</div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border/60" />

            {/* Submission Form */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">{t("learning.submitWork")}</h2>
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
                            <span className="font-medium truncate text-foreground">{file.name}</span>
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
          </>
        )}
      </div>
    </PageLayout>
  );
}
