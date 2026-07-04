import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useSavedGrants from "@/hooks/use-saved-grants";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { GrantCard } from "@/components/GrantCard";
import { api, type Grant } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Sun, Building2, GraduationCap, Globe, Calendar } from "lucide-react";
import { motion } from "framer-motion";

type SectionKey = "summerPrograms" | "foundations";
type GrantType = "summer_program" | "foundation";

const SECTION_CONFIG: Record<SectionKey, { grantType: GrantType; icon: typeof Sun }> = {
  summerPrograms: { grantType: "summer_program", icon: Sun },
  foundations: { grantType: "foundation", icon: Building2 },
};

interface ProgramSectionPageProps {
  sectionKey: SectionKey;
}

export default function ProgramSectionPage({ sectionKey }: ProgramSectionPageProps) {
  const { t } = useTranslation();
  const config = SECTION_CONFIG[sectionKey];
  const Icon = config.icon;
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [funding, setFunding] = useState("all");
  const { savedIds, toggleSave } = useSavedGrants();
  const { lt } = useLocale();

  useEffect(() => {
    api.grants
      .list({ type: config.grantType, limit: "100" })
      .then((res) => {
        setGrants(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [config.grantType]);

  const countries = useMemo(() => [...new Set(grants.map((g) => g.country))], [grants]);

  const filtered = useMemo(() => {
    return grants.filter((g) => {
      if (search && !lt(g.title).toLowerCase().includes(search.toLowerCase())) return false;
      if (country !== "all" && g.country !== country) return false;
      if (funding !== "all" && g.funding !== funding) return false;
      return true;
    });
  }, [grants, search, country, funding, lt]);

  const highlights = [
    { icon: GraduationCap, key: "benefit1" },
    { icon: Globe, key: "benefit2" },
    { icon: Calendar, key: "benefit3" },
  ];

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">{t(`${sectionKey}.title`)}</h1>
          </div>
          <p className="text-muted-foreground mt-1 max-w-2xl">{t(`${sectionKey}.description`)}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {highlights.map(({ icon: HighlightIcon, key }, i) => (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="gradient-card border-0 shadow-soft h-full">
                <CardContent className="p-5 space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground">
                    <HighlightIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-semibold text-card-foreground">{t(`${sectionKey}.${key}Title`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`${sectionKey}.${key}Desc`)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="border border-border/60 shadow-soft">
          <CardContent className="p-5 sm:p-6">
            <h2 className="font-display font-semibold text-lg text-card-foreground mb-2">{t(`${sectionKey}.eligibilityTitle`)}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{t(`${sectionKey}.eligibilityDesc`)}</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="font-display font-semibold text-xl text-foreground">{t(`${sectionKey}.programsTitle`)}</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("grants.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-full"
              />
            </div>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full sm:w-44 rounded-full">
                <SelectValue placeholder={t("common.allCountries")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allCountries")}</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={funding} onValueChange={setFunding}>
              <SelectTrigger className="w-full sm:w-36 rounded-full">
                <SelectValue placeholder={t("grantsFilter.fundingPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("grantsFilter.allFunding")}</SelectItem>
                <SelectItem value="full">{t("grants.fullFunding")}</SelectItem>
                <SelectItem value="partial">{t("grants.partialFunding")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {loading ? t("admin.loading") : t("grantsFilter.grantsFound", { count: filtered.length })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((grant, i) => (
              <motion.div key={grant.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GrantCard
                  grant={grant}
                  saved={savedIds.has(grant.id)}
                  onSave={() =>
                    toggleSave(grant.id, (added) => {
                      toast.success(added ? t("common.save") : t("common.delete"));
                    })
                  }
                />
              </motion.div>
            ))}
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{t("grantsFilter.noMatch")}</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
