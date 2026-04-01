import { PageLayout } from "@/components/PageLayout";
import { PricingCard } from "@/components/PricingCard";
import { pricingPlans } from "@/data/mockData";
import { motion } from "framer-motion";

export default function PricingPage() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Expert Document Review</h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Get professional feedback on your motivation letter, CV, or research proposal.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {pricingPlans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <PricingCard plan={plan} />
            </motion.div>
          ))}
        </div>
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>All plans include secure document upload and detailed written feedback.</p>
        </div>
      </div>
    </PageLayout>
  );
}
