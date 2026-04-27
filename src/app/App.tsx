import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";

import NavigationHub from "./components/NavigationHub";
import LandingPage from "./components/LandingPage";
import SignUpPage from "./components/SignUpPage";
import LogInPage from "./components/LogInPage";
import CreateOrganization from "./components/CreateOrganization";
import OrganizationSelection from "./components/OrganizationSelection";
import AcceptInvite from "./components/AcceptInvite";
import MembersAndInvites from "./components/MembersAndInvites";
import Dashboard from "./components/Dashboard";
import VaultPage from "./components/VaultPage";
import NewEngagement from "./components/NewEngagement";
import BriefReview from "./components/BriefReview";
import EngagementWorkspace from "./components/EngagementWorkspace";
import UsagePage from "./components/UsagePage";
import BillingPage from "./components/BillingPage";
import SettingsPage from "./components/SettingsPage";
import { useAppData } from "./lib/AppProvider";

function LoadingScreen() {
  return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-black/60">Loading…</div>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAppData();
  if (isLoading) return <LoadingScreen />;
  if (session?.authenticated) {
    if (!session.bootstrapReady) {
      return <Navigate to={session.organizations.length > 1 ? "/select-organization" : "/create-organization"} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAppData();
  const location = useLocation();
  if (isLoading) return <LoadingScreen />;
  if (!session?.authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

function RequireWorkspace({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAppData();
  if (isLoading) return <LoadingScreen />;
  if (!session?.authenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!session.bootstrapReady) {
    return <Navigate to={session.organizations.length > 1 ? "/select-organization" : "/create-organization"} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<NavigationHub />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <SignUpPage />
          </PublicOnly>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LogInPage />
          </PublicOnly>
        }
      />
      <Route
        path="/create-organization"
        element={
          <RequireAuth>
            <CreateOrganization />
          </RequireAuth>
        }
      />
      <Route
        path="/select-organization"
        element={
          <RequireAuth>
            <OrganizationSelection />
          </RequireAuth>
        }
      />
      <Route path="/accept-invite" element={<AcceptInvite />} />
      <Route
        path="/members"
        element={
          <RequireWorkspace>
            <MembersAndInvites />
          </RequireWorkspace>
        }
      />
      <Route
        path="/vault"
        element={
          <RequireWorkspace>
            <VaultPage />
          </RequireWorkspace>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireWorkspace>
            <Dashboard />
          </RequireWorkspace>
        }
      />
      <Route
        path="/new-engagement"
        element={
          <RequireWorkspace>
            <NewEngagement />
          </RequireWorkspace>
        }
      />
      <Route
        path="/brief-review"
        element={
          <RequireWorkspace>
            <BriefReview />
          </RequireWorkspace>
        }
      />
      <Route
        path="/workspace"
        element={
          <RequireWorkspace>
            <EngagementWorkspace />
          </RequireWorkspace>
        }
      />
      <Route
        path="/usage"
        element={
          <RequireWorkspace>
            <UsagePage />
          </RequireWorkspace>
        }
      />
      <Route
        path="/billing"
        element={
          <RequireWorkspace>
            <BillingPage />
          </RequireWorkspace>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireWorkspace>
            <SettingsPage />
          </RequireWorkspace>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
