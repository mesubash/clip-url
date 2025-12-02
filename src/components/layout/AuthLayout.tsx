import { Link2 } from "lucide-react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen gradient-hero flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dots opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <Link to="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
            <Link2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Shortify</span>
        </Link>
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 Shortify. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
