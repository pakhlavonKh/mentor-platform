import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, type CalendarEvent, type CalendarCategory } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { toast } from "sonner";
import { Trash2, Edit2, CalendarDays } from "lucide-react";

const emptyLocalized = { en: "", ru: "", kz: "" };
const categories: CalendarCategory[] = ["grant_deadline", "event", "application", "platform"];

export default function AdminCalendar() {
  const { t } = useTranslation();
  const { lt } = useLocale();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: eventsData } = useQuery({
    queryKey: ["admin-calendar"],
    queryFn: () => api.calendar.list({ limit: "100" }),
  });

  const events = eventsData?.data || [];

  const [newEvent, setNewEvent] = useState({
    title: { ...emptyLocalized },
    description: { ...emptyLocalized },
    date: "",
    category: "event" as CalendarCategory,
    link: "",
  });

  const [editEvent, setEditEvent] = useState<Partial<CalendarEvent> | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: typeof newEvent) => api.calendar.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-calendar"] });
      toast.success(t("admin.eventCreated"));
      setNewEvent({ title: { ...emptyLocalized }, description: { ...emptyLocalized }, date: "", category: "event", link: "" });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CalendarEvent> }) => api.calendar.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-calendar"] });
      toast.success(t("admin.eventUpdated"));
      setEditingId(null);
      setEditEvent(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.calendar.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-calendar"] });
      toast.success(t("admin.eventDeleted"));
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error"),
  });

  const renderLocalizedFields = (
    label: string,
    value: { en: string; ru: string; kz: string },
    onChange: (v: { en: string; ru: string; kz: string }) => void,
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {(["en", "ru", "kz"] as const).map((lang) => (
        <Input
          key={lang}
          placeholder={`${label} (${lang.toUpperCase()})`}
          value={value[lang]}
          onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
        />
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">{t("admin.manageCalendar")}</h1>
            <p className="text-muted-foreground text-sm">{t("admin.manageCalendarDesc")}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">{t("admin.createEvent")}</h2>
            {renderLocalizedFields(t("admin.eventTitle"), newEvent.title, (title) => setNewEvent({ ...newEvent, title }))}
            {renderLocalizedFields(t("admin.eventDescription"), newEvent.description, (description) => setNewEvent({ ...newEvent, description }))}
            <div className="grid sm:grid-cols-2 gap-3">
              <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
              <Select value={newEvent.category} onValueChange={(v) => setNewEvent({ ...newEvent, category: v as CalendarCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{t(`calendar.categories.${cat}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder={t("admin.eventLink")} value={newEvent.link} onChange={(e) => setNewEvent({ ...newEvent, link: e.target.value })} />
            <Button onClick={() => createMutation.mutate(newEvent)} disabled={!newEvent.title.en || !newEvent.date}>
              {t("admin.createEvent")}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="font-semibold">{t("admin.existingEvents")}</h2>
          {events.length === 0 && <p className="text-muted-foreground">{t("admin.noEvents")}</p>}
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                {editingId === event.id && editEvent ? (
                  <div className="space-y-3">
                    {renderLocalizedFields(t("admin.eventTitle"), editEvent.title || emptyLocalized, (title) => setEditEvent({ ...editEvent, title }))}
                    <Input type="date" value={editEvent.date || ""} onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })} />
                    <Select value={editEvent.category} onValueChange={(v) => setEditEvent({ ...editEvent, category: v as CalendarCategory })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{t(`calendar.categories.${cat}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button onClick={() => updateMutation.mutate({ id: event.id, data: editEvent })}>{t("common.save")}</Button>
                      <Button variant="outline" onClick={() => { setEditingId(null); setEditEvent(null); }}>{t("common.cancel")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{lt(event.title)}</p>
                      <p className="text-sm text-muted-foreground">{event.date} · {t(`calendar.categories.${event.category}`)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingId(event.id); setEditEvent({ ...event }); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
