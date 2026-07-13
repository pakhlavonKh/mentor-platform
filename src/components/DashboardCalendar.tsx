import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ExternalLink, Bookmark } from "lucide-react";
import { type Grant } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardCalendarProps {
  grants: Grant[];
}

const typeColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  bachelor: { bg: "bg-blue-500/10", border: "border-blue-200 dark:border-blue-800", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  master: { bg: "bg-purple-500/10", border: "border-purple-200 dark:border-purple-800", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-500" },
  phd: { bg: "bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-800", text: "text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500" },
  internship: { bg: "bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  summer_program: { bg: "bg-amber-500/10", border: "border-amber-200 dark:border-amber-800", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  foundation: { bg: "bg-teal-500/10", border: "border-teal-200 dark:border-teal-800", text: "text-teal-600 dark:text-teal-400", dot: "bg-teal-500" },
};

export function DashboardCalendar({ grants }: DashboardCalendarProps) {
  const { t, i18n } = useTranslation();
  const { lt } = useLocale();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDeadlineKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Group grants by deadline key
  const grantsByDeadline = useMemo(() => {
    const map: Record<string, Grant[]> = {};
    grants.forEach((g) => {
      if (g.deadline) {
        // Normalize deadline key (ensure it matches YYYY-MM-DD)
        const trimmed = g.deadline.trim();
        if (!map[trimmed]) {
          map[trimmed] = [];
        }
        map[trimmed].push(g);
      }
    });
    return map;
  }, [grants]);

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    // Trailing days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevTotalDays - i;
      days.push({
        date: new Date(year, month - 1, dayNum),
        isCurrentMonth: false,
        key: `prev-${dayNum}`,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        key: `current-${i}`,
      });
    }

    // Leading days from next month
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        key: `next-${i}`,
      });
    }

    return days;
  }, [year, month]);

  const selectedDateKey = selectedDate ? getDeadlineKey(selectedDate) : "";
  const selectedDateGrants = selectedDateKey ? (grantsByDeadline[selectedDateKey] || []) : [];

  // Sort all upcoming deadlines for display
  const sortedUpcomingGrants = useMemo(() => {
    const todayStr = getDeadlineKey(new Date());
    return [...grants]
      .filter((g) => g.deadline && g.deadline >= todayStr)
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [grants]);

  // Translate month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const translatedMonth = t(`months.${monthNames[month].toLowerCase()}`) || monthNames[month];

  const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Area */}
      <Card className="lg:col-span-2 shadow-soft border border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-xl font-bold">
              {translatedMonth} {year}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekdays Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-medium text-xs text-muted-foreground mb-2">
            {weekdayNames.map((day) => (
              <div key={day} className="py-1">
                {t(`weekdays.${day.toLowerCase()}`) || day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 bg-muted/10 p-1 rounded-xl border border-border/40">
            {calendarDays.map((day) => {
              const dKey = getDeadlineKey(day.date);
              const dayGrants = grantsByDeadline[dKey] || [];
              const isSelected = selectedDate && getDeadlineKey(day.date) === getDeadlineKey(selectedDate);
              const isToday = getDeadlineKey(day.date) === getDeadlineKey(new Date());

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    relative aspect-square p-1 flex flex-col items-center justify-between rounded-lg transition-all text-sm font-medium group
                    ${day.isCurrentMonth ? "text-foreground" : "text-muted-foreground/45"}
                    ${isSelected ? "bg-primary text-primary-foreground shadow-sm scale-[1.03] z-10" : "hover:bg-accent hover:text-accent-foreground"}
                    ${isToday && !isSelected ? "border border-primary/45 bg-primary/5" : ""}
                  `}
                >
                  <span className="text-xs">{day.date.getDate()}</span>

                  {/* Category dots */}
                  {dayGrants.length > 0 && (
                    <div className="flex gap-0.5 justify-center flex-wrap pb-0.5 max-w-full px-0.5">
                      {dayGrants.slice(0, 3).map((g) => {
                        const style = typeColors[g.type] || { dot: "bg-muted-foreground" };
                        return (
                          <span
                            key={g.id}
                            className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                              isSelected ? "bg-white" : style.dot
                            }`}
                          />
                        );
                      })}
                      {dayGrants.length > 3 && (
                        <span className={`text-[8px] font-bold leading-none ${isSelected ? "text-white" : "text-primary"}`}>
                          +
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Side Details / Deadlines Panel */}
      <div className="space-y-6">
        {/* Selected Date Details */}
        <Card className="shadow-soft border border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              {selectedDate ? selectedDate.toLocaleDateString(i18n.language === "en" ? "en-US" : i18n.language === "ru" ? "ru-RU" : "kk-KZ", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
              }) : "Select a day"}
            </CardTitle>
            <CardDescription>
              {selectedDateGrants.length} {selectedDateGrants.length === 1 ? "deadline" : "deadlines"} on this day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[220px] overflow-y-auto">
            {selectedDateGrants.length > 0 ? (
              selectedDateGrants.map((g) => {
                const style = typeColors[g.type] || { bg: "bg-muted", border: "border-border", text: "text-foreground" };
                return (
                  <div key={g.id} className={`p-3 border rounded-xl flex items-center justify-between transition-all ${style.bg} ${style.border}`}>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-xs leading-snug line-clamp-2 text-foreground">{lt(g.title)}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 rounded-full capitalize font-medium ${style.text} ${style.border}`}>
                          {t(`grants.${g.type}`) || g.type.replace("_", " ")}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">{g.country}</span>
                      </div>
                    </div>
                    {g.link && g.link !== "#" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => window.open(g.link, "_blank")}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No application deadlines scheduled for this date.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming saved deadlines */}
        <Card className="shadow-soft border border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Bookmark className="h-4 w-4 text-primary" />
              Upcoming Saved Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
            {sortedUpcomingGrants.length > 0 ? (
              sortedUpcomingGrants.map((g) => {
                const style = typeColors[g.type] || { bg: "bg-muted", border: "border-border", text: "text-foreground" };
                const deadlineDate = new Date(g.deadline);
                return (
                  <div key={g.id} className="flex items-start justify-between p-2 border-b border-border/30 last:border-0 pb-3 last:pb-0">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-xs leading-snug text-foreground line-clamp-1">{lt(g.title)}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[9px] px-1 rounded-full capitalize ${style.text} ${style.border}`}>
                          {t(`grants.${g.type}`) || g.type.replace("_", " ")}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">{g.country}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-red-600 dark:text-red-400">
                        {deadlineDate.toLocaleDateString(i18n.language === "en" ? "en" : i18n.language === "ru" ? "ru" : "kk", {
                          month: "short",
                          day: "numeric"
                        })}
                      </p>
                      <p className="text-[9px] text-muted-foreground">Deadline</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No upcoming saved deadlines. Save grants to track them on your calendar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
