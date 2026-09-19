import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  FileCheck,
  Clock,
  Star,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Upload,
  MessageSquare,
  FileText,
  Building2,
  HelpCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { api, type Submission, type Pagination, downloadAuthenticatedFile } from "@/lib/api";
import { toast } from "sonner";
import { DynamicDocumentViewer, type ViewerFileItem } from "@/components/DynamicDocumentViewer";

export default function MentorDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"active" | "pool" | "completed">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewingSubmission, setReviewingSubmission] = useState<Submission | null>(null);

  // Form state for review feedback modal
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [reviewStatus, setReviewStatus] = useState<"completed" | "rejected">("completed");
  const [feedbackFile, setFeedbackFile] = useState<File | null>(null);

  // Dynamic In-Browser Document Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFiles, setViewerFiles] = useState<ViewerFileItem[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerTitle, setViewerTitle] = useState("");

  const handleOpenViewer = (files: ViewerFileItem[], index = 0, title = "") => {
    setViewerFiles(files);
    setViewerIndex(index);
    setViewerTitle(title);
    setViewerOpen(true);
  };

  // Queries
  const { data: poolData, isLoading: isPoolLoading } = useQuery<{ data: Submission[]; pagination: Pagination }>({
    queryKey: ["mentor-pool-submissions"],
    queryFn: () => api.submissions.pool(),
  });

  const { data: myReviewsData, isLoading: isMyReviewsLoading } = useQuery<{ data: Submission[]; pagination: Pagination }>({
    queryKey: ["mentor-my-submissions"],
    queryFn: () => api.submissions.reviewerMy(),
  });

  const poolSubmissions = poolData?.data || [];
  const mySubmissions = myReviewsData?.data || [];

  const activeReviews = mySubmissions.filter((s) => s.status === "in_review" || s.status === "pending");
  const completedReviews = mySubmissions.filter((s) => s.status === "completed" || s.status === "rejected");

  // Mutations
  const claimMutation = useMutation({
    mutationFn: (id: string) => api.submissions.claim(id),
    onSuccess: () => {
      toast.success(t("mentor.claimSuccess"));
      queryClient.invalidateQueries({ queryKey: ["mentor-pool-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-my-submissions"] });
      setActiveTab("active");
    },
    onError: (err: any) => toast.error(err.message || t("mentor.claimError")),
  });

  const unclaimMutation = useMutation({
    mutationFn: (id: string) => api.submissions.unclaim(id),
    onSuccess: () => {
      toast.success(t("mentor.unclaimSuccess"));
      queryClient.invalidateQueries({ queryKey: ["mentor-pool-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-my-submissions"] });
    },
    onError: (err: any) => toast.error(err.message || t("mentor.unclaimError")),
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: FormData }) => {
      return api.submissions.addFeedback(id, form);
    },
    onSuccess: () => {
      toast.success(t("mentor.feedbackSuccess"));
      setReviewingSubmission(null);
      setFeedbackText("");
      setFeedbackFile(null);
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["mentor-my-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-pool-submissions"] });
    },
    onError: (err: any) => toast.error(err.message || t("mentor.feedbackError")),
  });

  const handleOpenReviewModal = (submission: Submission) => {
    setReviewingSubmission(submission);
    setFeedbackText(submission.feedback || "");
    setRating(submission.rating || 5);
    setReviewStatus(submission.status === "rejected" ? "rejected" : "completed");
    setFeedbackFile(null);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSubmission) return;
    if (!feedbackText.trim()) {
      toast.error(t("mentor.feedbackRequired"));
      return;
    }

    const form = new FormData();
    form.append("feedback", feedbackText.trim());
    form.append("status", reviewStatus);
    form.append("rating", String(rating));
    if (feedbackFile) {
      form.append("files", feedbackFile);
    }

    feedbackMutation.mutate({ id: reviewingSubmission.id, form });
  };

  const getDocTypeLabel = (type?: string | null) => {
    switch (type) {
      case "motivation_letter":
        return t("mentor.docTypeMotivation");
      case "cv_resume":
        return t("mentor.docTypeCv");
      case "recommendation_letter":
        return t("mentor.docTypeRecommendation");
      case "research_proposal":
        return t("mentor.docTypeResearch");
      default:
        return type || t("mentor.docTypeGeneral");
    }
  };

  // Filter lists based on search
  const filterSubmissions = (list: Submission[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.user?.firstName.toLowerCase().includes(q) ||
        s.user?.lastName.toLowerCase().includes(q) ||
        s.user?.email.toLowerCase().includes(q) ||
        s.targetUniversity?.toLowerCase().includes(q) ||
        s.documentType?.toLowerCase().includes(q)
    );
  };

  const filteredActive = filterSubmissions(activeReviews);
  const filteredPool = filterSubmissions(poolSubmissions);
  const filteredCompleted = filterSubmissions(completedReviews);

  const averageRating =
    completedReviews.length > 0
      ? (completedReviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / completedReviews.length).toFixed(1)
      : "5.0";

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/95 via-primary to-indigo-700 p-6 sm:p-8 text-primary-foreground shadow-lg">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{t("mentor.portalBadge")}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("mentor.welcome", { name: user?.firstName || "Mentor" })}
            </h1>
            <p className="text-primary-foreground/85 max-w-xl text-sm sm:text-base">
              {t("mentor.headerDesc")}
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-30px] opacity-10 pointer-events-none">
            <Users className="w-64 h-64" />
          </div>
        </div>

        {/* Stats Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("mentor.activeInReview")}</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{activeReviews.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("mentor.availablePool")}</p>
                <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{poolSubmissions.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <FileCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("mentor.completed")}</p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{completedReviews.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("mentor.avgRating")}</p>
                <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{averageRating} / 5.0</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Star className="h-5 w-5 fill-amber-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Review Workspace */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="active" className="gap-2 text-xs sm:text-sm">
                  {t("mentor.tabActive")}
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] rounded-full">
                    {activeReviews.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pool" className="gap-2 text-xs sm:text-sm">
                  {t("mentor.tabPool")}
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] rounded-full bg-amber-500/10 text-amber-600">
                    {poolSubmissions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2 text-xs sm:text-sm">
                  {t("mentor.tabArchive", { count: completedReviews.length })}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("mentor.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>

          {/* Tab 1: Active Claimed Reviews */}
          {activeTab === "active" && (
            <div className="space-y-4">
              {isMyReviewsLoading ? (
                <div className="text-center py-12 text-muted-foreground">{t("mentor.loadingActive")}</div>
              ) : filteredActive.length === 0 ? (
                <Card className="border-dashed border-2 p-12 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-semibold text-base text-foreground">{t("mentor.noActiveTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {t("mentor.noActiveDesc")}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => setActiveTab("pool")}>
                    <FileCheck className="h-4 w-4" /> {t("mentor.goToPool")}
                  </Button>
                </Card>
              ) : (
                filteredActive.map((sub) => (
                  <Card key={sub.id} className="border border-border/60 shadow-sm hover:border-primary/40 transition-all">
                    <CardContent className="p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0 mt-0.5">
                            {sub.user?.firstName?.[0] || "S"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground text-base">
                                {sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : t("mentor.student")}
                              </span>
                              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-0 text-xs">
                                {t("mentor.statusInReview")}
                              </Badge>
                              <Badge variant="outline" className="text-xs font-normal">
                                {getDocTypeLabel(sub.documentType)}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {t("mentor.email")}: {sub.user?.email || "N/A"} • {t("mentor.submittedOn", { date: new Date(sub.createdAt).toLocaleDateString() })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unclaimMutation.mutate(sub.id)}
                            disabled={unclaimMutation.isPending}
                            className="text-xs text-muted-foreground hover:text-destructive"
                          >
                            {t("mentor.release")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOpenReviewModal(sub)}
                            className="text-xs gap-1.5 font-medium shadow-sm"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {t("mentor.provideFeedback")}
                          </Button>
                        </div>
                      </div>

                      {/* University & Student Notes */}
                      <div className="grid sm:grid-cols-2 gap-3 bg-muted/40 p-3.5 rounded-lg border border-border/40 text-xs">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">{t("mentor.targetUniversity")}</span>
                            <p className="text-muted-foreground mt-0.5">{sub.targetUniversity || t("mentor.notSpecified")}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <HelpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">{t("mentor.studentNotes")}</span>
                            <p className="text-muted-foreground mt-0.5">{sub.studentNotes || t("mentor.noStudentNotes")}</p>
                          </div>
                        </div>
                      </div>

                      {/* Files to preview or download */}
                      {sub.files && sub.files.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <span className="text-xs font-medium text-foreground mr-1">{t("mentor.attachedFiles")}</span>
                          {sub.files.map((file, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center rounded-lg border border-border/70 bg-card hover:bg-secondary/40 hover:border-primary/40 transition-colors p-1 pl-2.5 gap-2 text-xs shadow-2xs"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenViewer(
                                    sub.files,
                                    idx,
                                    `${sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "Student"} • ${getDocTypeLabel(sub.documentType)}`
                                  )
                                }
                                className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors text-left"
                                title={t("viewer.viewDocument")}
                              >
                                <Eye className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="max-w-[170px] truncate">{file.originalName}</span>
                              </button>
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!file.url) return;
                                  try {
                                    await downloadAuthenticatedFile(file.url, file.originalName || "document");
                                  } catch {
                                    toast.error(t("mentor.downloadFailed"));
                                  }
                                }}
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                title={t("viewer.download")}
                              >
                                <Download className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Available Pool */}
          {activeTab === "pool" && (
            <div className="space-y-4">
              {isPoolLoading ? (
                <div className="text-center py-12 text-muted-foreground">{t("mentor.loadingPool")}</div>
              ) : filteredPool.length === 0 ? (
                <Card className="border-dashed border-2 p-12 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500/50 mx-auto mb-3" />
                  <h3 className="font-semibold text-base text-foreground">{t("mentor.poolCaughtUpTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {t("mentor.poolCaughtUpDesc")}
                  </p>
                </Card>
              ) : (
                filteredPool.map((sub) => (
                  <Card key={sub.id} className="border border-border/60 shadow-sm hover:border-border/90 transition-all">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-sm shrink-0 mt-0.5">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground text-sm">
                                {sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : t("mentor.studentSubmission")}
                              </span>
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                                {t("mentor.waitingForReviewer")}
                              </Badge>
                              <Badge variant="secondary" className="text-xs font-normal">
                                {getDocTypeLabel(sub.documentType)}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Target: <span className="text-foreground font-medium">{sub.targetUniversity || t("mentor.generalReview")}</span> • {t("mentor.submittedOn", { date: new Date(sub.createdAt).toLocaleDateString() })}
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => claimMutation.mutate(sub.id)}
                          disabled={claimMutation.isPending}
                          className="gap-1.5 text-xs font-medium shrink-0 shadow-sm"
                        >
                          <FileCheck className="h-3.5 w-3.5" />
                          {t("mentor.claimReview")}
                        </Button>
                      </div>

                      {sub.studentNotes && (
                        <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded border border-border/40">
                          <span className="font-semibold text-foreground">{t("mentor.notesLabel")}</span> {sub.studentNotes}
                        </p>
                      )}

                      {/* Pool attached files preview */}
                      {sub.files && sub.files.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <span className="text-xs font-medium text-foreground mr-1">{t("mentor.attachedFiles")}</span>
                          {sub.files.map((file, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                handleOpenViewer(
                                  sub.files,
                                  idx,
                                  `${sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "Student"} • ${getDocTypeLabel(sub.documentType)}`
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/70 bg-card hover:bg-secondary/40 hover:border-primary/40 font-medium text-xs text-foreground hover:text-primary transition-colors"
                              title={t("viewer.viewDocument")}
                            >
                              <Eye className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="max-w-[180px] truncate">{file.originalName}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Completed Reviews */}
          {activeTab === "completed" && (
            <div className="space-y-4">
              {filteredCompleted.length === 0 ? (
                <Card className="border-dashed border-2 p-12 text-center">
                  <div className="text-muted-foreground text-sm">{t("mentor.noCompleted")}</div>
                </Card>
              ) : (
                filteredCompleted.map((sub) => (
                  <Card key={sub.id} className="border border-border/60 shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">
                                {sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : t("mentor.student")}
                              </span>
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-xs">
                                {t("mentor.completed")}
                              </Badge>
                              <div className="flex items-center gap-1 ml-2 text-amber-500 text-xs font-medium">
                                <Star className="h-3.5 w-3.5 fill-amber-500" />
                                {sub.rating || 5}/5
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {getDocTypeLabel(sub.documentType)} • {t("mentor.reviewedOn", { date: sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleDateString() : new Date(sub.updatedAt).toLocaleDateString() })}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReviewModal(sub)}
                          className="text-xs gap-1.5"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          {t("mentor.updateFeedback")}
                        </Button>
                      </div>

                      {sub.feedback && (
                        <div className="bg-muted/40 p-3 rounded-lg border border-border/40 text-xs space-y-1">
                          <span className="font-semibold text-foreground">{t("mentor.yourFeedback")}</span>
                          <p className="text-muted-foreground whitespace-pre-wrap">{sub.feedback}</p>
                        </div>
                      )}

                      {/* Completed files preview */}
                      {((sub.files && sub.files.length > 0) || (sub.feedbackFiles && sub.feedbackFiles.length > 0)) && (
                        <div className="flex items-center gap-3 flex-wrap pt-1 text-xs">
                          {sub.files && sub.files.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-foreground">{t("mentor.attachedFiles")}</span>
                              {sub.files.map((file, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() =>
                                    handleOpenViewer(
                                      sub.files,
                                      idx,
                                      `${sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "Student"} • ${getDocTypeLabel(sub.documentType)}`
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border/70 bg-card hover:border-primary/40 text-xs text-foreground hover:text-primary"
                                >
                                  <Eye className="h-3 w-3 text-primary" />
                                  <span className="max-w-[140px] truncate">{file.originalName}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {sub.feedbackFiles && sub.feedbackFiles.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">Annotated:</span>
                              {sub.feedbackFiles.map((file, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() =>
                                    handleOpenViewer(
                                      sub.feedbackFiles!,
                                      idx,
                                      `Annotated Feedback • ${sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "Student"}`
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs text-foreground hover:text-emerald-600"
                                >
                                  <Eye className="h-3 w-3 text-emerald-600" />
                                  <span className="max-w-[140px] truncate">{file.originalName}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* Provide Review & Feedback Dialog */}
        <Dialog open={!!reviewingSubmission} onOpenChange={(open) => !open && setReviewingSubmission(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {t("mentor.dialogTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t("mentor.dialogReviewing")} <span className="font-semibold text-foreground">{getDocTypeLabel(reviewingSubmission?.documentType)}</span> {t("mentor.dialogFor")}{" "}
                <span className="font-semibold text-foreground">{reviewingSubmission?.user?.firstName} {reviewingSubmission?.user?.lastName}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-2">
              {/* Student Target & Notes overview */}
              <div className="bg-muted/50 p-3.5 rounded-lg border border-border/50 text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-foreground">Target: </span>
                    <span className="text-muted-foreground">{reviewingSubmission?.targetUniversity || t("mentor.notSpecified")}</span>
                  </div>
                  {reviewingSubmission?.studentNotes && (
                    <div>
                      <span className="font-semibold text-foreground">{t("mentor.studentNotes")} </span>
                      <span className="text-muted-foreground">{reviewingSubmission.studentNotes}</span>
                    </div>
                  )}
                </div>

                {/* Attached student documents to preview directly inside modal */}
                {reviewingSubmission?.files && reviewingSubmission.files.length > 0 && (
                  <div className="pt-1 border-t border-border/40 flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">Review Document:</span>
                    {reviewingSubmission.files.map((file, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleOpenViewer(
                            reviewingSubmission.files,
                            idx,
                            `Reviewing ${file.originalName} for ${reviewingSubmission.user?.firstName}`
                          )
                        }
                        className="h-7 text-xs gap-1.5 font-medium bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="max-w-[180px] truncate">{file.originalName}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("mentor.evaluationScore")}</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded-md transition-colors ${
                        rating >= star ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-amber-400"
                      }`}
                    >
                      <Star className={`h-5 w-5 ${rating >= star ? "fill-amber-500" : ""}`} />
                    </button>
                  ))}
                  <span className="text-xs font-medium text-muted-foreground ml-2">
                    {rating === 5 ? t("mentor.scoreExcellent") : rating >= 4 ? t("mentor.scoreGood") : rating >= 3 ? t("mentor.scoreSatisfactory") : t("mentor.scoreNeedsRevision")}
                  </span>
                </div>
              </div>

              {/* Detailed Written Feedback */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("mentor.writtenFeedbackLabel")}</label>
                <Textarea
                  rows={6}
                  placeholder={t("mentor.writtenFeedbackPlaceholder")}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Upload Annotated Review File */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("mentor.attachFileLabel")}</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFeedbackFile(e.target.files?.[0] || null)}
                    className="text-xs file:text-xs file:font-medium"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">{t("mentor.attachFileHelp")}</p>
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button type="button" variant="outline" onClick={() => setReviewingSubmission(null)}>
                  {t("mentor.cancel")}
                </Button>
                <Button type="submit" disabled={feedbackMutation.isPending} className="gap-2">
                  {feedbackMutation.isPending ? t("mentor.submitting") : t("mentor.sendReview")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dynamic In-Browser Document Viewer */}
        <DynamicDocumentViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          files={viewerFiles}
          initialIndex={viewerIndex}
          title={viewerTitle}
        />
      </div>
    </AppLayout>
  );
}
