import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { labelKey: "common.home", path: "/" },
  { labelKey: "common.grants", path: "/grants" },
  { labelKey: "common.telegram", path: "/telegram" },
  { labelKey: "common.learning", path: "/learn" },
  { labelKey: "common.pricing", path: "/pricing" },
];

export function HeaderNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="StudyQadam"
              className="h-36 object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 relative">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-5 py-2 rounded-full text-sm font-medium"
                >
                  {/* Sliding background */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-accent/70 rounded-full backdrop-blur-sm"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                        mass: 0.6,
                      }}
                    />
                  )}

                  {/* Text */}
                  <span
                    className={cn(
                      "relative z-10 transition-colors",
                      isActive
                        ? "text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />

            {isLoggedIn ? (
              <Link to="/profile">
                <Button
                  size="sm"
                  className="gradient-primary text-primary-foreground rounded-full px-5 hover:opacity-90 gap-2"
                >
                  <User className="h-4 w-4" />
                  {t("common.profile")}
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  className="gradient-primary text-primary-foreground rounded-full px-5 hover:opacity-90"
                >
                  {t("common.login")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {open && (
          <div className="md:hidden pb-4 border-t border-border/50 pt-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}

            <div className="pt-2 px-4 space-y-2">
              <div className="pb-2">
                <LanguageSwitcher />
              </div>

              {isLoggedIn ? (
                <Link
                  to="/profile"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  <Button
                    size="sm"
                    className="w-full gradient-primary text-primary-foreground gap-2"
                  >
                    <User className="h-4 w-4" />
                    {t("common.profile")}
                  </Button>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  <Button
                    size="sm"
                    className="w-full gradient-primary text-primary-foreground"
                  >
                    {t("common.login")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}