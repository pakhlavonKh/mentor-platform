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
} from "lucide-react";
import { api, type Submission, type Pagination, downloadAuthenticatedFile } from "@/lib/api";
import { toast } from "sonner";

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
      toast.success("Submission claimed successfully! It is now in your Active Reviews.");
      queryClient.invalidateQueries({ queryKey: ["mentor-pool-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-my-submissions"] });
      setActiveTab("active");
    },
    onError: (err: any) => toast.error(err.message || "Failed to claim submission"),
  });

  const unclaimMutation = useMutation({
    mutationFn: (id: string) => api.submissions.unclaim(id),
    onSuccess: () => {
      toast.success("Submission released back to the general pool.");
      queryClient.invalidateQueries({ queryKey: ["mentor-pool-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-my-submissions"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to unclaim submission"),
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: FormData }) => {
      return api.submissions.addFeedback(id, form);
    },
    onSuccess: () => {
      toast.success("Feedback submitted and student notified!");
      setReviewingSubmission(null);
      setFeedbackText("");
      setFeedbackFile(null);
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["mentor-my-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-pool-submissions"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to submit feedback"),
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
      toast.error("Please enter written feedback for the student.");
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
        return "Motivation Letter / SOP";
      case "cv_resume":
        return "CV / Resume";
      case "recommendation_letter":
        return "Recommendation Letter";
      case "research_proposal":
        return "Research Proposal";
      default:
        return type || "Application Document";
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
              <span>StudyQadam Mentor Portal</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("mentor.welcome") || `Welcome, ${user?.firstName || "Mentor"}!`}
            </h1>
            <p className="text-primary-foreground/85 max-w-xl text-sm sm:text-base">
              Review student application essays, evaluate CVs, and deliver personalized mentorship feedback.
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
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active In-Review</p>
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
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available Pool</p>
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
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed</p>
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
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Rating</p>
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
                  Active Reviews
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] rounded-full">
                    {activeReviews.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pool" className="gap-2 text-xs sm:text-sm">
                  Available Pool
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] rounded-full bg-amber-500/10 text-amber-600">
                    {poolSubmissions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2 text-xs sm:text-sm">
                  Archive ({completedReviews.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student or university..."
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
                <div className="text-center py-12 text-muted-foreground">Loading active reviews...</div>
              ) : filteredActive.length === 0 ? (
                <Card className="border-dashed border-2 p-12 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-semibold text-base text-foreground">No active reviews claimed</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Claim student submissions from the "Available Pool" tab to start reviewing documents.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => setActiveTab("pool")}>
                    <FileCheck className="h-4 w-4" /> Go to Available Pool
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
                                {sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "Student"}
                              </span>
                              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-0 text-xs">
                                In Review
                              </Badge>
                              <Badge variant="outline" className="text-xs font-normal">
                                {getDocTypeLabel(sub.documentType)}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Email: {sub.user?.email || "N/A"} • Submitted on {new Date(sub.createdAt).toLocaleDateString()}
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
                            Release
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOpenReviewModal(sub)}
                            className="text-xs gap-1.5 font-medium shadow-sm"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Provide Feedback
                          </Button>
                        </div>
                      </div>

                      {/* University & Student Notes */}
                      <div className="grid sm:grid-cols-2 gap-3 bg-muted/40 p-3.5 rounded-lg border border-border/40 text-xs">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">Target Program / University:</span>
                            <p className="text-muted-foreground mt-0.5">{sub.targetUniversity || "Not specified"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <HelpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">Student Notes:</span>
                            <p className="text-muted-foreground mt-0.5">{sub.studentNotes || "No specific instructions provided."}</p>
                          </div>
                        </div>
                      </div>

                      {/* Files to download */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-xs font-medium text-foreground mr-1">Attached Files:</span>
                        {sub.files.map((file, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!file.url) return;
                              try {
                                await downloadAuthenticatedFile(file.url, file.originalName || "document");
                              } catch {
                                toast.error("Download failed");
                              }
                            }}
                            className="h-8 gap-1.5 text-xs bg-background"
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span className="max-w-[180px] truncate">{file.originalName}</span>
                            <Download className="h-3 w-3 text-muted-foreground ml-1" />
                          </Button>
                        ))}
                      </div>
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
                <div className="text-center py-12 text-muted-foreground">Loading available pool...</div>
              ) : filteredPool.length === 0 ? (
                <Card className="border-dashed border-2 p-12 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500/50 mx-auto mb-3" />
                  <h3 className="font-semibold text-base text-foreground">Pool is all caught up!</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    There are currently no new student submissions waiting for review. Check back soon.
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
                                {sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "Student Submission"}
                              </span>
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                                Waiting for Reviewer
                              </Badge>
                              <Badge variant="secondary" className="text-xs font-normal">
                                {getDocTypeLabel(sub.documentType)}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Target: <span className="text-foreground font-medium">{sub.targetUniversity || "General Review"}</span> • Submitted {new Date(sub.createdAt).toLocaleDateString()}
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
                          Claim Review
                        </Button>
                      </div>

                      {sub.studentNotes && (
                        <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded border border-border/40">
                          <span className="font-semibold text-foreground">Notes:</span> {sub.studentNotes}
                        </p>
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
                  <div className="text-muted-foreground text-sm">No completed reviews yet.</div>
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
                                {sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : "Student"}
                              </span>
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-xs">
                                Completed
                              </Badge>
                              <div className="flex items-center gap-1 ml-2 text-amber-500 text-xs font-medium">
                                <Star className="h-3.5 w-3.5 fill-amber-500" />
                                {sub.rating || 5}/5
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {getDocTypeLabel(sub.documentType)} • Reviewed on {sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleDateString() : new Date(sub.updatedAt).toLocaleDateString()}
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
                          Update Feedback
                        </Button>
                      </div>

                      {sub.feedback && (
                        <div className="bg-muted/40 p-3 rounded-lg border border-border/40 text-xs space-y-1">
                          <span className="font-semibold text-foreground">Your Feedback:</span>
                          <p className="text-muted-foreground whitespace-pre-wrap">{sub.feedback}</p>
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
                Provide Review Feedback
              </DialogTitle>
              <DialogDescription className="text-xs">
                Reviewing <span className="font-semibold text-foreground">{getDocTypeLabel(reviewingSubmission?.documentType)}</span> for{" "}
                <span className="font-semibold text-foreground">{reviewingSubmission?.user?.firstName} {reviewingSubmission?.user?.lastName}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-2">
              {/* Student Target & Notes overview */}
              <div className="bg-muted/50 p-3 rounded-lg border border-border/50 text-xs space-y-1">
                <div>
                  <span className="font-semibold text-foreground">Target: </span>
                  <span className="text-muted-foreground">{reviewingSubmission?.targetUniversity || "Not specified"}</span>
                </div>
                {reviewingSubmission?.studentNotes && (
                  <div>
                    <span className="font-semibold text-foreground">Student Notes: </span>
                    <span className="text-muted-foreground">{reviewingSubmission.studentNotes}</span>
                  </div>
                )}
              </div>

              {/* Rating Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Evaluation Score</label>
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
                    {rating === 5 ? "Excellent (Ready to submit)" : rating >= 4 ? "Good (Minor polishes)" : rating >= 3 ? "Satisfactory (Needs improvements)" : "Needs Major Revision"}
                  </span>
                </div>
              </div>

              {/* Detailed Written Feedback */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Written Feedback & Suggestions</label>
                <Textarea
                  rows={6}
                  placeholder="Provide structured feedback:&#10;1. Key Strengths&#10;2. Areas for Improvement (Structure, Clarity, Tone)&#10;3. Specific suggestions for the Motivation / Story..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Upload Annotated Review File */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Attach Annotated / Corrected Document (Optional)</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFeedbackFile(e.target.files?.[0] || null)}
                    className="text-xs file:text-xs file:font-medium"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Upload your marked-up PDF or DOCX file with tracked changes.</p>
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button type="button" variant="outline" onClick={() => setReviewingSubmission(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={feedbackMutation.isPending} className="gap-2">
                  {feedbackMutation.isPending ? "Submitting..." : "Complete & Send Review"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
