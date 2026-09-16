import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Send, Mail, Phone, ExternalLink } from "lucide-react";

export function Footer() {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/40 backdrop-blur-md mt-auto px-4 sm:px-6 lg:px-8">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto py-12 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Col 1: Brand & About (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="StudyQadam"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {t("footer.aboutDesc")}
            </p>
            {/* Subtle, elegant security badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/70 border border-border/80 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{t("footer.securityBadge")}</span>
            </div>
          </div>

          {/* Col 2: Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-foreground">
              {t("footer.navigation")}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/grants" className="hover:text-foreground transition-colors">
                  {t("common.grants")}
                </Link>
              </li>
              <li>
                <Link to="/summer-programs" className="hover:text-foreground transition-colors">
                  {t("common.summerPrograms")}
                </Link>
              </li>
              <li>
                <Link to="/foundations" className="hover:text-foreground transition-colors">
                  {t("common.foundations")}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-foreground transition-colors">
                  {t("common.pricing")}
                </Link>
              </li>
              <li>
                <Link to="/learn" className="hover:text-foreground transition-colors">
                  {t("common.learning")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Compliance (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-foreground">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  {t("footer.termsOfService")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  {t("footer.personalDataNotice")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacts & Community (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-foreground">
              {t("footer.contactUs")}
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://t.me/studyqadam_corporate"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <Send className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <span className="truncate">Telegram</span>
                  <ExternalLink className="w-3 h-3 opacity-50 ml-auto shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@studyqadam.kz"
                  className="hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <span className="truncate">support@studyqadam.kz</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>+90 500 000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-10 pt-6 border-t border-border/50 text-xs text-muted-foreground/80 leading-relaxed">
          <p>{t("footer.disclaimer")}</p>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-border/50 py-4 bg-muted/20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {currentYear} StudyQadam. {t("footer.rights")}</p>
          <div className="flex items-center gap-2 text-muted-foreground/70">
            <span>KZ & Global Education</span>
            <span>•</span>
            <span className="uppercase font-medium text-foreground/80">{i18n.language || "ru"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
