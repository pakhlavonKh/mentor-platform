import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { api, type PricingPlan } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/PricingCard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.pricing.list().then(setPlans).catch(() => {});
  }, []);

  const handleBuy = async (plan: PricingPlan) => {
    try {
      // create order (payment integration later)
      const order = await api.orders.create({ pricingPlanId: plan.id, price: plan.price, documents: plan.documents });
      toast.success("Order created");
      navigate(`/profile`);
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || "Error creating order");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold">Purchase Review Package</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id}>
              <PricingCard plan={plan} />
              <Button className="mt-3 w-full" onClick={() => handleBuy(plan)}>Buy</Button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
