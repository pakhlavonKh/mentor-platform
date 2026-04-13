import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { GrantCard } from "@/components/GrantCard";
import { api, type Grant } from "@/lib/api";
import { useLocale } from "@/hooks/use-locale";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

const types = ["bachelor", "master", "phd", "internship"] as const;

export default function GrantsPage() {
  const { t } = useTranslation();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");
  const [funding, setFunding] = useState("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const { lt } = useLocale();

  useEffect(() => {
    api.grants.list({ limit: "100" }).then((res) => {
      setGrants(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const countries = useMemo(() => [...new Set(grants.map((g) => g.country))], [grants]);

  const filtered = useMemo(() => {
    return grants.filter((g) => {
      if (search && !lt(g.title).toLowerCase().includes(search.toLowerCase())) return false;
      if (country !== "all" && g.country !== country) return false;
      if (type !== "all" && g.type !== type) return false;
      if (funding !== "all" && g.funding !== funding) return false;
      return true;
    });
  }, [grants, search, country, type, funding, lt]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t("grants.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("grants.description")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("grants.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-full" />
          </div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-full sm:w-44 rounded-full"><SelectValue placeholder={t("common.allCountries")} /></SelectTrigger>
            <SelectContent>{[<SelectItem key="all" value="all">{t("common.allCountries")}</SelectItem>, ...countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)]}</SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-36 rounded-full"><SelectValue placeholder={t("grantsFilter.typePlaceholder")} /></SelectTrigger>
            <SelectContent>{[<SelectItem key="all" value="all">{t("grantsFilter.allTypes")}</SelectItem>, ...types.map((tp) => <SelectItem key={tp} value={tp}>{t(`grants.${tp}`)}</SelectItem>)]}</SelectContent>
          </Select>
          <Select value={funding} onValueChange={setFunding}>
            <SelectTrigger className="w-full sm:w-36 rounded-full"><SelectValue placeholder={t("grantsFilter.fundingPlaceholder")} /></SelectTrigger>
            <SelectContent><SelectItem value="all">{t("grantsFilter.allFunding")}</SelectItem><SelectItem value="full">{t("grants.fullFunding")}</SelectItem><SelectItem value="partial">{t("grants.partialFunding")}</SelectItem></SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">{t("grantsFilter.grantsFound", { count: filtered.length })}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((grant, i) => (
            <motion.div key={grant.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GrantCard grant={grant} saved={savedIds.has(grant.id)} onSave={() => toggleSave(grant.id)} />
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-16"><p className="text-muted-foreground">{t("grantsFilter.noMatch")}</p></div>}
      </div>
    </PageLayout>
  );
}
