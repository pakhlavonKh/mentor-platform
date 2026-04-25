import { AppLayout } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";

export default function MentorDashboard() {
  const { t } = useTranslation();
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-foreground">{t("mentor.dashboardTitle") || "Mentor Dashboard"}</h1>
        <p className="text-muted-foreground mt-2">{t("mentor.dashboardDesc") || "Mentor tools and mentee overview."}</p>
      </div>
    </AppLayout>
  );
}
