import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/use-locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type LearningContent, type Pagination } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Edit2, HelpCircle, CheckCircle2 } from "lucide-react";
import { TestBuilderModal } from "@/components/TestBuilderModal";

export default function AdminLearning() {
  const { t } = useTranslation();
  const { lt } = useLocale();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testModalContent, setTestModalContent] = useState<LearningContent | null>(null);

  // Fetch learning content
  const { data: contentData } = useQuery<{ data: LearningContent[]; pagination: Pagination }>({
    queryKey: ["admin-learning"],
    queryFn: () => api.learning.list(),
  });

  const contents = contentData?.data || [];

  // Form states for new content
  const [newContent, setNewContent] = useState({
    title: { en: "", ru: "", kz: "" },
    topic: { en: "", ru: "", kz: "" },
    description: { en: "", ru: "", kz: "" },
    type: "video" as "video" | "text" | "checklist",
    duration: "",
  });

  const [editContent, setEditContent] = useState<any>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/learning`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(t("admin.contentCreateError") || "Failed to create content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-learning"] });
      toast.success(t("admin.contentCreated") || "Learning content created");
      setNewContent({
        title: { en: "", ru: "", kz: "" },
        topic: { en: "", ru: "", kz: "" },
        description: { en: "", ru: "", kz: "" },
        type: "video",
        duration: "",
      });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t("admin.contentCreateError") || "Error creating content"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/learning/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(t("admin.contentUpdateError") || "Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-learning"] });
      toast.success(t("admin.contentUpdated") || "Content updated");
      setEditingId(null);
      setEditContent(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t("admin.contentUpdateError") || "Error updating content"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/learning/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error(t("admin.contentDeleteError") || "Failed to delete content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-learning"] });
      toast.success(t("admin.contentDeleted") || "Content deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t("admin.contentDeleteError") || "Error deleting content"),
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {t("admin.manageLearning") || t("common.learning") || "Learning Content"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("admin.manageLearningDesc") || "Create and manage learning materials"}
          </p>
        </div>

        {/* Create New Content */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">
            {t("admin.createLearningContent") || "Create New Learning Content"}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.titleEn") || "Title (English)"}</label>
                <Input
                  value={newContent.title.en}
                  onChange={(e) => setNewContent({ ...newContent, title: { ...newContent.title, en: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.titleRu") || "Title (Russian)"}</label>
                <Input
                  value={newContent.title.ru}
                  onChange={(e) => setNewContent({ ...newContent, title: { ...newContent.title, ru: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.titleKz") || "Title (Kazakh)"}</label>
                <Input
                  value={newContent.title.kz}
                  onChange={(e) => setNewContent({ ...newContent, title: { ...newContent.title, kz: e.target.value } })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.topicEn") || "Topic (English)"}</label>
                <Input
                  value={newContent.topic.en}
                  onChange={(e) => setNewContent({ ...newContent, topic: { ...newContent.topic, en: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.topicRu") || "Topic (Russian)"}</label>
                <Input
                  value={newContent.topic.ru}
                  onChange={(e) => setNewContent({ ...newContent, topic: { ...newContent.topic, ru: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.topicKz") || "Topic (Kazakh)"}</label>
                <Input
                  value={newContent.topic.kz}
                  onChange={(e) => setNewContent({ ...newContent, topic: { ...newContent.topic, kz: e.target.value } })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.descriptionEn") || "Description (English)"}</label>
                <Textarea
                  value={newContent.description.en}
                  onChange={(e) => setNewContent({ ...newContent, description: { ...newContent.description, en: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.descriptionRu") || "Description (Russian)"}</label>
                <Textarea
                  value={newContent.description.ru}
                  onChange={(e) => setNewContent({ ...newContent, description: { ...newContent.description, ru: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.descriptionKz") || "Description (Kazakh)"}</label>
                <Textarea
                  value={newContent.description.kz}
                  onChange={(e) => setNewContent({ ...newContent, description: { ...newContent.description, kz: e.target.value } })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.contentType") || "Type"}</label>
                <Select
                  value={newContent.type}
                  onValueChange={(value) => setNewContent({ ...newContent, type: value as any })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("admin.selectType") || "Select type"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">{t("admin.typeVideo") || "Video"}</SelectItem>
                    <SelectItem value="text">{t("admin.typeText") || "Text"}</SelectItem>
                    <SelectItem value="checklist">{t("admin.typeChecklist") || "Checklist"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.contentDuration") || "Duration"}</label>
                <Input
                  value={newContent.duration}
                  onChange={(e) => setNewContent({ ...newContent, duration: e.target.value })}
                  placeholder={t("admin.durationPlaceholder") || "e.g., 15 mins"}
                />
              </div>
            </div>
            <Button
              onClick={() => createMutation.mutate(newContent)}
              className="gradient-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? t("admin.creating") || "Creating..." : t("admin.createContent") || "Create Content"}
            </Button>
          </div>
        </Card>

        {/* Existing Content */}
        <div>
          <h2 className="font-semibold text-lg mb-4">
            {t("admin.existingContent") || "Learning Content"}
          </h2>
          <div className="grid gap-4">
            {contents.map((content) => (
              <Card key={content.id} className="p-4">
                {editingId === content.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editContent.title.en}
                      onChange={(e) => setEditContent({ ...editContent, title: { ...editContent.title, en: e.target.value } })}
                      placeholder={t("admin.titleEn") || "Title EN"}
                    />
                    <Select
                      value={editContent.type}
                      onValueChange={(value) => setEditContent({ ...editContent, type: value as any })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("admin.selectType") || "Select type"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">{t("admin.typeVideo") || "Video"}</SelectItem>
                        <SelectItem value="text">{t("admin.typeText") || "Text"}</SelectItem>
                        <SelectItem value="checklist">{t("admin.typeChecklist") || "Checklist"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={editContent.duration}
                      onChange={(e) => setEditContent({ ...editContent, duration: e.target.value })}
                      placeholder={t("admin.contentDuration") || "Duration"}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateMutation.mutate({ id: content.id, data: editContent })}
                        className="gradient-primary"
                        disabled={updateMutation.isPending}
                      >
                        {t("common.save") || "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)}>
                        {t("common.cancel") || "Cancel"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {typeof content.title === "string" ? content.title : lt(content.title)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {typeof content.topic === "string" ? content.topic : lt(content.topic)}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">
                          {content.type}
                        </span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {content.duration}
                        </span>
                        {content.test && content.test.questions && content.test.questions.length > 0 ? (
                          <span className="text-xs bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            {t("admin.testQuestionsBadge", {
                              count: content.test.questions.length,
                              passing: content.test.passingScore || 70,
                            })}
                          </span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            {t("quiz.noTest")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Button to Create or Edit Test for this content */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTestModalContent(content)}
                        className={`h-8 gap-1.5 text-xs font-medium ${
                          content.test && content.test.questions && content.test.questions.length > 0
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
                            : "border-border/80 text-muted-foreground hover:text-primary hover:border-primary/40"
                        }`}
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        {content.test && content.test.questions && content.test.questions.length > 0 ? (
                          <span>{t("quiz.editTest")} ({content.test.questions.length})</span>
                        ) : (
                          <span>{t("quiz.createTest")}</span>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(content.id);
                          setEditContent(content);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm(t("admin.confirmDeleteContent") || "Are you sure you want to delete this content?")) {
                            deleteMutation.mutate(content.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Test Builder Modal */}
        <TestBuilderModal
          isOpen={!!testModalContent}
          onClose={() => setTestModalContent(null)}
          content={testModalContent}
          onSave={async (test) => {
            if (!testModalContent) return;
            await api.learning.saveTest(testModalContent.id, test);
            queryClient.invalidateQueries({ queryKey: ["admin-learning"] });
          }}
        />
      </div>
    </AppLayout>
  );
}
