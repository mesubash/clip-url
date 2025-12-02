import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Link2, 
  LogOut,
  LogIn,
  Menu,
  X,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: Home, label: "Shorten", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", auth: true },
  { icon: BarChart3, label: "Analytics", path: "/analytics", auth: true },
  { icon: Settings, label: "Settings", path: "/settings", auth: true },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const filteredNavItems = navItems.filter(item => !item.auth || isAuthenticated);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Link2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Shortify</span>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="hover:bg-accent"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-[260px] bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300 ease-out",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-sidebar-border">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Link2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Shortify</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Upgrade Card */}
          <div className="p-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-sm text-foreground">Go Pro</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Unlock unlimited links, custom domains & more
              </p>
              <Button size="sm" className="w-full gradient-primary text-primary-foreground text-xs h-8">
                Upgrade Now
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-sidebar-border">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-all duration-200 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-all duration-200"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
