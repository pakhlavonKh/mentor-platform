import { useTranslation } from "react-i18next";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { AuthResponse } from "@/lib/api";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, BookOpen, Bookmark, FileCheck, CreditCard, Clock, CheckCircle2, LogOut, ArrowRight, Camera, Star, Send, ExternalLink, AlertCircle, Sparkles } from "lucide-react";
import { api, type LearningContent, type Grant, type Submission, type Order, type PricingPlan, downloadAuthenticatedFile } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { GrantCard } from "@/components/GrantCard";
import { DashboardCalendar } from "@/components/DashboardCalendar";
import { ProfileCalendar } from "@/components/ProfileCalendar";
import { getTelegramPaymentUrl } from "@/lib/telegramPayment";
import { motion } from "framer-motion";
import { toast } from "sonner";
import useSavedGrants from "@/hooks/use-saved-grants";


export default function ProfilePage() {
  const { user, isLoggedIn, logout, updateProfile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [learning, setLearning] = useState<LearningContent[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const { lt } = useLocale();
  const { savedIds, toggleSave } = useSavedGrants();

  const searchParams = new URLSearchParams(location.search);
  const planIdFromQuery = searchParams.get("planId");
  const orderIdFromQuery = searchParams.get("orderId");
  const isNewOrder = searchParams.get("newOrder") === "true";

  useEffect(() => {
    api.learning.list({ limit: "100" }).then((res) => setLearning(res.data)).catch(() => {});
    api.grants.list({ limit: "100" }).then((res) => setGrants(res.data)).catch(() => {});
    api.pricing.list().then(setPricingPlans).catch(() => {});
  }, []);

  const completed = learning.filter((l) => l.completed).length;
  const progress = learning.length ? Math.round((completed / learning.length) * 100) : 0;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [docType, setDocType] = useState("motivation_letter");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    if (user?.role === "mentor" || user?.role === "tutor") {
      navigate("/mentor", { replace: true });
      return;
    }
    // fetch submissions and orders
    api.submissions.list().then((res) => setSubmissions(res.data)).catch(() => {});
    api.orders.list().then((res) => setOrders(res.data)).catch(() => {});
  }, [isLoggedIn, navigate, user?.role]);

  // Automatically create pending order if redirected from tariff selection
  useEffect(() => {
    if (!planIdFromQuery || !isLoggedIn) return;

    let active = true;
    (async () => {
      try {
        const plans = await api.pricing.list();
        const targetPlan = plans.find((p) => p.id === planIdFromQuery);
        if (targetPlan && active) {
          const created = await api.orders.create({
            pricingPlanId: targetPlan.id,
            price: targetPlan.price,
            documents: targetPlan.documents,
          });
          if (active) {
            setOrders((prev) => [created, ...prev.filter((o) => o.id !== created.id)]);
            toast.success(t("pricing.orderCreatedSuccess"));
            navigate(`/profile?orderId=${encodeURIComponent(created.id)}&newOrder=true`, { replace: true });
          }
        }
      } catch (err: any) {
        toast.error(err.message || "Ошибка создания заказа");
      }
    })();

    return () => {
      active = false;
    };
  }, [planIdFromQuery, isLoggedIn, navigate]);

  // initialize edit state from user (safe defaults if user is not yet loaded)
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [emailInput, setEmailInput] = useState(user?.email ?? "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.profilePicture || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success(t("auth.logoutSuccess") || "Logged out successfully");
    navigate("/");
  };


  const startEditing = () => setEditing(true);

  const cancelEditing = () => {
    setEditing(false);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmailInput(user.email);
  };

  const saveProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !emailInput.trim()) {
      toast.error(t("auth.invalidEmail") || "Please fill required fields");
      return;
    }
    try {
      const payload: Partial<AuthResponse> = { firstName, lastName, email: emailInput };
      if (photoFile) {
        // convert to base64
        const dataUrl = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(String(reader.result));
          reader.onerror = rej;
          reader.readAsDataURL(photoFile);
        });
        // assign profilePicture as data URL
        (payload as Partial<AuthResponse>).profilePicture = dataUrl;
      }
      await updateProfile(payload);
      toast.success(t("profile.editSuccess") || "Profile updated");
      setEditing(false);
    } catch (err) {
      const e = err as { status?: number; body?: { message?: string }; message?: string };
      console.error("Profile update error:", e);
      const bodyMessage = e?.body?.message || e?.message;
      if (e?.status === 413) {
        toast.error(t("errors.serverError") || bodyMessage || "Profile image too large");
      } else if (e?.status === 404) {
        toast.error(bodyMessage || "Not found (404)");
      } else if (e?.status && e.status >= 500) {
        toast.error(bodyMessage || "Server error");
      } else {
        toast.error(bodyMessage || (e?.message ?? "Error updating profile"));
      }
    }
  };

  const getPlanName = (pricingPlanId: string) => {
    const p = pricingPlans.find((plan) => plan.id === pricingPlanId);
    return p ? lt(p.name) : "Тариф StudyQadam";
  };

  const completedOrders = orders.filter((o) => o.status === "completed");
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const activeOrderToPay = orderIdFromQuery
    ? orders.find((o) => o.id === orderIdFromQuery && o.status === "pending") || pendingOrders[0]
    : pendingOrders[0];

  const totalReviewsAllowed = completedOrders.reduce((sum, o) => sum + (o.documents || 0), 0);
  const reviewsUsed = submissions.length;
  const reviewsRemaining = Math.max(0, totalReviewsAllowed - reviewsUsed);
  const hasActivePlan = totalReviewsAllowed > 0;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-soft border-0 gradient-card overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative h-20 w-20 rounded-full gradient-primary flex items-center justify-center shadow-elevated overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User className="h-9 w-9 text-primary-foreground" />
                    </div>
                  )}

                  {editing && (
                    <label className="absolute inset-0 flex items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setPhotoFile(f);
                          if (f) {
                            const url = URL.createObjectURL(f);
                            setPhotoPreview(url);
                          } else {
                            setPhotoPreview(user.profilePicture || null);
                          }
                        }}
                      />
                      <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg hover:opacity-90">
                        <Camera className="h-4 w-4" />
                      </div>
                    </label>
                  )}
                </div>
                <div className="text-center sm:text-left flex-1">
                  {!editing ? (
                    <h1 className="font-display text-2xl font-bold text-card-foreground">{user.firstName} {user.lastName}</h1>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <Mail className="h-3.5 w-3.5" /> {!editing ? user.email : <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                    <Badge className="rounded-full capitalize">{user.role}</Badge>
                    {savedIds.size > 0 && (
                      <Badge variant="secondary" className="rounded-full">{t("profile.savedGrants")}: {savedIds.size}</Badge>
                    )}
                    {/* file input handled via avatar circle button */}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!editing ? (
                    <Button variant="outline" className="rounded-full" onClick={startEditing}>{t("common.editProfile")}</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="secondary" className="rounded-full" onClick={cancelEditing}>{t("common.cancel")}</Button>
                      <Button variant="default" className="rounded-full" onClick={saveProfile}>{t("common.save")}</Button>
                    </div>
                  )}
                  <Button variant="destructive" className="rounded-full gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    {t("common.logout")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Order Payment Callout */}
        {activeOrderToPay && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-card shadow-elevated p-6 sm:p-7"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs font-semibold px-3 py-1">
                    ⏳ Ожидает оплаты (денежный перевод)
                  </Badge>
                  {isNewOrder && (
                    <Badge className="gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1">
                      Новый заказ
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground font-mono">
                    #{activeOrderToPay.id.slice(0, 8)}
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Тариф «{getPlanName(activeOrderToPay.pricingPlanId)}»
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Для оплаты перейдите в наш официальный Telegram. Сообщение с деталями вашего заказа уже сформировано. Отправьте его нашему менеджеру и сделайте перевод — после этого администратор сразу активирует ваш тариф на платформе.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs sm:text-sm">
                  <span className="flex items-center gap-1.5 bg-secondary/70 px-3 py-1.5 rounded-lg border border-border/70 text-foreground font-medium">
                    <CreditCard className="h-4 w-4 text-primary" /> К оплате: <strong className="text-primary font-bold">${activeOrderToPay.price}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 bg-secondary/70 px-3 py-1.5 rounded-lg border border-border/70 text-foreground font-medium">
                    <FileCheck className="h-4 w-4 text-primary" /> Включено проверок: <strong>{activeOrderToPay.documents}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                <a
                  href={getTelegramPaymentUrl({
                    orderId: activeOrderToPay.id,
                    planName: getPlanName(activeOrderToPay.pricingPlanId),
                    price: activeOrderToPay.price,
                    documents: activeOrderToPay.documents,
                    user,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    size="lg"
                    className="w-full bg-[#229ED9] hover:bg-[#1E88C7] text-white font-semibold rounded-xl shadow-md gap-2.5 px-6 py-6 text-base transition-all hover:scale-[1.02]"
                  >
                    <Send className="h-5 w-5 fill-white" />
                    Оплатить через Telegram
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Bookmark className="h-5 w-5" />, label: t("profile.savedGrants"), value: String(savedIds.size) },
              { icon: <FileCheck className="h-5 w-5" />, label: t("profile.submissions"), value: String(submissions.length) },
              { icon: <CreditCard className="h-5 w-5" />, label: t("profile.documentReviews"), value: String(orders.length) },
              { icon: <BookOpen className="h-5 w-5" />, label: t("learning.overallProgress"), value: `${progress}%` },
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

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <ProfileCalendar />
        </motion.div>

        {/* Learning Progress */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="shadow-soft border border-border/60">
            <CardHeader>
              <h3 className="font-display font-semibold text-lg text-card-foreground">{t("dashboard.lessonsCompleted")}</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{t("learning.overallProgress")}</span>
                  <span className="font-medium text-card-foreground">{completed}/{learning.length} {t("learning.completed")}</span>
                </div>
                <Progress value={progress} className="h-2.5" />
              </div>
              <Separator />
              <div className="space-y-3">
                {learning.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-3 text-sm">
                    {lesson.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={lesson.completed ? "text-card-foreground" : "text-muted-foreground"}>{lt(lesson.title)}</span>
                    <Badge variant="secondary" className="ml-auto text-xs rounded-full">{lesson.duration}</Badge>
                  </div>
                ))}
              </div>
              <Separator />
              <Link to="/learn">
                <Button variant="outline" className="w-full rounded-full gap-2">
                  <BookOpen className="h-4 w-4" /> {t("common.learning")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Saved Grants */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-display font-semibold text-lg text-foreground mb-4">{t("profile.savedGrants")}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {grants.filter((g) => savedIds.has(g.id)).slice(0, 4).map((grant) => (
              <GrantCard
                key={grant.id}
                grant={grant}
                saved={true}
                onSave={() =>
                  toggleSave(grant.id, (added) => {
                    if (added) toast.success(t("common.save") || "Saved");
                    else toast.success(t("common.delete") || "Removed");
                  })
                }
              />
            ))}
            {grants.filter((g) => savedIds.has(g.id)).length === 0 && (
              <p className="text-muted-foreground">{t("profile.noSavedGrants")}</p>
            )}
          </div>
        </motion.div>

        {/* Review Status & Submissions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="shadow-soft border border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <h3 className="font-display font-semibold text-lg text-card-foreground">
                  {t("profile.documentReviews") || "Document Mentorship & Reviews"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submit your essays and CVs to receive detailed feedback from expert mentors.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Active Package Quota / Notice */}
              <div className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm bg-muted/20">
                {hasActivePlan ? (
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>
                      Активный тариф • Доступно проверок ментором: <strong>{reviewsRemaining}</strong> (использовано {reviewsUsed} из {totalReviewsAllowed})
                    </span>
                  </div>
                ) : pendingOrders.length > 0 ? (
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>
                      Заказ тарифа ожидает подтверждения оплаты в Telegram. После активации администратором вам станут доступны проверки.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      Для проверки документов менторами выберите подходящий тариф.
                    </span>
                  </div>
                )}

                <Link to="/pricing" className="shrink-0">
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-lg">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Все тарифы
                  </Button>
                </Link>
              </div>

              {/* Modern Upload Form */}
              <div className="p-5 bg-muted/30 border border-border/60 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm text-foreground">Submit New Document for Review</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Document Type</label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motivation_letter">Motivation Letter / Statement of Purpose</SelectItem>
                        <SelectItem value="cv_resume">CV / Resume</SelectItem>
                        <SelectItem value="recommendation_letter">Recommendation Letter</SelectItem>
                        <SelectItem value="research_proposal">Research Proposal</SelectItem>
                        <SelectItem value="other">Other Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Target University / Scholarship</label>
                    <Input
                      id="upload-target-uni"
                      placeholder="e.g. Oxford MSc CS, DAAD, Fulbright..."
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Questions or Notes for Mentor (Optional)</label>
                  <Input
                    id="upload-student-notes"
                    placeholder="e.g. Please check if my leadership paragraph sounds persuasive..."
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Attach Document (.pdf, .docx, .doc)</label>
                  <Input
                    id="submission-files"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="text-xs file:text-xs file:font-medium h-9"
                  />
                </div>

                <div className="pt-1 flex justify-end">
                  <Button
                    size="sm"
                    className="gap-2 font-medium shadow-sm"
                    onClick={async () => {
                      const input = document.getElementById("submission-files") as HTMLInputElement | null;
                      const targetUni = (document.getElementById("upload-target-uni") as HTMLInputElement | null)?.value;
                      const notes = (document.getElementById("upload-student-notes") as HTMLInputElement | null)?.value;

                      if (!input || !input.files || input.files.length === 0) {
                        toast.error("Please select a document file to upload");
                        return;
                      }

                      const form = new FormData();
                      for (let i = 0; i < input.files.length; i++) {
                        form.append("files", input.files[i]);
                      }
                      if (docType) form.append("documentType", docType);
                      if (targetUni) form.append("targetUniversity", targetUni);
                      if (notes) form.append("studentNotes", notes);

                      try {
                        await api.submissions.upload(form);
                        toast.success("Document submitted! A mentor will review it shortly.");
                        input.value = "";
                        const uniInput = document.getElementById("upload-target-uni") as HTMLInputElement | null;
                        if (uniInput) uniInput.value = "";
                        const notesInput = document.getElementById("upload-student-notes") as HTMLInputElement | null;
                        if (notesInput) notesInput.value = "";

                        const res = await api.submissions.list();
                        setSubmissions(res.data);
                      } catch (err) {
                        const e = err as Error;
                        toast.error(e.message || "Upload failed");
                      }
                    }}
                  >
                    <FileCheck className="h-4 w-4" />
                    Submit for Review
                  </Button>
                </div>
              </div>

              {/* Submissions List */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-foreground">Your Submissions & Feedback</h4>

                {submissions.map((s) => {
                  const isCompleted = s.status === "completed";
                  const isInReview = s.status === "in_review";
                  const isPending = s.status === "pending";

                  const getDocLabel = (type?: string) => {
                    switch (type) {
                      case "motivation_letter": return "Motivation Letter";
                      case "cv_resume": return "CV / Resume";
                      case "recommendation_letter": return "Recommendation Letter";
                      case "research_proposal": return "Research Proposal";
                      default: return type || "Application Document";
                    }
                  };

                  return (
                    <div key={s.id} className="p-4 sm:p-5 border border-border/60 rounded-xl space-y-3 bg-card shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">
                              {getDocLabel(s.documentType)}
                            </span>
                            {isCompleted && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-xs">
                                Feedback Ready
                              </Badge>
                            )}
                            {isInReview && (
                              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 text-xs">
                                Under Review by Mentor
                              </Badge>
                            )}
                            {isPending && (
                              <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/20 text-xs">
                                Waiting for Mentor
                              </Badge>
                            )}
                            {s.status === "rejected" && (
                              <Badge variant="destructive" className="text-xs">
                                Revision Requested
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Target: <span className="text-foreground font-medium">{s.targetUniversity || "General Review"}</span> • Submitted {new Date(s.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Download Original File */}
                        {s.files && s.files.length > 0 && (
                          <div className="flex items-center gap-2">
                            {s.files.map((file, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                                onClick={async () => {
                                  if (!file?.url) return;
                                  try {
                                    await downloadAuthenticatedFile(file.url, file.originalName || "document");
                                  } catch {
                                    toast.error("Download failed");
                                  }
                                }}
                              >
                                <FileCheck className="h-3.5 w-3.5 text-primary" />
                                <span className="max-w-[140px] truncate">{file.originalName}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes if provided */}
                      {s.studentNotes && (
                        <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded border border-border/40">
                          <span className="font-semibold text-foreground">Your Notes:</span> {s.studentNotes}
                        </p>
                      )}

                      {/* Mentor Feedback Section */}
                      {s.feedback && (
                        <div className="mt-3 p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span className="font-semibold text-xs text-foreground">
                                Mentor Feedback {s.reviewer ? `by ${s.reviewer.firstName} ${s.reviewer.lastName}` : ""}
                              </span>
                            </div>
                            {s.rating && (
                              <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                                <Star className="h-3.5 w-3.5 fill-amber-500" />
                                {s.rating} / 5
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {s.feedback}
                          </p>

                          {/* Mentor annotated files */}
                          {s.feedbackFiles && s.feedbackFiles.length > 0 && (
                            <div className="pt-2 flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-foreground">Annotated Feedback File:</span>
                              {s.feedbackFiles.map((ff, idx) => (
                                <Button
                                  key={idx}
                                  variant="secondary"
                                  size="sm"
                                  className="h-7 text-xs gap-1.5 shadow-sm"
                                  onClick={async () => {
                                    if (!ff?.url) return;
                                    try {
                                      await downloadAuthenticatedFile(ff.url, ff.originalName || "feedback-document");
                                    } catch {
                                      toast.error("Download failed");
                                    }
                                  }}
                                >
                                  <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                                  <span className="max-w-[160px] truncate">{ff.originalName}</span>
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {submissions.length === 0 && (
                  <div className="text-center py-8">
                    <FileCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">{t("profile.noReviews") || "No documents submitted yet."}</p>
                    <p className="text-xs text-muted-foreground mt-1">Upload your motivation letter or CV above to get started.</p>
                  </div>
                )}
              </div>

              {/* Order History */}
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-3">Your Orders & Packages</h4>
                <div className="space-y-2.5">
                  {orders.map((o) => {
                    const isPending = o.status === "pending";
                    const isCompleted = o.status === "completed";
                    const planTitle = getPlanName(o.pricingPlanId);
                    const telegramUrl = getTelegramPaymentUrl({
                      orderId: o.id,
                      planName: planTitle,
                      price: o.price,
                      documents: o.documents,
                      user,
                    });

                    return (
                      <div key={o.id} className="p-4 border border-border/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-card shadow-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">
                              {planTitle}
                            </span>
                            <span className="text-muted-foreground font-mono">
                              #{o.id.slice(0, 8)}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            ${o.price} • {o.documents} {o.documents === 1 ? "проверка" : "проверок"} • {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {isPending && (
                            <>
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                                Ожидает оплаты
                              </Badge>
                              <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="h-8 text-xs bg-[#229ED9] hover:bg-[#1E88C7] text-white gap-1.5 rounded-lg shadow-sm">
                                  <Send className="h-3.5 w-3.5 fill-white" />
                                  Оплатить в Telegram
                                </Button>
                              </a>
                            </>
                          )}
                          {isCompleted && (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium">
                              ✅ Тариф активирован
                            </Badge>
                          )}
                          {!isPending && !isCompleted && (
                            <Badge variant="outline" className="capitalize">
                              {o.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {orders.length === 0 && (
                    <p className="text-xs text-muted-foreground">No review packages purchased yet.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
}
