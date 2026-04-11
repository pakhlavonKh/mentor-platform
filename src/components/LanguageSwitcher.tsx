import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useRef, useEffect, useState } from "react";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "kz", label: "KZ" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [style, setStyle] = useState({ x: 0, width: 0 });

  const selectedIndex = LANGUAGES.findIndex(
    (lang) => lang.code === i18n.language,
  );

  const updatePosition = () => {
    const el = refs.current[selectedIndex];
    const container = containerRef.current;

    if (el && container) {
      setStyle({
        x: el.offsetLeft,
        width: el.offsetWidth - 6,
      });
    }
  };

  useEffect(() => {
    updatePosition();
  }, [i18n.language]);

  useEffect(() => {
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center bg-muted/50 rounded-full border border-border/30 p-1"
    >
      {/* Background */}
      <motion.div
        className="absolute top-1 bottom-1 bg-primary rounded-full will-change-transform"
        initial={false}
        animate={{
          x: style.x,
          width: style.width,
        }}
        transition={{
          type: "spring",
          stiffness: 360,
          damping: 30,
          mass: 0.7,
        }}
      />

      {/* Buttons */}
      {LANGUAGES.map((lang, i) => (
        <button
          key={lang.code}
          ref={(el) => (refs.current[i] = el)}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={cn(
            "relative px-3 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-colors duration-150",
            i18n.language === lang.code
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
