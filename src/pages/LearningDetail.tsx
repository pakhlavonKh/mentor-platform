import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { api, type LearningContent } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, Play, Download, Eye } from "lucide-react";

interface LearningFile {
  url: string;
  mimeType: string;
  name: string;
}

export default function LearningDetail() {
  const { id } = useParams();
  const [content, setContent] = useState<LearningContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { lt } = useLocale();

  useEffect(() => {
    if (!id) return;
    api.learning.get(id).then((res) => setContent(res)).catch(() => setContent(null)).finally(() => setLoading(false));
  }, [id]);

  if (!id) return <Navigate to="/learn" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = fileRef.current;
    if (!input || !input.files || input.files.length === 0) {
      toast({ title: "No files", description: "Please select one or more files to upload." });
      return;
    }

    const form = new FormData();
    Array.from(input.files).forEach((f) => form.append("files", f));
    form.append("learningContentId", id as string);

    try {
      setSubmitting(true);
      await api.submissions.upload(form);
      toast({ title: "Uploaded", description: "Your submission was uploaded successfully." });
      // clear selection
      if (input) input.value = "";
    } catch (err: any) {
      console.error(err);
      toast({ title: "Upload failed", description: String(err?.message ?? err) });
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
            <Play className="h-5 w-5" />
            Video Lesson
          </h2>
          <div className="aspect-video rounded-lg overflow-hidden border border-border">
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
            <FileText className="h-5 w-5" />
            Lesson Document
          </h2>
          <iframe
            src={`http://localhost:5000${content.fileUrl}`}
            className="w-full h-96 border border-border rounded-lg"
            title={lt(content.title)}
          />
          <Button variant="outline" className="mt-3" asChild>
            <a href={`http://localhost:5000${content.fileUrl}`} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </Button>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Lesson Image
          </h2>
          <img
            src={`http://localhost:5000${content.fileUrl}`}
            alt={lt(content.title)}
            className="w-full max-h-96 object-contain rounded-lg border border-border"
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
      <div key={file.url} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          {isPdf && <FileText className="h-5 w-5 text-red-500" />}
          {isImage && <ImageIcon className="h-5 w-5 text-blue-500" />}
          {!isPdf && !isImage && <Download className="h-5 w-5 text-gray-500" />}
          <span className="text-sm font-medium">{file.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {(isPdf || isImage) && (
            <Button size="sm" variant="ghost" asChild>
              <a href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-1" />
                View
              </a>
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <a href={`http://localhost:5000${file.url}`} download>
              <Download className="h-4 w-4 mr-1" />
              Download
            </a>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <p>Loading…</p>
        ) : !content ? (
          <p>Not found</p>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold mb-2">{lt(content.title)}</h1>
            <p className="text-muted-foreground mb-6">{lt(content.description)}</p>

            {/* Main Lesson Content */}
            {renderLessonContent()}

            {/* Supporting Files */}
            {content.files && content.files.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Supporting Materials</h2>
                <div className="space-y-2">
                  {content.files.map(renderFileItem)}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="my-8 border-t border-border/50" />

            {/* Submission Form */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Submit Your Work</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium">Upload your files for this lesson</span>
                  <input ref={fileRef} type="file" name="files" multiple className="mt-2 block w-full" />
                </label>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Uploading…" : "Upload Submission"}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
