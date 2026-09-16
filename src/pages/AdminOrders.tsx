import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, type Order, type Pagination, type PricingPlan } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, User, CreditCard } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

export default function AdminOrders() {
  const { t } = useTranslation();
  const { lt } = useLocale();
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery<{ data: Order[]; pagination: Pagination }>({
    queryKey: ["admin-orders"],
    queryFn: () => api.orders.adminList?.() || Promise.resolve({ data: [], pagination: { page: 1, limit: 50, total: 0, pages: 1 } }),
  });

  // Fetch pricing plans to map plan names
  const { data: plansData } = useQuery<PricingPlan[]>({
    queryKey: ["admin-orders-pricing-plans"],
    queryFn: () => api.pricing.list(),
  });

  const orders = ordersData?.data || [];
  const plans = plansData || [];

  const getPlanName = (pricingPlanId: string) => {
    const p = plans.find((plan) => plan.id === pricingPlanId);
    return p ? lt(p.name) : "Тариф StudyQadam";
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.orders.updateStatus(id, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      if (variables.status === "completed") {
        toast.success("Тариф успешно активирован для студента!");
      } else {
        toast.success("Статус заказа обновлен");
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error updating order"),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">⏳ Ожидает оплаты</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">✅ Активирован</Badge>;
      case "failed":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30">❌ Отклонен</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Управление заказами и тарифами</h1>
          <p className="text-muted-foreground mt-1">Просматривайте переводы в Telegram и активируйте тарифы студентов</p>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка заказов...</div>
        ) : orders.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Заказов пока нет
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPending = order.status === "pending";
              const isCompleted = order.status === "completed";
              const planTitle = getPlanName(order.pricingPlanId);

              return (
                <Card key={order.id} className={`transition-all ${isPending ? "border-amber-500/40 shadow-sm" : ""}`}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-base text-foreground">Заказ #{order.id.slice(0, 8)}</h3>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="space-y-1 text-sm">
                          <p className="font-medium text-foreground flex items-center gap-1.5">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {order.user?.firstName} {order.user?.lastName} ({order.user?.email || "Email не указан"})
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1.5">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            Тариф: <strong className="text-foreground">{planTitle}</strong> (${order.price}) • {order.documents} проверок документов
                          </p>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Создан: {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2.5 sm:items-end">
                        {isPending && (
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-sm w-full sm:w-auto"
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "completed" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Активировать тариф (Оплата получена)
                          </Button>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant={order.status === "pending" ? "secondary" : "outline"}
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "pending" })}
                            disabled={updateStatusMutation.isPending || order.status === "pending"}
                            className="text-xs h-8"
                          >
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Pending
                          </Button>
                          <Button
                            size="sm"
                            variant={order.status === "completed" ? "secondary" : "outline"}
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "completed" })}
                            disabled={updateStatusMutation.isPending || order.status === "completed"}
                            className="text-xs h-8"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                            Completed
                          </Button>
                          <Button
                            size="sm"
                            variant={order.status === "failed" ? "destructive" : "outline"}
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "failed" })}
                            disabled={updateStatusMutation.isPending || order.status === "failed"}
                            className="text-xs h-8"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Failed
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
