import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, type TelegramPost } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { ExternalLink, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function TelegramPage() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [config, setConfig] = useState({
    telegramPhone: "",
    telegramChannelUrl: "",
    telegramChannelUsername: "",
  });
  const { lt } = useLocale();

  useEffect(() => {
    api.telegram.list({ limit: "50" }).then((res) => setPosts(res.data)).catch(() => {});
    api.telegram.config().then(setConfig).catch(() => {});
  }, []);

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("90") && digits.length === 12) {
      return `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
    }
    return phone;
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Send className="h-5 w-5 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">{t("telegram.title")}</h1>
          </div>
          <p className="text-muted-foreground">{t("telegram.description")}</p>
        </div>

        <Card className="gradient-primary text-primary-foreground border-0 shadow-elevated overflow-hidden">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="font-display text-xl sm:text-2xl font-bold">{t("telegram.corporateBannerTitle")}</h2>
              <p className="text-primary-foreground/80 text-sm max-w-md">
                {t("telegram.corporateBannerDesc", {
                  phone: config.telegramPhone ? formatPhone(config.telegramPhone) : "",
                  channel: config.telegramChannelUsername || "@studyqadam_corporate",
                })}
              </p>
            </div>
            {config.telegramChannelUrl && (
              <Button
                className="bg-white text-primary hover:bg-white/95 rounded-full px-6 py-5 font-semibold shrink-0 gap-2 shadow"
                onClick={() => window.open(config.telegramChannelUrl, "_blank")}
              >
                <Send className="h-4 w-4 fill-current" /> {t("telegram.joinChannel")}
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="shadow-soft hover:shadow-hover transition-all border border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-semibold text-base text-card-foreground">{lt(post.title)}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0 rounded-full">{post.source}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString(i18n.language === "en" ? "en-US" : i18n.language === "ru" ? "ru-RU" : "kk-KZ", { month: "long", day: "numeric", year: "numeric" })}</span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{lt(post.description)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      const targetUrl = post.link && post.link !== "#" ? post.link : config.telegramChannelUrl;
                      if (targetUrl) window.open(targetUrl, "_blank");
                    }}
                  >
                    {t("telegram.openLink")} <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
