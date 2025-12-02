import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  LogOut,
  LogIn,
  Menu,
  X,
  Scissors,
  Users,
  Shield,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: Scissors, label: "Create Link", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", auth: true },
  { icon: BarChart3, label: "Analytics", path: "/analytics", auth: true },
  { icon: Settings, label: "Settings", path: "/settings", auth: true },
] as const;

const adminNavItems = [
  { icon: Users, label: "User Management", path: "/admin/users" },
  { icon: Database, label: "Cleanup Tools", path: "/admin/tools" },
] as const;

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const isAdmin = user?.role === "admin";

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
    setMobileOpen(false);
  }, [logout, navigate]);

  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileOpen(prev => !prev), []);

  const filteredNavItems = useMemo(
    () => navItems.filter(item => !item.auth || isAuthenticated),
    [isAuthenticated]
  );

  return (
    <>
      {/* Mobile Header - Always visible on small/medium screens */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-xl border-b z-50 flex items-center justify-between px-4 xl:hidden">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/clipurl.png" alt="ClipURL" className="w-9 h-9 rounded-xl" />
          <span className="font-bold text-foreground text-lg">ClipURL</span>
        </Link>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleMobileMenu}
          className="h-10 w-10"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileOpen && (
        <div 
          className="xl:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 pt-16"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-[280px] bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-out",
        "xl:translate-x-0 xl:z-40",
        mobileOpen ? "translate-x-0 z-50" : "-translate-x-full z-50"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between gap-2.5 px-5 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2.5" onClick={closeMobileMenu}>
              <img src="/clipurl.png" alt="ClipURL" className="w-9 h-9 rounded-xl" />
              <span className="font-bold text-foreground">ClipURL</span>
            </Link>
            {/* Close button for mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={closeMobileMenu}
              className="xl:hidden h-8 w-8"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
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

            {/* Admin Section */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <div className="flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </div>
                </div>
                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
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
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-sidebar-border">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                        Admin
                      </span>
                    )}
                  </div>
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
                onClick={closeMobileMenu}
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
