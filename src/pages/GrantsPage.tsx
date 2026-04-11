import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { GrantCard } from "@/components/GrantCard";
import { mockGrants } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

const countries = [...new Set(mockGrants.map((g) => g.country))];
const types = ["bachelor", "master", "phd", "internship"] as const;

export default function GrantsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");
  const [funding, setFunding] = useState("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return mockGrants.filter((g) => {
      if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (country !== "all" && g.country !== country) return false;
      if (type !== "all" && g.type !== type) return false;
      if (funding !== "all" && g.funding !== funding) return false;
      return true;
    });
  }, [search, country, type, funding]);

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
            <SelectTrigger className="w-full sm:w-36 rounded-full"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>{[<SelectItem key="all" value="all">All Types</SelectItem>, ...types.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)]}</SelectContent>
          </Select>
          <Select value={funding} onValueChange={setFunding}>
            <SelectTrigger className="w-full sm:w-36 rounded-full"><SelectValue placeholder="Funding" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Funding</SelectItem><SelectItem value="full">Fully Funded</SelectItem><SelectItem value="partial">Partial</SelectItem></SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} grant{filtered.length !== 1 ? "s" : ""} found</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((grant, i) => (
            <motion.div key={grant.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GrantCard grant={grant} saved={savedIds.has(grant.id)} onSave={() => toggleSave(grant.id)} />
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-16"><p className="text-muted-foreground">No grants match your filters.</p></div>}
      </div>
    </PageLayout>
  );
}
