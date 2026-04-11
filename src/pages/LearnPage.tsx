import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { LearningCard } from "@/components/LearningCard";
import { mockLearning } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function LearnPage() {
  const { t } = useTranslation();
  const completed = mockLearning.filter((l) => l.completed).length;
  const progress = Math.round((completed / mockLearning.length) * 100);
  const topics = [...new Set(mockLearning.map((l) => l.topic))];

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t("learning.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("learning.description")}</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("learning.overallProgress")}</span>
            <span className="font-medium text-foreground">{completed}/{mockLearning.length} {t("learning.completed")}</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>
        {topics.map((topic) => (
          <div key={topic}>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4 capitalize">{topic}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockLearning.filter((l) => l.topic === topic).map((content, i) => (
                <motion.div key={content.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <LearningCard content={content} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
