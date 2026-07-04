import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, type Order, type Pagination } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminOrders() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery<{ data: Order[]; pagination: Pagination }>({
    queryKey: ["admin-orders"],
    queryFn: () => api.orders.adminList?.() || Promise.resolve({ data: [], pagination: { page: 1, limit: 50, total: 0, pages: 1 } }),
  });

  const orders = ordersData?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.orders.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error updating order"),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Orders Management</h1>
          <p className="text-muted-foreground mt-2">View and manage customer orders</p>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : orders.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No orders found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {order.user?.firstName} {order.user?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Plan: {order.user?.firstName || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">${order.price} • {order.documents} documents</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Status:</p>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Update Status:</p>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant={order.status === "pending" ? "default" : "outline"}
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "pending" })}
                            disabled={updateStatusMutation.isPending}
                            className="justify-start"
                          >
                            Pending
                          </Button>
                          <Button
                            size="sm"
                            variant={order.status === "completed" ? "default" : "outline"}
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "completed" })}
                            disabled={updateStatusMutation.isPending}
                            className="justify-start"
                          >
                            Completed
                          </Button>
                          <Button
                            size="sm"
                            variant={order.status === "failed" ? "destructive" : "outline"}
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "failed" })}
                            disabled={updateStatusMutation.isPending}
                            className="justify-start"
                          >
                            Failed
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
