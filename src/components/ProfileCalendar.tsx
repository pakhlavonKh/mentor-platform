import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type CalendarItem, type CalendarCategory } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { CalendarDays, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<CalendarCategory, string> = {
  grant_deadline: "bg-orange-500",
  event: "bg-blue-500",
  application: "bg-emerald-500",
  platform: "bg-violet-500",
};

const CATEGORY_BADGE: Record<CalendarCategory, "default" | "secondary" | "destructive" | "outline"> = {
  grant_deadline: "destructive",
  event: "default",
  application: "secondary",
  platform: "outline",
};

export function ProfileCalendar() {
  const { t } = useTranslation();
  const { lt } = useLocale();
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const to = format(endOfMonth(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)), "yyyy-MM-dd");
    api.calendar
      .personal({ from, to })
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedItems = useMemo(() => {
    if (!selected) return [];
    return items.filter((item) => isSameDay(parseISO(item.date), selected));
  }, [items, selected]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return items.filter((item) => item.date >= today).slice(0, 6);
  }, [items]);

  const modifiers = useMemo(() => {
    const dates = items.map((item) => parseISO(item.date));
    return { hasEvent: dates };
  }, [items]);

  return (
    <Card className="shadow-soft border border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-lg text-card-foreground">{t("calendar.title")}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t("calendar.description")}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-3 text-xs">
          {(Object.keys(CATEGORY_COLORS) as CalendarCategory[]).map((cat) => (
            <span key={cat} className="flex items-center gap-1.5 text-muted-foreground">
              <span className={cn("h-2.5 w-2.5 rounded-full", CATEGORY_COLORS[cat])} />
              {t(`calendar.categories.${cat}`)}
            </span>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="flex justify-center lg:justify-start">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              modifiers={modifiers}
              modifiersClassNames={{ hasEvent: "font-bold relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary" }}
              className="rounded-xl border border-border/60 p-3 pointer-events-auto"
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-card-foreground">
              {selected ? format(selected, "MMMM d, yyyy") : t("calendar.selectDate")}
            </h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">{t("admin.loading")}</p>
            ) : selectedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("calendar.noEventsOnDate")}</p>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border border-border/60 bg-muted/20">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-card-foreground">
                        {typeof item.title === "string" ? item.title : lt(item.title)}
                      </p>
                      <Badge variant={CATEGORY_BADGE[item.category]} className="text-xs shrink-0 rounded-full capitalize">
                        {t(`calendar.categories.${item.category}`)}
                      </Badge>
                    </div>
                    {item.description && typeof item.description !== "string" && (
                      <p className="text-xs text-muted-foreground mt-1">{lt(item.description)}</p>
                    )}
                    {item.link && item.link !== "#" && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                        {t("telegram.openLink")} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-card-foreground mb-3">{t("calendar.upcoming")}</h4>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("calendar.noUpcoming")}</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/30">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", CATEGORY_COLORS[item.category])} />
                  <span className="text-muted-foreground shrink-0 w-24">{format(parseISO(item.date), "MMM d")}</span>
                  <span className="text-card-foreground truncate">
                    {typeof item.title === "string" ? item.title : lt(item.title)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
