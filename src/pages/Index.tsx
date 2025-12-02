import { useState, useEffect, useCallback } from "react";
import { Link2, Sparkles, ArrowRight, Check, Zap, Shield, Globe, Calendar } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/shared/CopyButton";
import { QRCodePreview } from "@/components/shared/QRCodePreview";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateUrl } from "@/hooks/useUrls";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "Links created instantly" },
  { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade security" },
  { icon: Globe, title: "Global CDN", desc: "Fast redirects worldwide" },
];

const Index = () => {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const { isAuthenticated } = useAuth();
  const createUrl = useCreateUrl();
  const navigate = useNavigate();

  // Keyboard shortcuts: Cmd+V to paste, Cmd+Enter to submit
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && longUrl && !shortUrl) {
      e.preventDefault();
      document.getElementById("shorten-btn")?.click();
    }
  }, [longUrl, shortUrl]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Auto-paste from clipboard when focusing empty input
  const handleUrlFocus = useCallback(async () => {
    if (longUrl) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
        setLongUrl(text);
      }
    } catch {
      // Clipboard access denied - ignore silently
    }
  }, [longUrl]);

  const handleShorten = async () => {
    if (!longUrl) {
      toast({
        title: "Please enter a URL",
        description: "Enter a valid URL to clip",
        variant: "destructive",
      });
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create clipped URLs",
      });
      navigate("/login");
      return;
    }

    try {
      const result = await createUrl.mutateAsync({
        original_url: longUrl,
        custom_alias: customAlias || null,
        expires_at: expiresAt || null,
      });
      setShortUrl(result.short_url);
      toast({
        title: "Link created!",
        description: "Your shortened URL is ready to use",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create link",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setLongUrl("");
    setCustomAlias("");
    setExpiresAt("");
    setShortUrl("");
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center p-6 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
          
          <div className="w-full max-w-2xl space-y-8 relative z-10">
            {/* Header */}
            <div className="text-center space-y-4 animate-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent border border-primary/10 text-accent-foreground text-sm font-medium shadow-xs">
                <Sparkles className="w-4 h-4 text-primary" />
                Fast & Reliable
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                Clip your{" "}
                <span className="gradient-text">links</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Transform long URLs into short, memorable links. Track performance with powerful analytics.
              </p>
            </div>

            {/* URL Shortener Card */}
            <div className="card-elevated p-6 md:p-8 space-y-6 animate-in-scale" style={{ animationDelay: "100ms" }}>
              {!shortUrl ? (
                <>
                  {/* Long URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="long-url" className="text-sm font-medium">
                      Destination URL
                    </Label>
                    <div className="relative group">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="long-url"
                        type="url"
                        placeholder="https://example.com/very-long-url-here"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        onFocus={handleUrlFocus}
                        className="pl-11 h-12 input-focus text-base"
                      />
                    </div>
                  </div>

                  {/* Custom Alias Input */}
                  <div className="space-y-2">
                    <Label htmlFor="alias" className="text-sm font-medium">
                      Custom Alias <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap px-3 py-2 bg-muted rounded-lg">clipurl.com.np/</span>
                      <Input
                        id="alias"
                        placeholder="my-link"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value)}
                        className="h-12 input-focus"
                      />
                    </div>
                  </div>

                  {/* Expiration Date Input */}
                  <div className="space-y-2">
                    <Label htmlFor="expires" className="text-sm font-medium">
                      Expiration Date <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="expires"
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="pl-11 h-12 input-focus"
                      />
                    </div>
                  </div>

                  {/* Shorten Button */}
                  <Button
                    id="shorten-btn"
                    onClick={handleShorten}
                    disabled={createUrl.isPending}
                    size="xl"
                    className="w-full gradient-primary btn-glow text-primary-foreground font-medium"
                  >
                    {createUrl.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Clip URL
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </>
              ) : (
                /* Result View */
                <div className="space-y-6 animate-in-scale">
                  <div className="flex items-center gap-3 text-success">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center relative animate-pulse-ring">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-lg">Link created successfully!</span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Short URL */}
                    <div className="flex-1 space-y-3 w-full">
                      <Label className="text-sm font-medium">Your shortened URL</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-accent rounded-xl px-4 py-3 border border-primary/10">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-medium hover:underline break-all"
                          >
                            {shortUrl}
                          </a>
                        </div>
                        <CopyButton value={shortUrl} variant="default" size="default" className="gradient-primary btn-glow text-primary-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {longUrl}
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">QR Code</Label>
                      <div className="p-4 bg-background border rounded-xl shadow-xs">
                        <QRCodePreview value={shortUrl} size={100} showDownload />
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" onClick={handleReset} className="w-full h-11">
                    Clip Another URL
                  </Button>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 animate-in-up" style={{ animationDelay: "200ms" }}>
              {features.map((feature) => (
                <div key={feature.title} className="text-center space-y-2 p-4">
                  <div className="w-10 h-10 rounded-xl bg-accent border border-primary/10 flex items-center justify-center mx-auto">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;
