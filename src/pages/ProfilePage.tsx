import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Globe, BookOpen, GraduationCap, Bookmark, FileCheck, CreditCard, Clock, CheckCircle2, LogOut } from "lucide-react";
import { mockLearning, mockGrants } from "@/data/mockData";
import { GrantCard } from "@/components/GrantCard";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const completed = mockLearning.filter((l) => l.completed).length;
  const progress = Math.round((completed / mockLearning.length) * 100);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success(t("auth.logoutSuccess") || "Logged out successfully");
    navigate("/");
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-soft border-0 gradient-card overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center shadow-elevated">
                  <User className="h-9 w-9 text-primary-foreground" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h1 className="font-display text-2xl font-bold text-card-foreground">{user.firstName} {user.lastName}</h1>
                  <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <Mail className="h-3.5 w-3.5" /> {user.email}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                    <Badge variant="secondary" className="rounded-full"><Globe className="h-3 w-3 mr-1" /> Germany</Badge>
                    <Badge variant="secondary" className="rounded-full"><Globe className="h-3 w-3 mr-1" /> UK</Badge>
                    <Badge variant="secondary" className="rounded-full"><Globe className="h-3 w-3 mr-1" /> Japan</Badge>
                    <Badge variant="secondary" className="rounded-full"><GraduationCap className="h-3 w-3 mr-1" /> Master's</Badge>
                    <Badge variant="secondary" className="rounded-full"><BookOpen className="h-3 w-3 mr-1" /> B2 English</Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="rounded-full">{t("common.editProfile")}</Button>
                  <Button variant="destructive" className="rounded-full gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    {t("common.logout")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Bookmark className="h-5 w-5" />, label: "Saved Grants", value: "2" },
              { icon: <FileCheck className="h-5 w-5" />, label: "Submissions", value: "0" },
              { icon: <CreditCard className="h-5 w-5" />, label: "Reviews", value: "0" },
              { icon: <BookOpen className="h-5 w-5" />, label: "Progress", value: `${progress}%` },
            ].map((stat) => (
              <Card key={stat.label} className="shadow-soft border border-border/60">
                <CardContent className="p-5 text-center">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-2 text-accent-foreground">
                    {stat.icon}
                  </div>
                  <p className="font-display text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Learning Progress */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="shadow-soft border border-border/60">
            <CardHeader>
              <h3 className="font-display font-semibold text-lg text-card-foreground">Learning Progress</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium text-card-foreground">{completed}/{mockLearning.length} completed</span>
                </div>
                <Progress value={progress} className="h-2.5" />
              </div>
              <Separator />
              <div className="space-y-3">
                {mockLearning.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-3 text-sm">
                    {lesson.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={lesson.completed ? "text-card-foreground" : "text-muted-foreground"}>{lesson.title}</span>
                    <Badge variant="secondary" className="ml-auto text-xs rounded-full">{lesson.duration}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Saved Grants */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-semibold text-lg text-foreground mb-4">Saved Grants</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {mockGrants.slice(0, 2).map((grant) => (
              <GrantCard key={grant.id} grant={grant} saved />
            ))}
          </div>
        </motion.div>

        {/* Review Status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="shadow-soft border border-border/60">
            <CardHeader>
              <h3 className="font-display font-semibold text-lg text-card-foreground">Document Reviews</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No reviews yet</p>
                <p className="text-sm text-muted-foreground mt-1">Purchase a review package to get started</p>
                <Button variant="outline" className="mt-4 rounded-full" asChild>
                  <a href="/pricing">View Packages</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Button variant="outline" className="w-full rounded-full">Sign Out</Button>
      </div>
    </PageLayout>
  );
}
