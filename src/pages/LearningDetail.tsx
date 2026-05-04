import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { api, type LearningContent } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { toast } from "@/hooks/use-toast";

export default function LearningDetail() {
  const { id } = useParams();
  const [content, setContent] = useState<LearningContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { lt } = useLocale();

  useEffect(() => {
    if (!id) return;
    api.learning.get(id).then((res) => setContent(res.data)).catch(() => setContent(null)).finally(() => setLoading(false));
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

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <p>Loading…</p>
        ) : !content ? (
          <p>Not found</p>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold mb-2">{lt(content.title)}</h1>
            <p className="text-muted-foreground mb-4">{lt(content.description)}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Upload files for this lesson</span>
                <input ref={fileRef} type="file" name="files" multiple className="mt-2 block w-full" />
              </label>
              <div>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? "Uploading…" : "Upload Submission"}
                </button>
              </div>
            </form>

            <div className="prose mt-6">
              {content.type === "video" && (content as any).videoUrl ? (
                <div className="aspect-video">
                  <iframe src={(content as any).videoUrl} title={lt(content.title)} allowFullScreen className="w-full h-full" />
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
