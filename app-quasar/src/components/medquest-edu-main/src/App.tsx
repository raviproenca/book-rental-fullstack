import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { CommandPalette } from "@/components/CommandPalette";
import { ShortcutsModal } from "@/components/ShortcutsModal";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingFallback } from "@/components/LoadingFallback";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const Dashboard = lazy(() => import("./pages/Index"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const PracticeConfigPage = lazy(() => import("./pages/PracticeConfigPage"));
const PerformancePage = lazy(() => import("./pages/PerformancePage"));
const SimuladosHubPage = lazy(() => import("./pages/SimuladosHubPage"));
const SimuladoConfigPage = lazy(() => import("./pages/SimuladoConfigPage"));
const SimuladoExamPage = lazy(() => import("./pages/SimuladoExamPage"));
const SimuladoResultsPage = lazy(() => import("./pages/SimuladoResultsPage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));
const GroupsHubPage = lazy(() => import("./pages/GroupsHubPage"));
const GroupDetailPage = lazy(() => import("./pages/GroupDetailPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const QuestionsManager = lazy(() => import("./pages/admin/QuestionsManager"));
const QuestionEditor = lazy(() => import("./pages/admin/QuestionEditor"));
const UsersManager = lazy(() => import("./pages/admin/UsersManager"));
const DisciplinesManager = lazy(() => import("./pages/admin/DisciplinesManager"));
const SubscriptionsPanel = lazy(() => import("./pages/admin/SubscriptionsPanel"));
const SubAnalyticsPage = lazy(() => import("./pages/admin/SubAnalyticsPage"));
const SubPlansPage = lazy(() => import("./pages/admin/SubPlansPage"));
const CouponsManager = lazy(() => import("./pages/admin/CouponsManager"));
const CouponDetailPage = lazy(() => import("./pages/admin/CouponDetailPage"));
const InfluencersAdminPage = lazy(() => import("./pages/admin/InfluencersAdminPage"));
const InfluencersOverviewPage = lazy(() => import("./pages/admin/InfluencersOverviewPage"));
const InfluencerDetailPage = lazy(() => import("./pages/admin/InfluencerDetailPage"));
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage"));
const LandingSettingsPage = lazy(() => import("./pages/admin/LandingSettingsPage"));

const queryClient = new QueryClient();

function AppShell() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleShowShortcuts = useCallback(() => {
    setCmdOpen(false);
    setShortcutsOpen(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "?" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        if (!cmdOpen) setShortcutsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cmdOpen]);

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireCompleteProfile={false}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* App (with layout) — protected */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/praticar" element={<ProtectedRoute><AppLayout><PracticeConfigPage /></AppLayout></ProtectedRoute>} />
          <Route path="/praticar/sessao" element={<ProtectedRoute><AppLayout><PracticePage /></AppLayout></ProtectedRoute>} />
          <Route path="/simulados" element={<ProtectedRoute><AppLayout><SimuladosHubPage /></AppLayout></ProtectedRoute>} />
          <Route path="/simulados/novo" element={<ProtectedRoute><SimuladoConfigPage /></ProtectedRoute>} />
          <Route path="/simulados/ativo" element={<ProtectedRoute><SimuladoExamPage /></ProtectedRoute>} />
          <Route path="/simulados/:id" element={<ProtectedRoute><SimuladoResultsPage /></ProtectedRoute>} />
          <Route path="/desempenho" element={<ProtectedRoute><AppLayout><PerformancePage /></AppLayout></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><AppLayout><BookmarksPage /></AppLayout></ProtectedRoute>} />
          <Route path="/review" element={<ProtectedRoute><AppLayout><ReviewPage /></AppLayout></ProtectedRoute>} />
          <Route path="/grupos" element={<ProtectedRoute><AppLayout><GroupsHubPage /></AppLayout></ProtectedRoute>} />
          <Route path="/grupos/:id" element={<ProtectedRoute><AppLayout><GroupDetailPage /></AppLayout></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><AppLayout><LeaderboardPage /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/configuracoes" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />

          {/* Admin — protected + requireAdmin */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/questoes" element={<ProtectedRoute requireAdmin><AdminLayout><QuestionsManager /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/questions/new" element={<ProtectedRoute requireAdmin><AdminLayout><QuestionEditor /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/questions/:id/edit" element={<ProtectedRoute requireAdmin><AdminLayout><QuestionEditor /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute requireAdmin><AdminLayout><UsersManager /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/disciplinas" element={<ProtectedRoute requireAdmin><AdminLayout><DisciplinesManager /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/assinaturas" element={<ProtectedRoute requireAdmin><AdminLayout><SubscriptionsPanel /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/assinaturas/analytics" element={<ProtectedRoute requireAdmin><AdminLayout><SubAnalyticsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/assinaturas/planos" element={<ProtectedRoute requireAdmin><AdminLayout><SubPlansPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/cupons" element={<ProtectedRoute requireAdmin><AdminLayout><CouponsManager /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/cupons/:id" element={<ProtectedRoute requireAdmin><AdminLayout><CouponDetailPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/assinaturas/cupons" element={<ProtectedRoute requireAdmin><Navigate to="/admin/cupons" replace /></ProtectedRoute>} />
          <Route path="/admin/influenciadores" element={<ProtectedRoute requireAdmin><AdminLayout><InfluencersAdminPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/influenciadores/visao-geral" element={<ProtectedRoute requireAdmin><AdminLayout><InfluencersOverviewPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/influenciadores/:id" element={<ProtectedRoute requireAdmin><AdminLayout><InfluencerDetailPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reportes" element={<ProtectedRoute requireAdmin><AdminLayout><ReportsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/landing" element={<ProtectedRoute requireAdmin><AdminLayout><LandingSettingsPage /></AdminLayout></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onShowShortcuts={handleShowShortcuts} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
