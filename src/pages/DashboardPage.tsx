import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { GrantCard } from "@/components/GrantCard";
import { LearningCard } from "@/components/LearningCard";
import { api, type Grant, type LearningContent } from "@/lib/api";
import { GraduationCap, BookOpen, FileCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [learning, setLearning] = useState<LearningContent[]>([]);

  useEffect(() => {
    api.grants.list({ limit: "100" }).then((res) => setGrants(res.data)).catch(() => {});
    api.learning.list({ limit: "100" }).then((res) => setLearning(res.data)).catch(() => {});
  }, []);

  const completedLessons = learning.filter((l) => l.completed).length;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("dashboard.welcome")}</h1>
          <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <GraduationCap className="h-5 w-5" />, label: t("dashboard.availableGrants"), value: grants.length, trend: t("dashboard.thisWeek") },
            { icon: <BookOpen className="h-5 w-5" />, label: t("dashboard.lessonsCompleted"), value: `${completedLessons}/${learning.length}`, trend: `${learning.length ? Math.round((completedLessons / learning.length) * 100) : 0}% ${t("dashboard.complete")}` },
            { icon: <FileCheck className="h-5 w-5" />, label: t("dashboard.submissions"), value: 0 },
            { icon: <TrendingUp className="h-5 w-5" />, label: t("dashboard.savedGrants"), value: 2 },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="visible">
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">{t("dashboard.recommendedGrants")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grants.slice(0, 4).map((grant, i) => (
              <motion.div key={grant.id} custom={i + 4} variants={fadeUp} initial="hidden" animate="visible">
                <GrantCard grant={grant} />
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">{t("dashboard.continueLearning")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learning.slice(0, 3).map((content, i) => (
              <motion.div key={content.id} custom={i + 8} variants={fadeUp} initial="hidden" animate="visible">
                <LearningCard content={content} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
