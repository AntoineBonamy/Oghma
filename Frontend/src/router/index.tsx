import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/Authcontext";

////////////////////
// PAGES (à créer)
////////////////////

// Auth
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// Worlds
import WorldsPage from "@/pages/worlds/WorldsPage";
import WorldDetailPage from "@/pages/worlds/WorldDetailPage";

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

  return <>{children}</>;
};

////////////////////
// ROUTER
////////////////////

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes Publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes Protégées */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WorldsPage />
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

export default AppRouter