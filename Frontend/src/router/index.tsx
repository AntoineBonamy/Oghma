import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/Authcontext";
import Layout from "@/components/Layout";

////////////////////
// PAGES
////////////////////

// Home
import HomePage from "@/pages/home/HomePage";

// Auth
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// Worlds
import WorldsPage from "@/pages/worlds/WorldsPage";
import WorldDetailPage from "@/pages/worlds/WorldDetailPage";
import CreateWorldPage from "@/pages/worlds/CreateWorldPage";
import EditWorldPage from "@/pages/worlds/EditWorldPage";

// Campaigns
import CampaignDetailPage from "@/pages/campaigns/CampaignDetailPage";

// Characters
import CharactersPage from "@/pages/characters/CharactersPage";

// Invitations
import InvitationsPage from "@/pages/invitations/InvitationsPage";

////////////////////
// PROTECTED ROUTE
////////////////////

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

////////////////////
// ROUTER
////////////////////

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes Publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes Protégées */}
        <Route
          path="/worlds"
          element={
            <ProtectedRoute>
              <WorldsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worlds/new"
          element={
            <ProtectedRoute>
              <CreateWorldPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/worlds/:worldId"
          element={
            <ProtectedRoute>
              <WorldDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worlds/:worldId/edit"
          element={
            <ProtectedRoute>
              <EditWorldPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/worlds/:worldId/campaigns/:campaignId"
          element={
            <ProtectedRoute>
              <CampaignDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/characters"
          element={
            <ProtectedRoute>
              <CharactersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invitations"
          element={
            <ProtectedRoute>
              <InvitationsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
