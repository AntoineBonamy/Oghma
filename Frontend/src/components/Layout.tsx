import { useState, useRef, useEffect, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/Authcontext";
import { logoutApi } from "@/api/auth";

////////////////////
// ICÔNES (SVG inline, pas de dépendance)
////////////////////

const IconGlobe = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
 
const IconScroll = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);
 
const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
 
const IconLogOut = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

////////////////////
// LIENS DE NAVIGATION
////////////////////

const navLinks = [
  { to: "/worlds",      label: "Mondes",      icon: <IconGlobe /> },
  { to: "/characters",  label: "Personnages", icon: <IconScroll /> },
  { to: "/invitations", label: "Invitations", icon: <IconMail /> },
];

////////////////////
// SOUS-COMPOSANT : menu profil
////////////////////
 
interface ProfileMenuProps {
  initials: string;
  username?: string;
  email?: string;
  onLogout: () => void;
  showName?: boolean;
}

function ProfileMenu({ initials, username, email, onLogout, showName = false }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
 
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-violet-900 border border-violet-700/50 flex items-center justify-center text-xs font-bold text-violet-300 shrink-0">
          {initials}
        </div>
        {showName && (
          <span className="text-sm text-slate-300">{username}</span>
        )}
      </button>
 
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-slate-800">
            {showName ? (
              <p className="text-xs text-slate-500 truncate">{email}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-200">{username}</p>
                <p className="text-xs text-slate-500 truncate">{email}</p>
              </>
            )}
          </div>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <IconLogOut />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}

////////////////////
// LAYOUT
////////////////////

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
 
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";
 
  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // On logout côté client même si l'API échoue
    } finally {
      logout();
      navigate("/login");
    }
  };
 
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
 
      {/* ── NAVBAR DESKTOP ── */}
      <header className="hidden md:flex items-center justify-between px-6 h-14 bg-slate-900 border-b border-slate-800 shrink-0">
 
        <NavLink to="/" className="flex items-center gap-2 text-slate-100">
          <span className="text-violet-400 text-lg leading-none">᛭</span>
          <span className="text-sm font-bold tracking-widest uppercase">Oghma</span>
        </NavLink>
 
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "px-3 py-1.5 rounded text-xs tracking-widest uppercase font-medium transition-colors",
                  isActive
                    ? "text-violet-400 bg-violet-950/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
 
        <ProfileMenu
          initials={initials}
          username={user?.username}
          email={user?.email}
          onLogout={handleLogout}
          showName
        />
      </header>
 
      {/* ── TOPBAR MOBILE ── */}
      <header className="md:hidden flex items-center justify-between px-4 h-12 bg-slate-900 border-b border-slate-800 shrink-0">
        <NavLink to="/" className="flex items-center gap-2 text-slate-100">
          <span className="text-violet-400 text-lg leading-none">᛭</span>
          <span className="text-sm font-bold tracking-widest uppercase">Oghma</span>
        </NavLink>
 
        <ProfileMenu
          initials={initials}
          username={user?.username}
          email={user?.email}
          onLogout={handleLogout}
        />
      </header>
 
      {/* ── CONTENU ── */}
      <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
        {children}
      </main>
 
      {/* ── BOTTOM BAR MOBILE ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center bg-slate-900 border-t border-slate-800 z-40">
        {navLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] tracking-wider uppercase font-medium transition-colors",
                isActive
                  ? "text-violet-400"
                  : "text-slate-500 hover:text-slate-300",
              ].join(" ")
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
 
    </div>
  );
}