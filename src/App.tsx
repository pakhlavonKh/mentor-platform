import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { lazy, Suspense } from "react";
import HomePage from "./pages/HomePage";

// Code-split routes to reduce initial bundle size and optimize page load speed
const GrantsPage = lazy(() => import("./pages/GrantsPage"));
const SummerProgramsPage = lazy(() => import("./pages/SummerProgramsPage"));
const FoundationsPage = lazy(() => import("./pages/FoundationsPage"));
const TelegramPage = lazy(() => import("./pages/TelegramPage"));
const LearnPage = lazy(() => import("./pages/LearnPage"));
const LearningDetail = lazy(() => import("./pages/LearningDetail"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPricing = lazy(() => import("./pages/AdminPricing"));
const AdminTelegram = lazy(() => import("./pages/AdminTelegram"));
const AdminLearning = lazy(() => import("./pages/AdminLearning"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const MentorDashboard = lazy(() => import("./pages/MentorDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminMentors = lazy(() => import("./pages/AdminMentors"));
const AdminSubmissions = lazy(() => import("./pages/AdminSubmissions"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminCalendar = lazy(() => import("./pages/AdminCalendar"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

function AppContent() {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    document.title = t("siteTitle");
    document.documentElement.lang = i18n.language;
  }, [t, i18n.language]);

  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/grants" element={<GrantsPage />} />
            <Route path="/summer-programs" element={<SummerProgramsPage />} />
            <Route path="/foundations" element={<FoundationsPage />} />
            <Route path="/telegram" element={<TelegramPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/learn" element={isLoggedIn ? <LearnPage /> : <Navigate to="/login" replace />} />
            <Route path="/learn/:id" element={isLoggedIn ? <LearningDetail /> : <Navigate to="/login" replace />} />
            <Route
              path="/admin"
              element={isLoggedIn && user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" replace />}
            />
            
            <Route
              path="/mentor"
              element={isLoggedIn && (user?.role === "mentor" || user?.role === "tutor") ? <MentorDashboard /> : <Navigate to="/login" replace />}
            />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/users" element={isLoggedIn && user?.role === "admin" ? <AdminUsers /> : <Navigate to="/login" replace />} />
            <Route path="/admin/mentors" element={isLoggedIn && user?.role === "admin" ? <AdminMentors /> : <Navigate to="/login" replace />} />
            <Route path="/admin/submissions" element={isLoggedIn && user?.role === "admin" ? <AdminSubmissions /> : <Navigate to="/login" replace />} />
            <Route path="/admin/pricing" element={isLoggedIn && user?.role === "admin" ? <AdminPricing /> : <Navigate to="/login" replace />} />
            <Route path="/admin/telegram" element={isLoggedIn && user?.role === "admin" ? <AdminTelegram /> : <Navigate to="/login" replace />} />
            <Route path="/admin/learning" element={isLoggedIn && user?.role === "admin" ? <AdminLearning /> : <Navigate to="/login" replace />} />
            <Route path="/admin/calendar" element={isLoggedIn && user?.role === "admin" ? <AdminCalendar /> : <Navigate to="/login" replace />} />
            <Route path="/admin/orders" element={isLoggedIn && user?.role === "admin" ? <AdminOrders /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
