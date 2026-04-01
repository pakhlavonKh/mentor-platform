import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { GrantCard } from "@/components/GrantCard";
import { LearningCard } from "@/components/LearningCard";
import { mockGrants, mockLearning } from "@/data/mockData";
import { GraduationCap, BookOpen, FileCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function DashboardPage() {
  const completedLessons = mockLearning.filter((l) => l.completed).length;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome back 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's new in your scholarship journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <GraduationCap className="h-5 w-5" />, label: "Available Grants", value: mockGrants.length, trend: "+3 this week" },
            { icon: <BookOpen className="h-5 w-5" />, label: "Lessons Completed", value: `${completedLessons}/${mockLearning.length}`, trend: `${Math.round((completedLessons / mockLearning.length) * 100)}% complete` },
            { icon: <FileCheck className="h-5 w-5" />, label: "Submissions", value: 0 },
            { icon: <TrendingUp className="h-5 w-5" />, label: "Saved Grants", value: 2 },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="visible">
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recommended Grants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockGrants.slice(0, 4).map((grant, i) => (
              <motion.div key={grant.id} custom={i + 4} variants={fadeUp} initial="hidden" animate="visible">
                <GrantCard grant={grant} />
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockLearning.slice(0, 3).map((content, i) => (
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
