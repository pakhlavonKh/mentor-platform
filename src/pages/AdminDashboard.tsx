import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Grant, Pagination } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Edit2 } from "lucide-react";

export default function AdminDashboard() {
  const { t } = useTranslation();

  const [titleEn, setTitleEn] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [titleKz, setTitleKz] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [descriptionKz, setDescriptionKz] = useState("");
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
    titleEn: string;
    titleRu: string;
    titleKz: string;
    descriptionEn: string;
    descriptionRu: string;
    descriptionKz: string;
    country: string;
    type: Grant["type"];
    funding: Grant["funding"];
    deadline: string;
    link: string;
  };
  const [editState, setEditState] = useState<EditState>({ 
    titleEn: "", titleRu: "", titleKz: "",
    descriptionEn: "", descriptionRu: "", descriptionKz: "",
    country: "", type: "master", funding: "full", deadline: "", link: "" 
  });

  const validateForm = (titleE: string, titleR: string, titleK: string, descE: string, descR: string, descK: string) => {
    if (!titleE.trim() || !titleR.trim() || !titleK.trim()) {
      toast.error(t("admin.titleRequiredAllLanguages") || "Title is required in all languages");
      return false;
    }
    if (!descE.trim() || !descR.trim() || !descK.trim()) {
      toast.error(t("admin.descriptionRequiredAllLanguages") || "Description is required in all languages");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(titleEn, titleRu, titleKz, descriptionEn, descriptionRu, descriptionKz)) return;
    
    setLoading(true);
    try {
      await createMutation.mutateAsync({ 
        title: { en: titleEn, ru: titleRu, kz: titleKz }, 
        description: { en: descriptionEn, ru: descriptionRu, kz: descriptionKz }, 
        country, type, funding, deadline, link 
      });
      toast.success(t("admin.grantCreated") || "Grant created");
      setTitleEn("");
      setTitleRu("");
      setTitleKz("");
      setDescriptionEn("");
      setDescriptionRu("");
      setDescriptionKz("");
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
    setEditState({ 
      titleEn: g.title?.en || "", 
      titleRu: g.title?.ru || "",
      titleKz: g.title?.kz || "",
      descriptionEn: g.description?.en || "", 
      descriptionRu: g.description?.ru || "",
      descriptionKz: g.description?.kz || "",
      country: g.country || "", 
      type: g.type || "master", 
      funding: g.funding || "full", 
      deadline: g.deadline || "", 
      link: g.link || "" 
    });
  };

  const saveEdit = async (id: string) => {
    if (!validateForm(editState.titleEn, editState.titleRu, editState.titleKz, editState.descriptionEn, editState.descriptionRu, editState.descriptionKz)) return;
    
    try {
      await updateMutation.mutateAsync({ 
        id, 
        payload: { 
          title: { en: editState.titleEn, ru: editState.titleRu, kz: editState.titleKz }, 
          description: { en: editState.descriptionEn, ru: editState.descriptionRu, kz: editState.descriptionKz }, 
          country: editState.country, 
          type: editState.type, 
          funding: editState.funding, 
          deadline: editState.deadline, 
          link: editState.link 
        } 
      });
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
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Language Fields for Title */}
                <div>
                  <h3 className="font-medium text-sm mb-3">{t("admin.grantTitle") || "Grant Title"} <span className="text-red-500">*</span></h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">English *</label>
                      <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="English title" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Русский *</label>
                      <Input value={titleRu} onChange={(e) => setTitleRu(e.target.value)} placeholder="Russian title" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Қазақша *</label>
                      <Input value={titleKz} onChange={(e) => setTitleKz(e.target.value)} placeholder="Kazakh title" required />
                    </div>
                  </div>
                </div>

                {/* Language Fields for Description */}
                <div>
                  <h3 className="font-medium text-sm mb-3">{t("admin.grantDescription") || "Grant Description"} <span className="text-red-500">*</span></h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">English *</label>
                      <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="English description" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Русский *</label>
                      <Textarea value={descriptionRu} onChange={(e) => setDescriptionRu(e.target.value)} placeholder="Russian description" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Қазақша *</label>
                      <Textarea value={descriptionKz} onChange={(e) => setDescriptionKz(e.target.value)} placeholder="Kazakh description" required />
                    </div>
                  </div>
                </div>

                {/* Other Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("admin.country") || "Country"}</label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("admin.type") || "Type"}</label>
                    <select value={type} onChange={(e) => setType(e.target.value as Grant["type"])} className="w-full rounded-md border px-3 py-2">
                      <option value="bachelor">{t("grants.bachelor") || "Bachelor"}</option>
                      <option value="master">{t("grants.master") || "Master"}</option>
                      <option value="phd">PhD</option>
                      <option value="internship">{t("grants.internship") || "Internship"}</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("admin.funding") || "Funding"}</label>
                    <select value={funding} onChange={(e) => setFunding(e.target.value as Grant["funding"])} className="w-full rounded-md border px-3 py-2">
                      <option value="full">{t("grants.fullFunding") || "Fully Funded"}</option>
                      <option value="partial">{t("grants.partialFunding") || "Partial"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("admin.deadline") || "Deadline"}</label>
                    <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("admin.link") || "Link"}</label>
                  <Input value={link} onChange={(e) => setLink(e.target.value)} />
                </div>
                <Button type="submit" disabled={loading} className="gradient-primary w-full">
                  {loading ? t("admin.creating") || "Creating..." : t("admin.createGrant") || "Create Grant"}
                </Button>
              </form>
            </Card>
          </div>
        </section>

        {/* Grants List */}
        <section>
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="font-semibold text-lg">{t("admin.existingGrants") || "Existing Grants"}</h2>
            {grantsLoading ? (
              <div className="text-center py-8">{t("admin.loading") || "Loading..."}</div>
            ) : grants.length === 0 ? (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">{t("admin.noGrants") || "No grants found"}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {grants.map((grant) => (
                  <Card key={grant.id}>
                    {editingId === grant.id ? (
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          <Input value={editState.titleEn} onChange={(e) => setEditState({ ...editState, titleEn: e.target.value })} placeholder="Title EN" />
                          <Input value={editState.titleRu} onChange={(e) => setEditState({ ...editState, titleRu: e.target.value })} placeholder="Title RU" />
                          <Input value={editState.titleKz} onChange={(e) => setEditState({ ...editState, titleKz: e.target.value })} placeholder="Title KZ" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input value={editState.country} onChange={(e) => setEditState({ ...editState, country: e.target.value })} placeholder="Country" />
                          <Input type="date" value={editState.deadline} onChange={(e) => setEditState({ ...editState, deadline: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => saveEdit(grant.id)} className="gradient-primary" disabled={updateMutation.isPending}>
                            {t("common.save") || "Save"}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingId(null)}>
                            {t("common.cancel") || "Cancel"}
                          </Button>
                        </div>
                      </CardContent>
                    ) : (
                      <CardContent className="p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{typeof grant.title === "string" ? grant.title : grant.title?.en}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{grant.country} • {grant.type} • {grant.funding}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t("admin.deadline")}: {grant.deadline}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(grant)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(grant.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
