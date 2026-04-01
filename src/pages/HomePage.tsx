import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GrantCard } from "@/components/GrantCard";
import { mockGrants, pricingPlans } from "@/data/mockData";
import { Search, GraduationCap, FileText, Globe, ArrowRight, CheckCircle2, Star, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const services = [
  { icon: <FileText className="h-6 w-6" />, title: "Essay Review", desc: "Get expert feedback on your motivation letter and personal statement" },
  { icon: <GraduationCap className="h-6 w-6" />, title: "CV Review", desc: "Professional CV optimization for scholarship applications" },
  { icon: <Globe className="h-6 w-6" />, title: "English Prep", desc: "Improve your academic writing and interview skills" },
];

const steps = [
  { num: "01", title: "Browse", desc: "Find scholarships matching your profile" },
  { num: "02", title: "Prepare", desc: "Learn with our guided lessons" },
  { num: "03", title: "Submit", desc: "Upload documents for expert review" },
  { num: "04", title: "Succeed", desc: "Get feedback and apply with confidence" },
];

export default function HomePage() {
  return (
    <PageLayout noPadding>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
                <Badge variant="secondary" className="rounded-full px-4 py-1.5 font-body text-xs">
                  <Star className="h-3 w-3 mr-1 fill-current" /> Trusted by 2,000+ students
                </Badge>
                <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                  Your Path to <span className="text-primary italic">Scholarships</span> Starts Here
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Find grants, prepare winning applications, and get expert feedback — all in one platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search scholarships..." className="pl-9 rounded-full bg-background" />
                  </div>
                  <Button className="gradient-primary text-primary-foreground rounded-full px-6 hover:opacity-90">
                    Explore <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> 500+ Grants</span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> Expert Reviews</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary" /> Free Lessons</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:block"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                  <img src={heroImage} alt="Student studying abroad" width={1920} height={1080} className="w-full h-auto object-cover" />
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
            <motion.h2 custom={0} variants={fadeUp} className="font-display text-3xl font-bold text-foreground">Our Services</motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground mt-3 max-w-md mx-auto">Professional support at every step of your scholarship journey</motion.p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground">Latest Grants</h2>
              <p className="text-muted-foreground mt-1">Fresh opportunities updated daily</p>
            </div>
            <Link to="/grants">
              <Button variant="outline" className="rounded-full hidden sm:flex">
                View All <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-5">
            {mockGrants.slice(0, 4).map((grant, i) => (
              <motion.div key={grant.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <GrantCard grant={grant} />
              </motion.div>
            ))}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <Link to="/grants"><Button variant="outline" className="rounded-full">View All Grants</Button></Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground mt-3">Four simple steps to your dream scholarship</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.num} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="text-center space-y-3">
                  <span className="font-display text-4xl font-bold text-primary/20">{step.num}</span>
                  <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
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
          <h2 className="font-display text-3xl font-bold text-foreground">Expert Review Packages</h2>
          <p className="text-muted-foreground mt-3 mb-8 max-w-md mx-auto">Professional feedback to make your application stand out</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className={`border shadow-soft hover:shadow-hover transition-all h-full ${plan.popular ? "border-primary ring-1 ring-primary/20 shadow-elevated relative" : "border-border/60"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-primary text-primary-foreground rounded-full px-3">Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8 text-center space-y-4">
                    <h3 className="font-display text-lg font-semibold text-card-foreground">{plan.name}</h3>
                    <div>
                      <span className="font-display text-4xl font-bold text-card-foreground">${plan.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.documents} document{plan.documents > 1 ? "s" : ""} reviewed</p>
                    <Link to="/pricing">
                      <Button className={`w-full rounded-full mt-2 ${plan.popular ? "gradient-primary text-primary-foreground hover:opacity-90" : ""}`} variant={plan.popular ? "default" : "outline"}>
                        Get Started
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
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground text-lg">Join thousands of students who found their dream scholarship through GrantPath.</p>
          <div className="flex justify-center gap-3">
            <Button className="gradient-primary text-primary-foreground rounded-full px-8 py-5 text-base hover:opacity-90">
              Get Started Free
            </Button>
            <Link to="/learn">
              <Button variant="outline" className="rounded-full px-8 py-5 text-base">
                Browse Lessons
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
