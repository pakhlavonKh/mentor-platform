import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
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
import { User, Mail, BookOpen, Bookmark, FileCheck, CreditCard, Clock, CheckCircle2, LogOut, ArrowRight, Camera } from "lucide-react";
import { api, type LearningContent, type Grant } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { GrantCard } from "@/components/GrantCard";
import { motion } from "framer-motion";
import { toast } from "sonner";
import useSavedGrants from "@/hooks/use-saved-grants";

export default function ProfilePage() {
  const { user, isLoggedIn, logout, updateProfile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [learning, setLearning] = useState<LearningContent[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const { lt } = useLocale();
  const { savedIds, toggleSave } = useSavedGrants();

  useEffect(() => {
    api.learning.list({ limit: "100" }).then((res) => setLearning(res.data)).catch(() => {});
    api.grants.list({ limit: "100" }).then((res) => setGrants(res.data)).catch(() => {});
  }, []);

  const completed = learning.filter((l) => l.completed).length;
  const progress = learning.length ? Math.round((completed / learning.length) * 100) : 0;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

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

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Bookmark className="h-5 w-5" />, label: t("profile.savedGrants"), value: String(savedIds.size) },
              { icon: <FileCheck className="h-5 w-5" />, label: t("profile.submissions"), value: String(0) },
              { icon: <CreditCard className="h-5 w-5" />, label: t("profile.documentReviews"), value: String(0) },
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

        {/* Review Status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="shadow-soft border border-border/60">
            <CardHeader>
              <h3 className="font-display font-semibold text-lg text-card-foreground">{t("profile.documentReviews")}</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{t("profile.noReviews")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("profile.purchaseReview")}</p>
                <Button variant="outline" className="mt-4 rounded-full" asChild>
                  <a href="/pricing">{t("profile.viewPackages")}</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
}
