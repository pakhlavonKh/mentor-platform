import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { api, type User, type Pagination, type PricingPlan } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Power, PowerOff, Trash2 } from "lucide-react";

export default function AdminUsers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [userPlans, setUserPlans] = useState<Record<string, PricingPlan>>({});

  const { data } = useQuery<{ data: User[]; pagination: Pagination }>({
    queryKey: ["admin-users"],
    queryFn: () => api.admin.listUsers(),
  });
  
  const { data: pricingPlans } = useQuery<PricingPlan[]>({
    queryKey: ["pricing-plans"],
    queryFn: () => api.pricing.list(),
  });

  const { data: orders } = useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      try {
        return await api.orders.adminList();
      } catch {
        return { data: [] };
      }
    },
  });

  // Build a map of userId -> their latest plan
  useEffect(() => {
    if (orders?.data && pricingPlans) {
      const planMap: Record<string, PricingPlan> = {};
      const ordersData = Array.isArray(orders.data) ? orders.data : [];
      
      ordersData.forEach((order: any) => {
        if (order.userId && order.pricingPlanId) {
          const plan = pricingPlans.find((p) => p.id === order.pricingPlanId);
          if (plan) {
            planMap[order.userId] = plan;
          }
        }
      });
      setUserPlans(planMap);
    }
  }, [orders, pricingPlans]);

  const users = data?.data || [];

  const deactivateStudent = useMutation({
    mutationFn: (id: string) => api.admin.deactivateStudent(id),
    onSuccess: () => {
      toast.success("Student deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const reactivateStudent = useMutation({
    mutationFn: (id: string) => api.admin.reactivateStudent(id),
    onSuccess: () => {
      toast.success("Student reactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.admin.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "tutor":
        return "default";
      case "student":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("admin.users") || "Users"}</h1>
          <p className="text-muted-foreground mt-1">Manage platform users (excluding mentors)</p>
        </div>
        <div className="grid gap-4">
          {users.map((u) => (
            <div key={u.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${!u.isActive ? "opacity-60" : ""}`}>
              <div className="flex-1 mb-3 sm:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <div className="font-medium">{u.firstName} {u.lastName}</div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                  </div>
                  <Badge variant={getRoleColor(u.role)} className="capitalize">
                    {u.role}
                  </Badge>
                  {!u.isActive && <Badge variant="outline" className="text-destructive">Inactive</Badge>}
                </div>
                {u.role === "student" && userPlans[u.id] && (
                  <div className="text-sm text-muted-foreground">
                    Plan: <span className="font-medium">{userPlans[u.id]?.name?.en || "Unknown"}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {u.role === "student" && (
                  <>
                    {u.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deactivateStudent.mutate(u.id)}
                        disabled={deactivateStudent.isPending}
                        className="gap-1"
                      >
                        <PowerOff className="h-4 w-4" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reactivateStudent.mutate(u.id)}
                        disabled={reactivateStudent.isPending}
                        className="gap-1"
                      >
                        <Power className="h-4 w-4" />
                        Reactivate
                      </Button>
                    )}
                  </>
                )}
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => { 
                    if (confirm("Are you sure you want to delete this user?")) {
                      deleteUser.mutate(u.id); 
                    }
                  }}
                  disabled={deleteUser.isPending}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("common.delete") || "Delete"}
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
