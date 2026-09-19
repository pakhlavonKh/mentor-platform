import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Layout,
  Copy,
  Check,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchAuthenticatedFileBlob, downloadAuthenticatedFile } from "@/lib/api";
import { renderAsync } from "docx-preview";
import * as mammoth from "mammoth";

export interface ViewerFileItem {
  url: string;
  originalName: string;
  mimeType?: string;
  size?: number;
}

export interface DynamicDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  files: ViewerFileItem[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
}

export function DynamicDocumentViewer({
  isOpen,
  onClose,
  files = [],
  initialIndex = 0,
  title,
  subtitle,
}: DynamicDocumentViewerProps) {
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Blob & URL state
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number | null>(null);

  // Viewer Controls State
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [docxViewMode, setDocxViewMode] = useState<"layout" | "reader">("layout");
  const [copied, setCopied] = useState(false);

  // DOM Refs
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initialIndex when modal opens or initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, files.length - 1)));
      setZoom(100);
      setRotation(0);
    }
  }, [isOpen, initialIndex, files.length]);

  const activeFile = files[currentIndex] as ViewerFileItem | undefined;

  // Detect file type
  const fileType = useMemo(() => {
    if (!activeFile) return "unknown";
    const name = (activeFile.originalName || "").toLowerCase();
    const mime = (activeFile.mimeType || "").toLowerCase();

    if (name.endsWith(".pdf") || mime.includes("pdf")) return "pdf";
    if (
      name.endsWith(".docx") ||
      name.endsWith(".doc") ||
      mime.includes("word") ||
      mime.includes("officedocument.wordprocessingml")
    ) {
      return "docx";
    }
    if (
      name.match(/\.(png|jpe?g|webp|gif|svg|bmp|ico)$/) ||
      mime.startsWith("image/")
    ) {
      return "image";
    }
    if (
      name.match(/\.(txt|json|csv|md|log|xml|js|ts|html|css|py)$/) ||
      mime.startsWith("text/")
    ) {
      return "text";
    }
    return "unsupported";
  }, [activeFile]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Load document whenever activeFile changes
  useEffect(() => {
    if (!isOpen || !activeFile || !activeFile.url) {
      setBlobUrl(null);
      setTextContent(null);
      setHtmlContent(null);
      setWordCount(null);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);
    setZoom(100);
    setRotation(0);

    // Clean previous blobUrl
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }

    (async () => {
      try {
        const { blob, mimeType } = await fetchAuthenticatedFileBlob(activeFile.url);
        if (isCancelled) return;

        const effectiveMime =
          mimeType ||
          (fileType === "pdf"
            ? "application/pdf"
            : fileType === "image"
            ? "image/png"
            : fileType === "text"
            ? "text/plain"
            : "application/octet-stream");

        const typedBlob = new Blob([blob], { type: effectiveMime });
        const url = URL.createObjectURL(typedBlob);
        setBlobUrl(url);

        // Process DOCX with docx-preview & mammoth
        if (fileType === "docx") {
          const arrayBuffer = await blob.arrayBuffer();
          if (isCancelled) return;

          // Mammoth conversion for Reader Mode
          try {
            const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
            if (!isCancelled) {
              setHtmlContent(mammothResult.value);
              // Count words
              const textResult = await mammoth.extractRawText({ arrayBuffer });
              const words = (textResult.value || "").trim().split(/\s+/).filter(Boolean).length;
              setWordCount(words);
            }
          } catch (e) {
            console.warn("Mammoth text parsing error:", e);
          }

          // Docx-preview rendering for Paginated Layout View
          if (docxContainerRef.current) {
            docxContainerRef.current.innerHTML = "";
            await renderAsync(arrayBuffer, docxContainerRef.current, undefined, {
              className: "study-docx-page",
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              renderHeaders: true,
              renderFooters: true,
              renderFootnotes: true,
              renderEndnotes: true,
            });
          }
        } else if (fileType === "text") {
          const text = await blob.text();
          if (!isCancelled) {
            setTextContent(text);
            const words = text.trim().split(/\s+/).filter(Boolean).length;
            setWordCount(words);
          }
        }

        if (!isCancelled) {
          setLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Document viewer loading failed:", err);
          setError(err?.message || t("viewer.failedDesc"));
          setLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, activeFile?.url, fileType]);

  // Re-render docx in DOM if view mode switches back to layout
  useEffect(() => {
    if (fileType === "docx" && docxViewMode === "layout" && blobUrl && docxContainerRef.current) {
      if (docxContainerRef.current.children.length === 0) {
        fetch(blobUrl)
          .then((r) => r.arrayBuffer())
          .then((ab) => {
            if (docxContainerRef.current) {
              docxContainerRef.current.innerHTML = "";
              renderAsync(ab, docxContainerRef.current, undefined, {
                className: "study-docx-page",
                inWrapper: true,
                ignoreWidth: false,
                ignoreHeight: false,
                renderHeaders: true,
                renderFooters: true,
              });
            }
          })
          .catch(() => {});
      }
    }
  }, [fileType, docxViewMode, blobUrl]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft" && files.length > 1) {
        handlePrev();
      } else if (e.key === "ArrowRight" && files.length > 1) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, files.length, currentIndex, isFullscreen]);

  if (!isOpen || !activeFile) return null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(files.length - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleDownload = async () => {
    if (!activeFile) return;
    try {
      await downloadAuthenticatedFile(activeFile.url, activeFile.originalName || "document");
      toast.success(t("viewer.download"));
    } catch {
      toast.error("Download failed");
    }
  };

  const handlePrint = () => {
    if (fileType === "pdf" && blobUrl) {
      const printWindow = window.open(blobUrl, "_blank");
      printWindow?.focus();
    } else {
      window.print();
    }
  };

  const handleCopyText = () => {
    const textToCopy = textContent || "";
    if (!textToCopy && htmlContent) {
      const tmp = document.createElement("div");
      tmp.innerHTML = htmlContent;
      navigator.clipboard.writeText(tmp.textContent || "");
    } else {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopied(true);
    toast.success(t("viewer.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className={`relative flex flex-col w-full bg-background border border-border/80 shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? "fixed inset-0 h-screen w-screen rounded-none z-50 border-0"
            : "max-w-6xl h-[92vh] rounded-2xl"
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-card/95 backdrop-blur shrink-0 gap-3">
          {/* File Meta Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                fileType === "pdf"
                  ? "bg-red-500/10 text-red-500"
                  : fileType === "docx"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : fileType === "image"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-500"
              }`}
            >
              {fileType === "pdf" ? (
                <FileText className="h-5 w-5" />
              ) : fileType === "docx" ? (
                <FileCheck className="h-5 w-5" />
              ) : fileType === "image" ? (
                <ImageIcon className="h-5 w-5" />
              ) : (
                <FileCode className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-foreground truncate max-w-xs sm:max-w-md md:max-lg">
                  {activeFile.originalName}
                </h3>
                <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0 shrink-0">
                  {fileType}
                </Badge>
                {activeFile.size && (
                  <span className="text-xs text-muted-foreground hidden sm:inline-block shrink-0">
                    {formatFileSize(activeFile.size)}
                  </span>
                )}
                {wordCount !== null && (
                  <span className="text-xs text-muted-foreground hidden md:inline-block shrink-0">
                    • {wordCount} {t("viewer.words")}
                  </span>
                )}
              </div>
              {(subtitle || title) && (
                <p className="text-xs text-muted-foreground truncate">{subtitle || title}</p>
              )}
            </div>
          </div>

          {/* Multi-document Navigation Pills */}
          {files.length > 1 && (
            <div className="hidden lg:flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/50">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded"
                onClick={handlePrev}
                title={t("viewer.prevFile")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium px-1 text-muted-foreground">
                {t("viewer.fileCount", { current: currentIndex + 1, total: files.length })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded"
                onClick={handleNext}
                title={t("viewer.nextFile")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* DOCX Dual-Mode Switcher */}
            {fileType === "docx" && (
              <div className="flex items-center bg-muted/70 p-0.5 rounded-lg border border-border/50 text-xs mr-1 hidden sm:flex">
                <button
                  type="button"
                  onClick={() => setDocxViewMode("layout")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    docxViewMode === "layout"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layout className="h-3.5 w-3.5" />
                  <span>{t("viewer.pageLayout")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDocxViewMode("reader")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    docxViewMode === "reader"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{t("viewer.readerMode")}</span>
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            {(fileType === "docx" || fileType === "image") && (
              <div className="hidden sm:flex items-center gap-1 bg-muted/60 px-1 py-0.5 rounded-lg border border-border/50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom((z) => Math.max(50, z - 15))}
                  title={t("viewer.zoomOut")}
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-medium w-10 text-center text-muted-foreground">{zoom}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setZoom((z) => Math.min(200, z + 15))}
                  title={t("viewer.zoomIn")}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-xs font-medium"
                  onClick={() => setZoom(100)}
                  title={t("viewer.resetZoom")}
                >
                  100%
                </Button>
              </div>
            )}

            {/* Image Rotation */}
            {fileType === "image" && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                title="Rotate 90°"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Copy Text for Reader / Text view */}
            {(fileType === "text" || (fileType === "docx" && docxViewMode === "reader")) && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs hidden md:flex"
                onClick={handleCopyText}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? t("viewer.copied") : t("viewer.copyText")}
              </Button>
            )}

            {/* PDF Open In New Tab */}
            {fileType === "pdf" && blobUrl && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(blobUrl, "_blank")}
                title={t("viewer.openNewTab")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Print */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hidden sm:flex"
              onClick={handlePrint}
              title={t("viewer.print")}
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>

            {/* Download */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-primary hover:bg-primary/10"
              onClick={handleDownload}
              title={t("viewer.download")}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? t("viewer.exitFullscreen") : t("viewer.fullscreen")}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-1"
              onClick={onClose}
              title={t("viewer.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Multi-Document Bottom Selector Bar on small screens */}
        {files.length > 1 && (
          <div className="flex lg:hidden items-center justify-between px-4 py-1.5 bg-muted/40 border-b border-border/40 text-xs">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handlePrev}>
              <ChevronLeft className="h-3.5 w-3.5" /> {t("viewer.prevFile")}
            </Button>
            <span className="text-muted-foreground font-medium">
              {t("viewer.fileCount", { current: currentIndex + 1, total: files.length })}
            </span>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleNext}>
              {t("viewer.nextFile")} <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Viewer Content Area */}
        <div className="flex-1 overflow-auto relative bg-muted/30 flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center p-8 space-y-3">
              <div className="h-10 w-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
              <div className="text-center">
                <h4 className="font-semibold text-sm text-foreground">{t("viewer.loading")}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{t("viewer.loadingDesc")}</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center p-8 max-w-md text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-foreground">{t("viewer.failedTitle")}</h4>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentIndex((idx) => idx)}
                  className="gap-1.5 text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("viewer.retry")}
                </Button>
                <Button size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  {t("viewer.download")}
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && fileType === "unsupported" && (
            <div className="flex flex-col items-center justify-center p-8 max-w-md text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-foreground">{t("viewer.unsupportedTitle")}</h4>
                <p className="text-xs text-muted-foreground mt-1">{t("viewer.unsupportedDesc")}</p>
              </div>
              <Button size="sm" onClick={handleDownload} className="gap-2 text-xs">
                <Download className="h-4 w-4" />
                {t("viewer.download")}
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* PDF Viewer */}
              {fileType === "pdf" && blobUrl && (
                <div className="w-full h-full">
                  <object
                    data={`${blobUrl}#toolbar=1&navpanes=0`}
                    type="application/pdf"
                    className="w-full h-full border-0"
                  >
                    <iframe
                      src={`${blobUrl}#toolbar=1`}
                      className="w-full h-full border-0"
                      title={activeFile.originalName}
                    />
                  </object>
                </div>
              )}

              {/* DOCX Viewer */}
              {fileType === "docx" && (
                <div className="w-full h-full overflow-auto p-4 sm:p-6 flex flex-col items-center">
                  {docxViewMode === "layout" ? (
                    <div
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top center",
                        transition: "transform 0.15s ease-out",
                      }}
                      className="w-full max-w-4xl"
                    >
                      <div
                        ref={docxContainerRef}
                        className="study-docx-wrapper flex flex-col items-center"
                      />
                    </div>
                  ) : (
                    /* Reader Mode (Mammoth Clean HTML) */
                    <div
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top center",
                        transition: "transform 0.15s ease-out",
                      }}
                      className="w-full max-w-3xl bg-card border border-border/70 rounded-xl p-8 sm:p-12 shadow-md my-4"
                    >
                      {htmlContent ? (
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-foreground"
                          dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          {t("viewer.loadingDesc")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Image Viewer */}
              {fileType === "image" && blobUrl && (
                <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                  <img
                    src={blobUrl}
                    alt={activeFile.originalName}
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transition: "transform 0.2s ease-out",
                      maxHeight: isFullscreen ? "90vh" : "75vh",
                    }}
                    className="object-contain rounded-lg shadow-xl"
                  />
                </div>
              )}

              {/* Text / Code Viewer */}
              {fileType === "text" && (
                <div className="w-full h-full overflow-auto p-4 sm:p-6 flex justify-center">
                  <div className="w-full max-w-4xl bg-card border border-border/70 rounded-xl p-6 shadow-sm overflow-x-auto">
                    <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground">
                      {textContent}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
