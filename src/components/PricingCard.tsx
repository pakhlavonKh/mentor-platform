import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { PricingPlan } from "@/data/mockData";

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  const { t } = useTranslation();
  return (
    <Card className={`relative shadow-soft hover:shadow-hover transition-all duration-300 border rounded-2xl ${plan.popular ? "border-primary shadow-elevated ring-1 ring-primary/20" : "border-border/60"}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="gradient-primary text-primary-foreground shadow-sm">{t("pricing.popular")}</Badge>
        </div>
      )}
      <CardHeader className="text-center pb-2 pt-6">
        <h3 className="font-display font-bold text-lg text-card-foreground">{plan.name}</h3>
        <p className="text-muted-foreground text-sm">{plan.documents} {plan.documents === 1 ? t("pricing.document") : t("pricing.documents")}</p>
        <div className="mt-3">
          <span className="font-display text-4xl font-bold text-card-foreground">${plan.price}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ul className="space-y-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className={`w-full ${plan.popular ? "gradient-primary text-primary-foreground hover:opacity-90" : ""}`} variant={plan.popular ? "default" : "outline"}>
          {t("pricing.getStarted")}
        </Button>
      </CardFooter>
    </Card>
  );
}
