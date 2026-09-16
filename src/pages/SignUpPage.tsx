import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { Logo } from "@/components/Logo";

export default function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeLegal, setAgreeLegal] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect");
  const planId = searchParams.get("planId");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    if (!agreeLegal) {
      toast.error(t("auth.consentRequired"));
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, firstName, lastName);
      toast.success(t("auth.registrationSuccess"));
      if (redirect) {
        navigate(`${redirect}${planId ? `?planId=${encodeURIComponent(planId)}&newOrder=true` : ""}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.registrationError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader className="text-center pb-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {t("auth.register")}
            </h1>
            <p className="text-muted-foreground">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link to={`/login${location.search}`} className="text-primary hover:underline font-medium">
                {t("auth.loginNow")}
              </Link>
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t("auth.firstName")}
                  </label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t("auth.lastName")}
                  </label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t("auth.email")}
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="rounded-lg pr-10"
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t("auth.confirmPassword")}
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Legal & Personal Data Processing Consent */}
              <div className="rounded-lg border border-border/80 bg-secondary/30 p-3.5 space-y-2">
                <div className="flex items-start space-x-2.5">
                  <Checkbox
                    id="terms-consent"
                    checked={agreeLegal}
                    onCheckedChange={(checked) => setAgreeLegal(checked === true)}
                    disabled={loading}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="terms-consent"
                    className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
                  >
                    {t("auth.termsConsent")}{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary font-medium underline hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t("auth.termsOfService")}
                    </Link>{" "}
                    {t("auth.and")}{" "}
                    {t("auth.privacyConsent")}{" "}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary font-medium underline hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t("auth.personalData")}
                    </Link>{" "}
                    {t("auth.underThe")}{" "}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary font-medium underline hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t("auth.privacyPolicy")}
                    </Link>
                    .
                  </label>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pl-6">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{t("auth.parentalNotice")}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-primary-foreground rounded-lg h-10 font-medium"
              >
                {loading ? t("common.apply") : t("auth.registerNow")}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{t("auth.or")}</span>
                </div>
              </div>

              <GoogleAuthButton text="signup_with" />
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
