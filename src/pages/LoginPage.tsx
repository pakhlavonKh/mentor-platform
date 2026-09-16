import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success(t("auth.loginSuccess"));
      const role = (user && user.role) || localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData") || "null")?.role : null;
      if (role === "admin") navigate("/admin");
      else if (role === "mentor" || role === "tutor") navigate("/mentor");
      else navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen sm:h-screen sm:max-h-screen sm:overflow-hidden bg-background flex flex-col items-center justify-center px-4 py-3 sm:py-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md my-auto"
      >
        <div className="flex justify-center mb-3 sm:mb-4">
          <img
            src="/logo.png"
            alt="StudyQadam"
            className="h-10 sm:h-12 object-contain"
          />
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader className="text-center p-4 pb-2 sm:p-5 sm:pb-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {t("auth.login")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("auth.dontHaveAccount")}{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                {t("auth.registerNow")}
              </Link>
            </p>
          </CardHeader>

          <CardContent className="p-4 pt-1 sm:p-5 sm:pt-1">
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  {t("auth.email")}
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-9 sm:h-10 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-9 sm:h-10 rounded-lg pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right -mt-0.5">
                <Link
                  to="#"
                  className="text-xs text-primary hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-primary-foreground rounded-lg h-9 sm:h-10 font-medium text-sm"
              >
                {loading ? t("common.apply") : t("auth.loginNow")}
              </Button>

              <div className="relative my-2 sm:my-2.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{t("auth.or")}</span>
                </div>
              </div>

              <GoogleAuthButton text="continue_with" />
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
