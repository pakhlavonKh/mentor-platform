import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { api, type TelegramPost, type Pagination } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Edit2, Link as LinkIcon } from "lucide-react";

export default function AdminTelegram() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch telegram posts
  const { data: postsData } = useQuery<{ data: TelegramPost[]; pagination: Pagination }>({
    queryKey: ["admin-telegram"],
    queryFn: () => api.telegram.list(),
  });

  const posts = postsData?.data || [];

  // Form states for new post
  const [newPost, setNewPost] = useState({
    title: { en: "", ru: "", kz: "" },
    description: { en: "", ru: "", kz: "" },
    source: "",
    link: "",
  });

  const [editPost, setEditPost] = useState<any>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/telegram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-telegram"] });
      toast.success("Telegram post created");
      setNewPost({ title: { en: "", ru: "", kz: "" }, description: { en: "", ru: "", kz: "" }, source: "", link: "" });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error creating post"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/telegram/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-telegram"] });
      toast.success("Post updated");
      setEditingId(null);
      setEditPost(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error updating post"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/telegram/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-telegram"] });
      toast.success("Post deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error deleting post"),
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("common.telegram") || "Telegram Posts"}</h1>
          <p className="text-muted-foreground mt-2">Create and manage Telegram posts for the platform</p>
        </div>

        {/* Create New Post */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Create New Post</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title (English)</label>
                <Input value={newPost.title.en} onChange={(e) => setNewPost({ ...newPost, title: { ...newPost.title, en: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title (Russian)</label>
                <Input value={newPost.title.ru} onChange={(e) => setNewPost({ ...newPost, title: { ...newPost.title, ru: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title (Kazakh)</label>
                <Input value={newPost.title.kz} onChange={(e) => setNewPost({ ...newPost, title: { ...newPost.title, kz: e.target.value } })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Description (English)</label>
                <Textarea value={newPost.description.en} onChange={(e) => setNewPost({ ...newPost, description: { ...newPost.description, en: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (Russian)</label>
                <Textarea value={newPost.description.ru} onChange={(e) => setNewPost({ ...newPost, description: { ...newPost.description, ru: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (Kazakh)</label>
                <Textarea value={newPost.description.kz} onChange={(e) => setNewPost({ ...newPost, description: { ...newPost.description, kz: e.target.value } })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Source</label>
                <Input value={newPost.source} onChange={(e) => setNewPost({ ...newPost, source: e.target.value })} placeholder="e.g., @channel_name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Link</label>
                <Input value={newPost.link} onChange={(e) => setNewPost({ ...newPost, link: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <Button onClick={() => createMutation.mutate(newPost)} className="gradient-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </Card>

        {/* Existing Posts */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Posts</h2>
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="p-4">
                {editingId === post.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Input value={editPost.title.en} onChange={(e) => setEditPost({ ...editPost, title: { ...editPost.title, en: e.target.value } })} placeholder="Title EN" />
                      <Input value={editPost.title.ru} onChange={(e) => setEditPost({ ...editPost, title: { ...editPost.title, ru: e.target.value } })} placeholder="Title RU" />
                      <Input value={editPost.title.kz} onChange={(e) => setEditPost({ ...editPost, title: { ...editPost.title, kz: e.target.value } })} placeholder="Title KZ" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input value={editPost.source} onChange={(e) => setEditPost({ ...editPost, source: e.target.value })} placeholder="Source" />
                      <Input value={editPost.link} onChange={(e) => setEditPost({ ...editPost, link: e.target.value })} placeholder="Link" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => updateMutation.mutate({ id: post.id, data: editPost })} className="gradient-primary" disabled={updateMutation.isPending}>
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
                      <h3 className="font-semibold">{typeof post.title === "string" ? post.title : post.title?.en}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{typeof post.description === "string" ? post.description : post.description?.en}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-muted px-2 py-1 rounded">{post.source}</span>
                        {post.link && (
                          <a href={post.link} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                            <LinkIcon className="h-3 w-3" /> View
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(post.id);
                          setEditPost(post);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure?")) deleteMutation.mutate(post.id);
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
