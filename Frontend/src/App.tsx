import { useEffect } from "react";
import AppRouter from "./router";
import { AuthProvider, useAuth } from "./contexts/Authcontext";

// Pont entre l'intercepteur axios (hors React) et le contexte Auth
const AuthBridge = () => {
  const { logout, updateTokens } = useAuth();

  useEffect(() => {
    const handleLogout = () => logout();

    const handleTokensUpdated = (e: Event) => {
      const { accessToken, refreshToken } = (e as CustomEvent).detail;
      updateTokens(accessToken, refreshToken);
    };

    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener("auth:tokensUpdated", handleTokensUpdated);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("auth:tokensUpdated", handleTokensUpdated);
    };
  }, [logout, updateTokens]);

  return null;
};

// ---

function App() {
  return (
    <AuthProvider>
      <AuthBridge />
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
