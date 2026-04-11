import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
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

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button className="p-2" onClick={() => setOpen(!open)}>
              {open ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed top-16 left-0 right-0 h-screen bg-white z-40 flex flex-col items-center justify-center"
            >
              <div className="w-full max-w-xs space-y-4">
                {NAV_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
                    className="text-center"
                  >
                    <Link
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block px-4 py-3 text-lg font-medium transition-colors",
                        location.pathname === item.path
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t(item.labelKey)}
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-6 space-y-3 text-center">
                  {isLoggedIn ? (
                    <Link
                      to="/profile"
                      className="w-full"
                      onClick={() => setOpen(false)}
                    >
                      <Button
                        size="lg"
                        className="w-fit mx-auto gradient-primary text-primary-foreground gap-2"
                      >
                        <User className="h-4 w-4" />
                        {t("common.profile")}
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full mx-auto"
                      onClick={() => setOpen(false)}
                    >
                      <Button
                        size="lg"
                        className="w-fit mx-auto  gradient-primary rounded-full text-primary-foreground text-base"
                      >
                        {t("common.login")}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}