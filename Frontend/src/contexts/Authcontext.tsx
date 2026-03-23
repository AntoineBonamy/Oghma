import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "@/api/auth";

////////////////////
// TYPES
////////////////////

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
    isAuthenticated: boolean;
  isLoading: boolean; // true tant que le localStorage n'a pas été lu
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;

}

////////////////////
// CONTEXT
////////////////////

const AuthContext = createContext<AuthContextType | null>(null);

////////////////////
// PROVIDER
////////////////////

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // bloquant par défaut

  // Réhydratation depuis le localStorage au démarrage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
 
      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // JSON corrompu — on nettoie
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    } finally {
      // Dans tous les cas, on débloque le rendu
      setIsLoading(false);
    }
  }, []);

  const login = (user: AuthUser, accessToken: string, refreshToken: string) => {
    setUser(user);
    setAccessToken(accessToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

    // Utilisé par l'intercepteur axios pour mettre à jour les tokens silencieusement
  const updateTokens = (accessToken: string, refreshToken: string) => {
    setAccessToken(accessToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        logout,
        updateTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

////////////////////
// HOOK
////////////////////

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }

  return context;
};
