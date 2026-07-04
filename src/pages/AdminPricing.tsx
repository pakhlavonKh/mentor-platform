import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, type PricingPlan } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Edit2 } from "lucide-react";

export default function AdminPricing() {
  const { t } = useTranslation();
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
      // Since the API doesn't have a create endpoint for pricing, we'll need to add it
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/pricing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create pricing plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast.success("Pricing plan created");
      setNewPlan({ name: { en: "", ru: "", kz: "" }, price: 0, documents: 0, popular: false });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error creating plan"),
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
      if (!response.ok) throw new Error("Failed to update pricing plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast.success("Pricing plan updated");
      setEditingId(null);
      setEditPlan(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error updating plan"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/pricing/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete pricing plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast.success("Pricing plan deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error deleting plan"),
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("common.pricing") || "Pricing Management"}</h1>
          <p className="text-muted-foreground mt-2">Create and manage pricing plans</p>
        </div>

        {/* Create New Plan */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Create New Plan</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name (English)</label>
                <Input value={newPlan.name.en} onChange={(e) => setNewPlan({ ...newPlan, name: { ...newPlan.name, en: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name (Russian)</label>
                <Input value={newPlan.name.ru} onChange={(e) => setNewPlan({ ...newPlan, name: { ...newPlan.name, ru: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name (Kazakh)</label>
                <Input value={newPlan.name.kz} onChange={(e) => setNewPlan({ ...newPlan, name: { ...newPlan.name, kz: e.target.value } })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <Input type="number" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Documents Included</label>
                <Input type="number" value={newPlan.documents} onChange={(e) => setNewPlan({ ...newPlan, documents: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={newPlan.popular} onChange={(e) => setNewPlan({ ...newPlan, popular: e.target.checked })} id="popular" />
              <label htmlFor="popular" className="text-sm font-medium">Mark as most popular</label>
            </div>
            <Button onClick={() => createMutation.mutate(newPlan)} className="gradient-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </div>
        </Card>

        {/* Existing Plans */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Existing Plans</h2>
          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="p-4">
                {editingId === plan.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name (English)</label>
                        <Input value={editPlan.name.en} onChange={(e) => setEditPlan({ ...editPlan, name: { ...editPlan.name, en: e.target.value } })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Name (Russian)</label>
                        <Input value={editPlan.name.ru} onChange={(e) => setEditPlan({ ...editPlan, name: { ...editPlan.name, ru: e.target.value } })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Name (Kazakh)</label>
                        <Input value={editPlan.name.kz} onChange={(e) => setEditPlan({ ...editPlan, name: { ...editPlan.name, kz: e.target.value } })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Price</label>
                        <Input type="number" value={editPlan.price} onChange={(e) => setEditPlan({ ...editPlan, price: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Documents</label>
                        <Input type="number" value={editPlan.documents} onChange={(e) => setEditPlan({ ...editPlan, documents: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => updateMutation.mutate({ id: plan.id, data: editPlan })} className="gradient-primary" disabled={updateMutation.isPending}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{typeof plan.name === "string" ? plan.name : plan.name?.en}</h3>
                      <p className="text-sm text-muted-foreground">${plan.price} • {plan.documents} documents {plan.popular && "• Most Popular"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(plan.id);
                          setEditPlan(plan);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure?")) deleteMutation.mutate(plan.id);
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
