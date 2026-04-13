import { useTranslation } from "react-i18next";
import type { LocalizedText, LocalizedArray } from "@/lib/api";

type Lang = "en" | "ru" | "kz";

export function useLocale() {
  const { i18n } = useTranslation();
  const lang = (i18n.language as Lang) || "en";

  const lt = (text: LocalizedText | string | undefined): string => {
    if (!text) return "";
    if (typeof text === "string") return text;
    return text[lang] || text.en || "";
  };

  const la = (arr: LocalizedArray | string[] | undefined): string[] => {
    if (!arr) return [];
    if (Array.isArray(arr)) return arr;
    return arr[lang] || arr.en || [];
  };

  return { lang, lt, la };
}
