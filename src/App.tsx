import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import HomePage from "./pages/HomePage";
import GrantsPage from "./pages/GrantsPage";
import SummerProgramsPage from "./pages/SummerProgramsPage";
import FoundationsPage from "./pages/FoundationsPage";
import TelegramPage from "./pages/TelegramPage";
import LearnPage from "./pages/LearnPage";
import LearningDetail from "./pages/LearningDetail";
import PricingPage from "./pages/PricingPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPricing from "./pages/AdminPricing";
import AdminTelegram from "./pages/AdminTelegram";
import AdminLearning from "./pages/AdminLearning";
import AdminOrders from "./pages/AdminOrders";
import MentorDashboard from "./pages/MentorDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminMentors from "./pages/AdminMentors";
import CheckoutPage from "./pages/CheckoutPage";
import NotFound from "./pages/NotFound";
import AdminCalendar from "./pages/AdminCalendar";

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/grants" element={<GrantsPage />} />
          <Route path="/summer-programs" element={<SummerProgramsPage />} />
          <Route path="/foundations" element={<FoundationsPage />} />
          <Route path="/telegram" element={<TelegramPage />} />
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
          {/* Submissions removed from Admin/Mentor panels per policy */}
          <Route path="/admin/pricing" element={isLoggedIn && user?.role === "admin" ? <AdminPricing /> : <Navigate to="/login" replace />} />
          <Route path="/admin/telegram" element={isLoggedIn && user?.role === "admin" ? <AdminTelegram /> : <Navigate to="/login" replace />} />
          <Route path="/admin/learning" element={isLoggedIn && user?.role === "admin" ? <AdminLearning /> : <Navigate to="/login" replace />} />
          <Route path="/admin/calendar" element={isLoggedIn && user?.role === "admin" ? <AdminCalendar /> : <Navigate to="/login" replace />} />
          <Route path="/admin/orders" element={isLoggedIn && user?.role === "admin" ? <AdminOrders /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
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
