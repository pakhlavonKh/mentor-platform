import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Grant, Pagination } from "@/lib/api";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState<Grant["type"]>("master");
  const [funding, setFunding] = useState<Grant["funding"]>("full");
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // list of grants
  const { data: grantsData, isLoading: grantsLoading } = useQuery<{ data: Grant[]; pagination: Pagination }>(
    {
      queryKey: ["grants"],
      queryFn: () => api.grants.list(),
      staleTime: 1000 * 60,
    }
  );

  const grants = grantsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (newGrant: Partial<Grant>) => api.grants.create(newGrant),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grants"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Grant> }) => api.grants.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grants"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.grants.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grants"] }),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  type EditState = {
    title: string;
    description: string;
    country: string;
    type: Grant["type"];
    funding: Grant["funding"];
    deadline: string;
    link: string;
  };
  const [editState, setEditState] = useState<EditState>({ title: "", description: "", country: "", type: "master", funding: "full", deadline: "", link: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error(t("auth.invalidEmail") || "Please provide title and description");
      return;
    }
    setLoading(true);
    try {
      await createMutation.mutateAsync({ title: { en: title, ru: "", kz: "" }, description: { en: description, ru: "", kz: "" }, country, type, funding, deadline, link });
      toast.success(t("admin.grantCreated") || "Grant created");
      setTitle("");
      setDescription("");
      setCountry("");
      setDeadline("");
      setLink("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error creating grant");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (g: Grant) => {
    setEditingId(g.id);
    setEditState({ title: g.title?.en || "", description: g.description?.en || "", country: g.country || "", type: g.type || "master", funding: g.funding || "full", deadline: g.deadline || "", link: g.link || "" });
  };

  const saveEdit = async (id: string) => {
    if (!editState.title.trim() || !editState.description.trim()) {
      toast.error(t("auth.invalidEmail") || "Please provide title and description");
      return;
    }
    try {
      await updateMutation.mutateAsync({ id, payload: { title: { en: editState.title, ru: "", kz: "" }, description: { en: editState.description, ru: "", kz: "" }, country: editState.country, type: editState.type, funding: editState.funding, deadline: editState.deadline, link: editState.link } });
      toast.success(t("admin.grantUpdated") || "Grant updated");
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating grant");
    }
  };

  const confirmDelete = async (id: string) => {
    if (!confirm(t("admin.confirmDelete") || "Are you sure?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t("admin.grantDeleted") || "Grant deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting grant");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("admin.dashboardTitle") || "Admin Dashboard"}</h1>
          <p className="text-muted-foreground mt-2">{t("admin.dashboardDesc") || "Manage the platform and users."}</p>
        </div>

        <section>
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="font-semibold text-lg">{t("admin.manageGrants") || "Manage Grants"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">{t("grants.title")}</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">{t("grants.description")}</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Country</label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as Grant["type"])} className="w-full rounded-md border px-3 py-2">
                    <option value="bachelor">Bachelor</option>
                    <option value="master">Master</option>
                    <option value="phd">PhD</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Funding</label>
                  <select value={funding} onChange={(e) => setFunding(e.target.value as Grant["funding"])} className="w-full rounded-md border px-3 py-2">
                    <option value="full">Full</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Deadline</label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Link</label>
                <Input value={link} onChange={(e) => setLink(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="gradient-primary">
                {loading ? "Creating..." : t("admin.createGrant") || "Create Grant"}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
