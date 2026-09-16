import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { api, type Submission, type User, type Pagination, downloadAuthenticatedFile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  UserCheck,
  Users,
  Download,
  FileText,
  Building2,
  HelpCircle,
  Star,
  RefreshCw,
  Send,
  UserX,
} from "lucide-react";

export default function AdminSubmissions() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mentorFilter, setMentorFilter] = useState<string>("all");

  // Single Submission Assign Modal State
  const [assigningSubmission, setAssigningSubmission] = useState<Submission | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<string>("unassigned");

  // Bulk Student Assign Modal State
  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);
  const [bulkStudentId, setBulkStudentId] = useState<string>("");
  const [bulkMentorId, setBulkMentorId] = useState<string>("");

  // Queries
  const { data: submissionsData, isLoading: isSubmissionsLoading } = useQuery<{
    data: Submission[];
    pagination: Pagination;
  }>({
    queryKey: ["admin-submissions"],
    queryFn: () => api.submissions.adminList(),
  });

  const { data: mentorsData } = useQuery<{ data: User[]; pagination: Pagination }>({
    queryKey: ["admin-mentors"],
    queryFn: () => api.admin.listMentors(),
  });

  const submissions = submissionsData?.data || [];
  const mentors = (mentorsData?.data || []).filter((m) => m.isActive !== false);

  // Mutations
  const assignMutation = useMutation({
    mutationFn: ({ id, reviewerId }: { id: string; reviewerId: string | null }) =>
      api.submissions.assign(id, reviewerId),
    onSuccess: (_, variables) => {
      if (variables.reviewerId && variables.reviewerId !== "unassigned") {
        toast.success(t("adminSubmissions.assignSuccess"));
      } else {
        toast.success(t("adminSubmissions.unassignSuccess"));
      }
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      setAssigningSubmission(null);
    },
    onError: (err: any) => toast.error(err?.message || "Failed to assign submission"),
  });

  const assignStudentMutation = useMutation({
    mutationFn: ({ studentId, reviewerId }: { studentId: string; reviewerId: string | null }) =>
      api.submissions.assignStudent(studentId, reviewerId),
    onSuccess: () => {
      toast.success(t("adminSubmissions.assignStudentSuccess"));
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      setIsAssignStudentOpen(false);
      setBulkStudentId("");
      setBulkMentorId("");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to assign student submissions"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.submissions.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update status"),
  });

  // Derived unique students with active submission count
  const studentsList = useMemo(() => {
    const studentMap = new Map<string, { id: string; name: string; email: string; activeCount: number }>();
    submissions.forEach((sub) => {
      if (!sub.userId || !sub.user) return;
      const existing = studentMap.get(sub.userId);
      const isActive = sub.status === "pending" || sub.status === "in_review";
      if (existing) {
        if (isActive) existing.activeCount += 1;
      } else {
        studentMap.set(sub.userId, {
          id: sub.userId,
          name: `${sub.user.firstName} ${sub.user.lastName}`,
          email: sub.user.email,
          activeCount: isActive ? 1 : 0,
        });
      }
    });
    return Array.from(studentMap.values());
  }, [submissions]);

  // Metrics
  const totalCount = submissions.length;
  const unassignedCount = submissions.filter((s) => !s.reviewerId && s.status === "pending").length;
  const inReviewCount = submissions.filter((s) => s.status === "in_review").length;
  const completedCount = submissions.filter((s) => s.status === "completed").length;

  // Document type translation
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

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "pending") {
          if (sub.status !== "pending") return false;
        } else if (sub.status !== statusFilter) {
          return false;
        }
      }

      // Mentor filter
      if (mentorFilter !== "all") {
        if (mentorFilter === "unassigned") {
          if (sub.reviewerId) return false;
        } else if (sub.reviewerId !== mentorFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const userName = `${sub.user?.firstName || ""} ${sub.user?.lastName || ""}`.toLowerCase();
        const email = (sub.user?.email || "").toLowerCase();
        const target = (sub.targetUniversity || "").toLowerCase();
        const mentorName = `${sub.reviewer?.firstName || ""} ${sub.reviewer?.lastName || ""}`.toLowerCase();
        return (
          userName.includes(q) ||
          email.includes(q) ||
          target.includes(q) ||
          mentorName.includes(q)
        );
      }

      return true;
    });
  }, [submissions, statusFilter, mentorFilter, searchQuery]);

  const handleOpenAssign = (submission: Submission) => {
    setAssigningSubmission(submission);
    setSelectedMentorId(submission.reviewerId || "unassigned");
  };

  const handleSaveSingleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningSubmission) return;
    const revId = selectedMentorId === "unassigned" ? null : selectedMentorId;
    assignMutation.mutate({ id: assigningSubmission.id, reviewerId: revId });
  };

  const handleSaveBulkAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkStudentId) {
      toast.error("Please select a student");
      return;
    }
    const revId = bulkMentorId === "unassigned" || !bulkMentorId ? null : bulkMentorId;
    assignStudentMutation.mutate({ studentId: bulkStudentId, reviewerId: revId });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header with Title and Student Assign Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {t("adminSubmissions.title")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("adminSubmissions.subtitle")}
            </p>
          </div>

          <Button
            onClick={() => {
              setBulkStudentId(studentsList[0]?.id || "");
              setBulkMentorId(mentors[0]?.id || "unassigned");
              setIsAssignStudentOpen(true);
            }}
            className="gap-2 shrink-0 font-medium shadow-sm"
          >
            <Users className="h-4 w-4" />
            {t("adminSubmissions.assignStudentBtn")}
          </Button>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("adminSubmissions.totalSubmissions")}
                </p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{totalCount}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("adminSubmissions.unassigned")}
                </p>
                <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                  {unassignedCount}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("adminSubmissions.inReview")}
                </p>
                <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                  {inReviewCount}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("adminSubmissions.completed")}
                </p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  {completedCount}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search Bar */}
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("adminSubmissions.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={t("adminSubmissions.filterStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("adminSubmissions.allStatuses")}</SelectItem>
                  <SelectItem value="pending">{t("adminSubmissions.unassigned")}</SelectItem>
                  <SelectItem value="in_review">{t("adminSubmissions.inReview")}</SelectItem>
                  <SelectItem value="completed">{t("adminSubmissions.completed")}</SelectItem>
                  <SelectItem value="rejected">{t("adminSubmissions.rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mentor Filter */}
            <div className="w-full md:w-56">
              <Select value={mentorFilter} onValueChange={setMentorFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={t("adminSubmissions.filterMentor")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("adminSubmissions.allMentors")}</SelectItem>
                  <SelectItem value="unassigned">{t("adminSubmissions.onlyUnassigned")}</SelectItem>
                  {mentors.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        {isSubmissionsLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Loading submissions...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <Card className="border-dashed border-2 p-12 text-center">
            <FileCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-semibold text-base text-foreground">
              {t("adminSubmissions.noSubmissions")}
            </h3>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => {
              const hasReviewer = !!sub.reviewerId && !!sub.reviewer;

              return (
                <Card
                  key={sub.id}
                  className="border border-border/60 shadow-sm hover:border-primary/40 transition-all"
                >
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* Top Row: Student & Badges & Action */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0 mt-0.5">
                          {sub.user?.firstName?.[0] || "S"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-base">
                              {sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : t("adminSubmissions.student")}
                            </span>

                            {/* Status Badge */}
                            {sub.status === "completed" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-xs">
                                {t("adminSubmissions.completed")}
                              </Badge>
                            ) : sub.status === "in_review" ? (
                              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 text-xs">
                                {t("adminSubmissions.inReview")}
                              </Badge>
                            ) : sub.status === "rejected" ? (
                              <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-0 text-xs">
                                {t("adminSubmissions.rejected")}
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-xs">
                                {t("adminSubmissions.unassigned")}
                              </Badge>
                            )}

                            {/* Document Type Badge */}
                            <Badge variant="outline" className="text-xs font-normal">
                              {getDocTypeLabel(sub.documentType)}
                            </Badge>
                          </div>

                          <div className="text-xs text-muted-foreground mt-1">
                            {sub.user?.email || "N/A"} • {t("adminSubmissions.submittedOn")}{" "}
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Mentor Assignment Button */}
                      <div className="flex items-center gap-2 self-end sm:self-start">
                        <Button
                          size="sm"
                          onClick={() => handleOpenAssign(sub)}
                          className="text-xs gap-1.5 font-medium shadow-sm"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          {t("adminSubmissions.assignSubmission")}
                        </Button>
                      </div>
                    </div>

                    {/* Assigned Mentor Card Ribbon */}
                    <div className="p-3 rounded-lg border border-border/50 bg-muted/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {t("adminSubmissions.assignedMentor")}:
                        </span>
                        {hasReviewer ? (
                          <span className="font-medium text-primary flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                            {sub.reviewer?.firstName} {sub.reviewer?.lastName} ({sub.reviewer?.email})
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                            {t("adminSubmissions.noMentor")}
                          </span>
                        )}
                      </div>

                      {/* Quick Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t("adminSubmissions.filterStatus")}:</span>
                        <Select
                          value={sub.status}
                          onValueChange={(status) => updateStatusMutation.mutate({ id: sub.id, status })}
                        >
                          <SelectTrigger className="h-7 text-xs w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_review">In Review</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Target University & Student Notes */}
                    <div className="grid sm:grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-lg border border-border/40 text-xs">
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-foreground">
                            {t("adminSubmissions.targetUniversity")}
                          </span>
                          <p className="text-muted-foreground mt-0.5">
                            {sub.targetUniversity || "General Review"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <HelpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-foreground">
                            {t("adminSubmissions.studentNotes")}
                          </span>
                          <p className="text-muted-foreground mt-0.5">
                            {sub.studentNotes || t("adminSubmissions.noStudentNotes")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Feedback if available */}
                    {sub.feedback && (
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-emerald-800 dark:text-emerald-300">
                          <span>{t("adminSubmissions.feedbackLabel")}</span>
                          {sub.rating && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="h-3 w-3 fill-amber-500" />
                              <span>{sub.rating}/5</span>
                            </div>
                          )}
                        </div>
                        <p className="text-muted-foreground whitespace-pre-wrap">{sub.feedback}</p>
                      </div>
                    )}

                    {/* Attached Files */}
                    {sub.files && sub.files.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-xs font-medium text-foreground mr-1">
                          {t("adminSubmissions.files")}
                        </span>
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
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal: Assign Single Submission */}
        <Dialog
          open={!!assigningSubmission}
          onOpenChange={(open) => !open && setAssigningSubmission(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                {t("adminSubmissions.assignModalTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t("adminSubmissions.assignModalDesc")}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveSingleAssign} className="space-y-4 pt-2">
              <div className="bg-muted/40 p-3 rounded-lg border border-border/40 text-xs space-y-1">
                <div>
                  <span className="font-semibold">{t("adminSubmissions.student")}: </span>
                  <span>{assigningSubmission?.user?.firstName} {assigningSubmission?.user?.lastName}</span>
                </div>
                <div>
                  <span className="font-semibold">Document: </span>
                  <span>{getDocTypeLabel(assigningSubmission?.documentType)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {t("adminSubmissions.selectMentor")}
                </label>
                <Select value={selectedMentorId} onValueChange={setSelectedMentorId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                        <UserX className="h-3.5 w-3.5" />
                        {t("adminSubmissions.returnToPool")}
                      </div>
                    </SelectItem>
                    {mentors.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssigningSubmission(null)}
                >
                  {t("adminSubmissions.cancel")}
                </Button>
                <Button type="submit" disabled={assignMutation.isPending} className="gap-2">
                  {assignMutation.isPending ? "Saving..." : t("adminSubmissions.saveAssignment")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Bulk Assign All Submissions of a Student */}
        <Dialog open={isAssignStudentOpen} onOpenChange={setIsAssignStudentOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t("adminSubmissions.assignStudentModalTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t("adminSubmissions.assignStudentModalDesc")}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveBulkAssign} className="space-y-4 pt-2">
              {/* Select Student */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {t("adminSubmissions.selectStudent")}
                </label>
                <Select value={bulkStudentId} onValueChange={setBulkStudentId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder={t("adminSubmissions.chooseStudent")} />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.email}) — {s.activeCount} {t("adminSubmissions.activeCount")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Mentor */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {t("adminSubmissions.selectMentor")}
                </label>
                <Select value={bulkMentorId} onValueChange={setBulkMentorId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder={t("adminSubmissions.chooseMentor")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                        <UserX className="h-3.5 w-3.5" />
                        {t("adminSubmissions.returnToPool")}
                      </div>
                    </SelectItem>
                    {mentors.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAssignStudentOpen(false)}
                >
                  {t("adminSubmissions.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={assignStudentMutation.isPending || !bulkStudentId}
                  className="gap-2"
                >
                  {assignStudentMutation.isPending ? "Assigning..." : t("adminSubmissions.saveAssignment")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
