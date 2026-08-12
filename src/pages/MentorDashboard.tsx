import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  Calendar,
  Star,
  Search,
  BookOpen,
  Send,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  MessageSquareText
} from "lucide-react";

export default function MentorDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchMentee, setSearchMentee] = useState("");

  // Sample data for mentor dashboard metrics & mentees
  const mockMentees = [
    { id: "1", name: "Alikhan Nurtas", email: "alikhan@example.com", target: "MIT - CS", progress: "85%", status: "Active", nextSession: "Tomorrow, 15:00" },
    { id: "2", name: "Amina Smailova", email: "amina@example.com", target: "Stanford - Econ", progress: "60%", status: "Active", nextSession: "Aug 15, 11:00" },
    { id: "3", name: "Dias Yertayev", email: "dias@example.com", target: "Harvard - Law", progress: "90%", status: "Review", nextSession: "Aug 18, 14:00" },
    { id: "4", name: "Zere Temirova", email: "zere@example.com", target: "Oxford - Engineering", progress: "40%", status: "Active", nextSession: "Aug 20, 16:30" },
  ];

  const filteredMentees = mockMentees.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMentee.toLowerCase()) ||
      m.target.toLowerCase().includes(searchMentee.toLowerCase()) ||
      m.email.toLowerCase().includes(searchMentee.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-indigo-700 p-6 sm:p-8 text-primary-foreground shadow-lg">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Yerkenaz Mentor Portal</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("mentor.welcome") || `Welcome back, ${user?.firstName || "Mentor"}!`}
            </h1>
            <p className="text-primary-foreground/80 max-w-xl text-sm sm:text-base">
              {t("mentor.dashboardDesc") || "Guide your assigned students through scholarship applications and university admissions."}
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-30px] opacity-10 pointer-events-none">
            <Users className="w-64 h-64" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("mentor.activeMentees") || "Active Mentees"}
                </p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">4</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("mentor.hoursMentored") || "Hours Mentored"}
                </p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">32 hrs</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("mentor.upcomingSessions") || "Consultations"}
                </p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">3</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Calendar className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("mentor.satisfactionScore") || "Rating"}
                </p>
                <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">4.9 / 5.0</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Star className="h-5 w-5 fill-amber-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mentees Table / List (2 columns wide) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {t("mentor.menteesOverview") || "Assigned Mentees"}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Track application status and consultation schedules.
                  </CardDescription>
                </div>
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder={t("mentor.searchMentees") || "Search mentees..."}
                    value={searchMentee}
                    onChange={(e) => setSearchMentee(e.target.value)}
                    className="pl-8 text-xs h-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="divide-y divide-border/60">
                  {filteredMentees.map((mentee) => (
                    <div key={mentee.id} className="p-4 sm:px-6 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                          {mentee.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                            {mentee.name}
                            <Badge variant={mentee.status === "Active" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                              {mentee.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Target: <span className="text-foreground font-medium">{mentee.target}</span> • {mentee.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <div className="text-xs font-medium text-foreground">{mentee.nextSession}</div>
                          <div className="text-[11px] text-muted-foreground">Next Consultation</div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredMentees.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      {t("mentor.noMentees") || "No mentees assigned yet."}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Platform Resources for Mentors */}
            <Card className="border border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {t("mentor.resources") || "Mentor Resources & Tools"}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border/60 hover:border-primary/50 transition-colors flex items-start gap-3">
                  <div className="p-2 rounded bg-primary/10 text-primary mt-0.5">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Scholarship Guides</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Curated templates for motivation letters and recommendation emails.</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/60 hover:border-primary/50 transition-colors flex items-start gap-3">
                  <div className="p-2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Review Checklist</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Standard criteria for evaluating student essay submissions.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column (1 column wide) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">
                  {t("mentor.quickActions") || "Quick Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 h-10 text-xs font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  {t("mentor.scheduleSession") || "Schedule Consultation"}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-10 text-xs font-medium">
                  <MessageSquareText className="h-4 w-4 text-blue-500" />
                  Send Group Message
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-10 text-xs font-medium">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                  {t("mentor.mentorGuidelines") || "Mentor Guidelines"}
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Schedule Card */}
            <Card className="border border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Upcoming Schedule</span>
                  <Badge variant="outline" className="text-[10px] font-normal">3 Sessions</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Alikhan Nurtas</span>
                    <span className="text-primary font-medium">Tomorrow, 15:00</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">MIT CommonApp Essay Feedback</div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Amina Smailova</span>
                    <span className="text-muted-foreground">Aug 15, 11:00</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">Stanford Financial Aid Documents</div>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Dias Yertayev</span>
                    <span className="text-muted-foreground">Aug 18, 14:00</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">Harvard Statement of Purpose</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
