import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { api, type PricingPlan } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface PricingCardProps {
  plan: PricingPlan;
  onSelect?: (plan: PricingPlan) => void;
  loading?: boolean;
}

export function PricingCard({ plan, onSelect, loading: externalLoading }: PricingCardProps) {
  const { t } = useTranslation();
  const { lt, la } = useLocale();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading || internalLoading;

  const handleStart = async () => {
    if (onSelect) {
      onSelect(plan);
      return;
    }

    // If not logged in, redirect to login with return path
    if (!isLoggedIn) {
      toast.info(t("pricing.loginRequired") || "Войдите или зарегистрируйтесь, чтобы продолжить выбор тарифа");
      navigate(`/login?redirect=/profile&planId=${encodeURIComponent(plan.id)}`);
      return;
    }

    if (user?.role && user.role !== "student") {
      toast.error("Покупка пакетов доступна только для аккаунтов студентов");
      return;
    }

    setInternalLoading(true);
    try {
      const order = await api.orders.create({
        pricingPlanId: plan.id,
        price: plan.price,
        documents: plan.documents,
      });
      toast.success(t("pricing.orderCreated") || "Заказ создан! Переходим к оплате...");
      navigate(`/profile?orderId=${encodeURIComponent(order.id)}&newOrder=true`);
    } catch (err: any) {
      toast.error(err.message || "Ошибка при создании заказа");
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Card className={`relative shadow-soft hover:shadow-hover transition-all duration-300 border rounded-2xl h-full flex flex-col ${plan.popular ? "border-primary shadow-elevated ring-1 ring-primary/20" : "border-border/60"}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="gradient-primary text-primary-foreground shadow-sm">{t("pricing.popular")}</Badge>
        </div>
      )}
      <CardHeader className="text-center pb-2 pt-6">
        <h3 className="font-display font-bold text-lg text-card-foreground">{lt(plan.name)}</h3>
        <p className="text-muted-foreground text-sm">{plan.documents} {plan.documents === 1 ? t("pricing.document") : t("pricing.documents")}</p>
        <div className="mt-3">
          <span className="font-display text-4xl font-bold text-card-foreground">${plan.price}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-1">
        <ul className="space-y-2.5">
          {la(plan.features).map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-2 mt-auto">
        <Button
          onClick={handleStart}
          disabled={isLoading}
          className={`w-full rounded-full ${plan.popular ? "gradient-primary text-primary-foreground hover:opacity-90" : ""}`}
          variant={plan.popular ? "default" : "outline"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.loading") || "Загрузка..."}
            </>
          ) : (
            t("pricing.getStarted")
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

