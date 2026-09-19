import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/use-locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, type PricingPlan } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Edit2 } from "lucide-react";

export default function AdminPricing() {
  const { t } = useTranslation();
  const { lt } = useLocale();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch pricing plans
  const { data: plansData } = useQuery<PricingPlan[]>({
    queryKey: ["admin-pricing"],
    queryFn: () => api.pricing.list(),
  });

  const plans = plansData || [];

  // Form states for creating new plan
  const [newPlan, setNewPlan] = useState({
    name: { en: "", ru: "", kz: "" },
    price: 0,
    documents: 0,
    popular: false,
  });

  // Edit states
  const [editPlan, setEditPlan] = useState<any>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/pricing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(t("admin.pricingCreateError") || "Failed to create pricing plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast.success(t("admin.pricingCreated") || "Pricing plan created");
      setNewPlan({ name: { en: "", ru: "", kz: "" }, price: 0, documents: 0, popular: false });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t("admin.pricingCreateError") || "Error creating plan"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/pricing/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(t("admin.pricingUpdateError") || "Failed to update pricing plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast.success(t("admin.pricingUpdated") || "Pricing plan updated");
      setEditingId(null);
      setEditPlan(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t("admin.pricingUpdateError") || "Error updating plan"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/pricing/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error(t("admin.pricingDeleteError") || "Failed to delete pricing plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast.success(t("admin.pricingDeleted") || "Pricing plan deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t("admin.pricingDeleteError") || "Error deleting plan"),
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {t("admin.managePricing") || t("common.pricing") || "Pricing Management"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("admin.managePricingDesc") || "Create and manage pricing plans"}
          </p>
        </div>

        {/* Create New Plan */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">
            {t("admin.createPlanTitle") || t("admin.createPricing") || "Create New Plan"}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.nameEn") || "Name (English)"}</label>
                <Input
                  value={newPlan.name.en}
                  onChange={(e) => setNewPlan({ ...newPlan, name: { ...newPlan.name, en: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.nameRu") || "Name (Russian)"}</label>
                <Input
                  value={newPlan.name.ru}
                  onChange={(e) => setNewPlan({ ...newPlan, name: { ...newPlan.name, ru: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.nameKz") || "Name (Kazakh)"}</label>
                <Input
                  value={newPlan.name.kz}
                  onChange={(e) => setNewPlan({ ...newPlan, name: { ...newPlan.name, kz: e.target.value } })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t("admin.planPrice") || "Price"}</label>
                <Input
                  type="number"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("admin.planDocumentsIncluded") || t("admin.planDocuments") || "Documents Included"}
                </label>
                <Input
                  type="number"
                  value={newPlan.documents}
                  onChange={(e) => setNewPlan({ ...newPlan, documents: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newPlan.popular}
                onChange={(e) => setNewPlan({ ...newPlan, popular: e.target.checked })}
                id="popular"
                className="rounded border-border"
              />
              <label htmlFor="popular" className="text-sm font-medium cursor-pointer">
                {t("admin.planPopular") || "Mark as most popular"}
              </label>
            </div>
            <Button
              onClick={() => createMutation.mutate(newPlan)}
              className="gradient-primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? t("admin.creating") || "Creating..."
                : t("admin.createPricing") || "Create Plan"}
            </Button>
          </div>
        </Card>

        {/* Existing Plans */}
        <div>
          <h2 className="font-semibold text-lg mb-4">
            {t("admin.existingPlans") || "Existing Plans"}
          </h2>
          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="p-4">
                {editingId === plan.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("admin.nameEn") || "Name (English)"}</label>
                        <Input
                          value={editPlan.name?.en || ""}
                          onChange={(e) => setEditPlan({ ...editPlan, name: { ...editPlan.name, en: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("admin.nameRu") || "Name (Russian)"}</label>
                        <Input
                          value={editPlan.name?.ru || ""}
                          onChange={(e) => setEditPlan({ ...editPlan, name: { ...editPlan.name, ru: e.target.value } })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("admin.nameKz") || "Name (Kazakh)"}</label>
                        <Input
                          value={editPlan.name?.kz || ""}
                          onChange={(e) => setEditPlan({ ...editPlan, name: { ...editPlan.name, kz: e.target.value } })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t("admin.planPrice") || "Price"}</label>
                        <Input
                          type="number"
                          value={editPlan.price}
                          onChange={(e) => setEditPlan({ ...editPlan, price: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t("admin.planDocumentsIncluded") || t("admin.planDocuments") || "Documents Included"}
                        </label>
                        <Input
                          type="number"
                          value={editPlan.documents}
                          onChange={(e) => setEditPlan({ ...editPlan, documents: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!editPlan.popular}
                        onChange={(e) => setEditPlan({ ...editPlan, popular: e.target.checked })}
                        id={`edit-popular-${plan.id}`}
                        className="rounded border-border"
                      />
                      <label htmlFor={`edit-popular-${plan.id}`} className="text-sm font-medium cursor-pointer">
                        {t("admin.planPopular") || "Mark as most popular"}
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateMutation.mutate({ id: plan.id, data: editPlan })}
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
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {typeof plan.name === "string" ? plan.name : lt(plan.name)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        ${plan.price} • {plan.documents} {t("admin.documentsCount", { count: plan.documents })}
                        {plan.popular && ` • ${t("common.mostPopular") || "Most Popular"}`}
                      </p>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(plan.id);
                          setEditPlan({
                            ...plan,
                            name: typeof plan.name === "string" ? { en: plan.name, ru: plan.name, kz: plan.name } : plan.name,
                          });
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm(t("admin.confirmDeletePlan") || "Are you sure you want to delete this plan?")) {
                            deleteMutation.mutate(plan.id);
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
      </div>
    </AppLayout>
  );
}
