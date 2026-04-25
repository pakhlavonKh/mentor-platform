import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GrantCard } from "@/components/GrantCard";
import { api, type Grant, type PricingPlan } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { Search, GraduationCap, FileText, Globe, ArrowRight, CheckCircle2, Star, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import heroImage from "@/assets/hero-image.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function HomePage() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const { lt } = useLocale();

  useEffect(() => {
    api.grants.list({ limit: "4" }).then((res) => setGrants(res.data)).catch(() => {});
    api.pricing.list().then(setPricingPlans).catch(() => {});
  }, []);

  const services = [
    { icon: <FileText className="h-6 w-6" />, title: t("home.essayReview"), desc: t("home.essayReviewDesc") },
    { icon: <GraduationCap className="h-6 w-6" />, title: t("home.cvReview"), desc: t("home.cvReviewDesc") },
    { icon: <Globe className="h-6 w-6" />, title: t("home.englishPrep"), desc: t("home.englishPrepDesc") },
  ];

  const steps = [
    { num: "01", title: "browse", desc: t("home.browseDesc") },
    { num: "02", title: "prepare", desc: t("home.prepareDesc") },
    { num: "03", title: "submit", desc: t("home.submitDesc") },
    { num: "04", title: "succeed", desc: t("home.succeedDesc") },
  ];
  return (
    <PageLayout noPadding>
      {/* Hero */}
      <section className="relative overflow-hidden h-[calc(100vh-4rem)]">
        <div className="gradient-hero h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full h-full">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6 sm:space-y-8 flex flex-col justify-center h-full">
                <Badge variant="secondary" className="rounded-full px-4 py-1.5 font-body text-xs w-fit">
                  <Star className="h-3 w-3 mr-1 fill-current" /> {t("hero.trusted")}
                </Badge>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                  {t("home.title")}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                  {t("home.subtitle")}
                </p>
                <div className="flex flex-col gap-3 w-full max-w-full sm:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t("common.search")} className="pl-11 py-3 rounded-full bg-background text-base" />
                  </div>
                  <Button className="gradient-primary text-primary-foreground rounded-full px-8 py-6 hover:opacity-90 w-full text-base font-medium">
                    {t("common.grants")} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm text-muted-foreground pt-4">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> 500+ {t("common.grants")}</span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary flex-shrink-0" /> {t("pricing.documents")}</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary flex-shrink-0" /> {t("common.learning")}</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:flex items-center justify-center"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-elevated w-full aspect-square lg:aspect-auto max-h-[500px]">
                  <img src={heroImage} alt="Student studying abroad" width={1920} height={1080} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services / Portfolio */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 custom={0} variants={fadeUp} className="font-display text-3xl font-bold text-foreground">{t("home.services")}</motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground mt-3 max-w-md mx-auto">{t("home.servicesDesc")}</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div key={s.title} custom={i + 2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all duration-300 text-center group cursor-pointer h-full">
                  <CardContent className="p-8 space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mx-auto text-accent-foreground group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-card-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Grants */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground">{t("home.title")}</h2>
              <p className="text-muted-foreground mt-1">{t("telegram.description")}</p>
            </div>
            <Link to="/grants">
              <Button variant="outline" className="rounded-full hidden sm:flex w-fit">
                {t("common.all")} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-5">
            {grants.slice(0, 4).map((grant, i) => (
              <motion.div key={grant.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <GrantCard grant={grant} />
              </motion.div>
            ))}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <Link to="/grants"><Button variant="outline" className="rounded-full">{t("common.all")} {t("common.grants")}</Button></Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground">{t("home.steps")}</h2>
            <p className="text-muted-foreground mt-3">{t("home.ctaDesc")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.num} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="text-center space-y-3">
                  <span className="font-display text-4xl font-bold text-primary/20">{step.num}</span>
                  <h3 className="font-display text-lg font-semibold text-foreground">{t(`home.${step.title}Title`)}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 gradient-hero">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">{t("home.reviewPackages")}</h2>
          <p className="text-muted-foreground mt-3 mb-8 max-w-md mx-auto">{t("home.reviewPackagesDesc")}</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className={`border shadow-soft hover:shadow-hover transition-all h-full ${plan.popular ? "border-primary ring-1 ring-primary/20 shadow-elevated relative" : "border-border/60"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-primary text-primary-foreground rounded-full px-3">{t("common.mostPopular")}</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8 text-center space-y-4">
                    <h3 className="font-display text-lg font-semibold text-card-foreground">{lt(plan.name)}</h3>
                    <div>
                      <span className="font-display text-4xl font-bold text-card-foreground">${plan.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("grantsFilter.documentsReviewed", { count: plan.documents })}</p>
                    <Link to="/pricing">
                      <Button className={`w-full rounded-full mt-2 ${plan.popular ? "gradient-primary text-primary-foreground hover:opacity-90" : ""}`} variant={plan.popular ? "default" : "outline"}>
                        {t("common.getStarted")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">{t("home.cta")}</h2>
          <p className="text-muted-foreground text-lg">{t("home.ctaDesc")}</p>
          <div className="flex justify-center gap-3">
            <Button className="gradient-primary text-primary-foreground rounded-full px-8 py-5 text-base hover:opacity-90">
              {t("common.getStarted")}
            </Button>
            {isLoggedIn && (
              <Link to="/learn">
                <Button variant="outline" className="rounded-full px-8 py-5 text-base">
                  {t("common.learning")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
