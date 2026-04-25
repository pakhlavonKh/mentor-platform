import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, Calendar, MapPin } from "lucide-react";
import type { Grant } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";

interface GrantCardProps {
  grant: Grant;
  saved?: boolean;
  onSave?: () => void;
}

const fundingVariant = (funding: string) =>
  funding === "full" ? "default" : "secondary";

const typeLabel = (type: string) =>
  type.charAt(0).toUpperCase() + type.slice(1);

export function GrantCard({ grant, saved, onSave }: GrantCardProps) {
  const { t, i18n } = useTranslation();
  const { lt } = useLocale();
  const locale = i18n.language === "en" ? "en-US" : i18n.language === "ru" ? "ru-RU" : "kk-KK";

  return (
    <Card className="group shadow-soft hover:shadow-hover transition-all duration-300 border border-border/60 hover:border-primary/30 rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <h3 className="font-display font-semibold text-base leading-tight text-card-foreground">{lt(grant.title)}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{grant.country}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(grant.deadline).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`p-0 ${saved ? "text-primary" : "text-muted-foreground"}`}
            onClick={onSave}
          >
            {saved ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M6 2h12v18l-6-3-6 3V2z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M6 2h12v18l-6-3-6 3V2z" />
              </svg>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{lt(grant.description)}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex gap-2">
          <Badge variant={fundingVariant(grant.funding)} className="text-xs">{grant.funding === "full" ? t("grants.fullFunding") : t("grants.partialFunding")}</Badge>
          <Badge variant="outline" className="text-xs">{t(`grants.${grant.type as 'bachelor' | 'master' | 'phd' | 'internship'}`)}</Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          {t("common.details")} <ExternalLink className="ml-1 h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
