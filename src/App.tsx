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
import TelegramPage from "./pages/TelegramPage";
import LearnPage from "./pages/LearnPage";
import PricingPage from "./pages/PricingPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminDashboard from "./pages/AdminDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import NotFound from "./pages/NotFound";

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
          <Route path="/telegram" element={<TelegramPage />} />
          <Route path="/learn" element={isLoggedIn ? <LearnPage /> : <Navigate to="/login" replace />} />
          <Route
            path="/admin"
            element={isLoggedIn && user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" replace />}
          />
          
          <Route
            path="/mentor"
            element={isLoggedIn && user?.role === "mentor" ? <MentorDashboard /> : <Navigate to="/login" replace />}
          />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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
