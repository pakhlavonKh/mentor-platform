import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { PricingCard } from "@/components/PricingCard";
import { api, type PricingPlan } from "@/lib/api";
import { motion } from "framer-motion";

export default function PricingPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    api.pricing.list().then(setPlans).catch(() => {});
  }, []);
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{t("pricing.title")}</h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            {t("pricing.description")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <PricingCard plan={plan} />
            </motion.div>
          ))}
        </div>
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>{t("pricing.info")}</p>
        </div>
      </div>
    </PageLayout>
  );
}
