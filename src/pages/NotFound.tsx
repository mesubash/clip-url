import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Link2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Check if this might be an expired/invalid short link
  const isShortLink = location.pathname.length > 1 && !location.pathname.includes("/");
  const attemptedSlug = location.pathname.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated 404 */}
        <div className="relative">
          <h1 className="text-[150px] sm:text-[180px] font-bold text-muted/20 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-bounce">
              <Link2 className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isShortLink ? "Link Not Found" : "Page Not Found"}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {isShortLink ? (
              <>
                The link <code className="px-2 py-1 bg-muted rounded text-sm font-mono text-foreground">/{attemptedSlug}</code> doesn't exist or may have expired.
              </>
            ) : (
              "The page you're looking for doesn't exist or has been moved."
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button className="gradient-primary btn-glow text-primary-foreground w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Help text */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {isShortLink ? (
              "If you believe this link should work, please contact the link owner."
            ) : (
              <>
                Looking for something specific?{" "}
                <Link to="/dashboard" className="text-primary hover:underline">
                  Check your dashboard
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Link2 className="w-4 h-4" />
          <span className="text-sm font-medium">ClipURL</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
