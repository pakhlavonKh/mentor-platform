import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { api, type User, type Pagination } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Power, PowerOff, Search, Eye, EyeOff, Users, CheckCircle2, XCircle, UserCheck, Send, QrCode, Copy, Check, ExternalLink, RefreshCw } from "lucide-react";

export default function AdminMentors() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mentorToDelete, setMentorToDelete] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  const [onboardingData, setOnboardingData] = useState<{
    mentorId: string;
    mentorName: string;
    deepLink: string;
    token: string;
    telegramId?: string | null;
    isLinked?: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingLink, setLoadingLink] = useState(false);

  const { data, isLoading } = useQuery<{ data: User[]; pagination: Pagination }>({
    queryKey: ["admin-mentors"],
    queryFn: () => api.admin.listMentors(),
  });
  const mentors = data?.data || [];

  const filteredMentors = useMemo(() => {
    if (!searchQuery.trim()) return mentors;
    const query = searchQuery.toLowerCase();
    return mentors.filter(
      (m) =>
        m.firstName.toLowerCase().includes(query) ||
        m.lastName.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query)
    );
  }, [mentors, searchQuery]);

  const activeCount = useMemo(() => mentors.filter((m) => m.isActive !== false).length, [mentors]);
  const inactiveCount = useMemo(() => mentors.filter((m) => m.isActive === false).length, [mentors]);

  const openTelegramLinkModal = async (mentor: User) => {
    try {
      setLoadingLink(true);
      const res = await api.admin.getMentorTelegramLink(mentor.id);
      setOnboardingData(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to load mentor Telegram link");
    } finally {
      setLoadingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!onboardingData?.deepLink) return;
    navigator.clipboard.writeText(onboardingData.deepLink);
    setCopied(true);
    toast.success("Telegram invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const createMentor = useMutation({
    mutationFn: (payload: typeof formData) => api.admin.createMentor(payload),
    onSuccess: (res: any) => {
      toast.success(t("admin.mentorCreated") || "Mentor created successfully");
      setFormData({ email: "", firstName: "", lastName: "", password: "" });
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });

      if (res.telegramDeepLink) {
        setOnboardingData({
          mentorId: res.mentor.id,
          mentorName: `${res.mentor.firstName} ${res.mentor.lastName}`,
          deepLink: res.telegramDeepLink,
          token: res.telegramLinkToken || "",
          isLinked: false,
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create mentor");
    },
  });

  const deactivateMentor = useMutation({
    mutationFn: (id: string) => api.admin.deactivateMentor(id),
    onSuccess: () => {
      toast.success(t("admin.mentorDeactivated") || "Mentor deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to deactivate mentor");
    },
  });

  const reactivateMentor = useMutation({
    mutationFn: (id: string) => api.admin.reactivateMentor(id),
    onSuccess: () => {
      toast.success(t("admin.mentorReactivated") || "Mentor reactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reactivate mentor");
    },
  });

  const deleteMentor = useMutation({
    mutationFn: (id: string) => api.admin.deleteMentor(id),
    onSuccess: () => {
      toast.success(t("admin.mentorDeleted") || "Mentor deleted successfully");
      setMentorToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete mentor");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    createMentor.mutate(formData);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {t("admin.mentors") || "Mentors"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and monitor mentor access across the platform.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-2 shadow-sm font-medium transition-all"
          >
            <Plus className="h-4 w-4" />
            {t("admin.createMentor") || "Create Mentor"}
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Mentors</p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">{mentors.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Accounts</p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{activeCount}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deactivated</p>
                <h3 className="text-2xl font-bold mt-1 text-destructive">{inactiveCount}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <XCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Mentor Form */}
        {showCreateForm && (
          <Card className="border border-border/80 shadow-md animate-in fade-in slide-in-from-top-3 duration-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                {t("admin.createMentor") || "Create New Mentor"}
              </CardTitle>
              <CardDescription>Fill in the credentials to register a new mentor account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("admin.mentorEmail") || "Email"}</label>
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("admin.mentorFirstName") || "First Name"}</label>
                    <Input
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("admin.mentorLastName") || "Last Name"}</label>
                    <Input
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("admin.mentorPassword") || "Password"}</label>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={createMentor.isPending}>
                    {createMentor.isPending ? t("admin.creating") || "Creating..." : t("admin.createMentor") || "Create Mentor"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mentors by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Mentors List */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading mentors...</div>
          ) : filteredMentors.map((mentor) => {
            const isMentorActive = mentor.isActive !== false;
            return (
              <Card
                key={mentor.id}
                className={`border border-border/60 transition-all hover:border-border/100 shadow-sm ${
                  isMentorActive ? "" : "opacity-75 bg-muted/30"
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                        {mentor.firstName?.[0]?.toUpperCase() || "M"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-base">
                            {mentor.firstName} {mentor.lastName}
                          </span>
                          {!isMentorActive && (
                            <Badge variant="outline" className="text-destructive border-destructive/30">
                              {t("admin.mentorDeactivatedStatus") || "Deactivated"}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">{mentor.email}</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          {mentor.telegramId ? (
                            <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px] py-0 px-2 font-normal">
                              <Send className="w-2.5 h-2.5 text-sky-500" />
                              Telegram Linked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-border text-[11px] py-0 px-2 font-normal">
                              Telegram Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTelegramLinkModal(mentor)}
                        disabled={loadingLink}
                        className="gap-1.5"
                        title="View Telegram Onboarding Link & QR Code"
                      >
                        <QrCode className="h-3.5 w-3.5 text-sky-500" />
                        Telegram Link
                      </Button>

                      {isMentorActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deactivateMentor.mutate(mentor.id)}
                          disabled={deactivateMentor.isPending}
                          className="gap-1.5"
                        >
                          <PowerOff className="h-3.5 w-3.5 text-amber-500" />
                          {t("admin.mentorDeactivate") || "Deactivate"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => reactivateMentor.mutate(mentor.id)}
                          disabled={reactivateMentor.isPending}
                          className="gap-1.5 text-emerald-600 dark:text-emerald-400"
                        >
                          <Power className="h-3.5 w-3.5" />
                          {t("admin.mentorReactivate") || "Reactivate"}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setMentorToDelete(mentor)}
                        disabled={deleteMentor.isPending}
                        className="gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("admin.mentorDelete") || "Delete"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!isLoading && filteredMentors.length === 0 && (
            <Card className="border-dashed border-2 p-12 text-center">
              <div className="text-muted-foreground text-sm">
                {searchQuery ? "No mentors found matching your search." : (t("admin.noMentors") || "No mentors found. Create your first mentor using the button above.")}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Deletion */}
      <AlertDialog open={!!mentorToDelete} onOpenChange={(open) => !open && setMentorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this mentor?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove mentor account{" "}
              <span className="font-semibold text-foreground">{mentorToDelete?.firstName} {mentorToDelete?.lastName} ({mentorToDelete?.email})</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => mentorToDelete && deleteMentor.mutate(mentorToDelete.id)}
            >
              Delete Mentor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mentor Telegram Onboarding Modal */}
      <Dialog open={!!onboardingData} onOpenChange={(open) => !open && setOnboardingData(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Send className="w-5 h-5 text-sky-500" />
              Mentor Telegram Onboarding
            </DialogTitle>
            <DialogDescription>
              Share this link or scan the QR code with <b>{onboardingData?.mentorName}</b> to link their Telegram account for direct task alerts.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center space-y-4 py-2">
            {/* Scannable QR Code */}
            <div className="p-3 bg-white rounded-xl shadow-md border border-border flex items-center justify-center">
              {onboardingData?.deepLink ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(onboardingData.deepLink)}`}
                  alt="Telegram Onboarding QR Code"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-muted-foreground text-xs">
                  Generating QR Code...
                </div>
              )}
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 text-xs">
              {onboardingData?.isLinked ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 py-1 px-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Account Connected {onboardingData.telegramId ? `(ID: ${onboardingData.telegramId})` : ""}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 gap-1.5 py-1 px-3">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Waiting for mentor to tap Start...
                </Badge>
              )}
            </div>

            {/* Direct Deep Link input & copy button */}
            <div className="w-full space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Direct Telegram Deep Link</label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={onboardingData?.deepLink || ""}
                  className="text-xs font-mono bg-muted/40"
                />
                <Button size="sm" onClick={handleCopyLink} className="shrink-0 gap-1.5">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex sm:justify-between items-center gap-2">
            {onboardingData?.deepLink && (
              <a
                href={onboardingData.deepLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in Telegram
              </a>
            )}
            <Button variant="outline" onClick={() => setOnboardingData(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
