import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { api, type LearningContent, type Pagination } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Edit2 } from "lucide-react";

export default function AdminLearning() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

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
      if (!response.ok) throw new Error("Failed to create content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-learning"] });
      toast.success("Learning content created");
      setNewContent({ title: { en: "", ru: "", kz: "" }, topic: { en: "", ru: "", kz: "" }, description: { en: "", ru: "", kz: "" }, type: "video", duration: "" });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error creating content"),
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
      if (!response.ok) throw new Error("Failed to update content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-learning"] });
      toast.success("Content updated");
      setEditingId(null);
      setEditContent(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error updating content"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/learning/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete content");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-learning"] });
      toast.success("Content deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error deleting content"),
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("common.learning") || "Learning Content"}</h1>
          <p className="text-muted-foreground mt-2">Create and manage learning materials</p>
        </div>

        {/* Create New Content */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Create New Learning Content</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title (English)</label>
                <Input value={newContent.title.en} onChange={(e) => setNewContent({ ...newContent, title: { ...newContent.title, en: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title (Russian)</label>
                <Input value={newContent.title.ru} onChange={(e) => setNewContent({ ...newContent, title: { ...newContent.title, ru: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title (Kazakh)</label>
                <Input value={newContent.title.kz} onChange={(e) => setNewContent({ ...newContent, title: { ...newContent.title, kz: e.target.value } })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Topic (English)</label>
                <Input value={newContent.topic.en} onChange={(e) => setNewContent({ ...newContent, topic: { ...newContent.topic, en: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Topic (Russian)</label>
                <Input value={newContent.topic.ru} onChange={(e) => setNewContent({ ...newContent, topic: { ...newContent.topic, ru: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Topic (Kazakh)</label>
                <Input value={newContent.topic.kz} onChange={(e) => setNewContent({ ...newContent, topic: { ...newContent.topic, kz: e.target.value } })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Description (English)</label>
                <Textarea value={newContent.description.en} onChange={(e) => setNewContent({ ...newContent, description: { ...newContent.description, en: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (Russian)</label>
                <Textarea value={newContent.description.ru} onChange={(e) => setNewContent({ ...newContent, description: { ...newContent.description, ru: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (Kazakh)</label>
                <Textarea value={newContent.description.kz} onChange={(e) => setNewContent({ ...newContent, description: { ...newContent.description, kz: e.target.value } })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select value={newContent.type} onChange={(e) => setNewContent({ ...newContent, type: e.target.value as any })} className="w-full rounded-md border px-3 py-2">
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                  <option value="checklist">Checklist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <Input value={newContent.duration} onChange={(e) => setNewContent({ ...newContent, duration: e.target.value })} placeholder="e.g., 15 mins" />
              </div>
            </div>
            <Button onClick={() => createMutation.mutate(newContent)} className="gradient-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Content"}
            </Button>
          </div>
        </Card>

        {/* Existing Content */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Learning Content</h2>
          <div className="grid gap-4">
            {contents.map((content) => (
              <Card key={content.id} className="p-4">
                {editingId === content.id ? (
                  <div className="space-y-4">
                    <Input value={editContent.title.en} onChange={(e) => setEditContent({ ...editContent, title: { ...editContent.title, en: e.target.value } })} placeholder="Title EN" />
                    <select value={editContent.type} onChange={(e) => setEditContent({ ...editContent, type: e.target.value })} className="w-full rounded-md border px-3 py-2">
                      <option value="video">Video</option>
                      <option value="text">Text</option>
                      <option value="checklist">Checklist</option>
                    </select>
                    <Input value={editContent.duration} onChange={(e) => setEditContent({ ...editContent, duration: e.target.value })} placeholder="Duration" />
                    <div className="flex gap-2">
                      <Button onClick={() => updateMutation.mutate({ id: content.id, data: editContent })} className="gradient-primary" disabled={updateMutation.isPending}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{typeof content.title === "string" ? content.title : content.title?.en}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{typeof content.topic === "string" ? content.topic : content.topic?.en}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{content.type}</span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">{content.duration}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                          if (confirm("Are you sure?")) deleteMutation.mutate(content.id);
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
      </div>
    </AppLayout>
  );
}
