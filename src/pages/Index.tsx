import { useState } from "react";
import { Link2, Sparkles, ArrowRight, Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/shared/CopyButton";
import { QRCodePreview } from "@/components/shared/QRCodePreview";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleShorten = async () => {
    if (!longUrl) {
      toast({
        title: "Please enter a URL",
        description: "Enter a valid URL to shorten",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const alias = customAlias || Math.random().toString(36).substring(2, 8);
    setShortUrl(`https://shrt.io/${alias}`);
    setIsLoading(false);
    
    toast({
      title: "Link created!",
      description: "Your shortened URL is ready to use",
    });
  };

  const handleReset = () => {
    setLongUrl("");
    setCustomAlias("");
    setShortUrl("");
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Simple & Fast
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Shorten your links
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Create short, memorable links in seconds. Track clicks and analyze your audience.
              </p>
            </div>

            {/* URL Shortener Card */}
            <div className="bg-card border rounded-2xl shadow-card p-6 md:p-8 space-y-6">
              {!shortUrl ? (
                <>
                  {/* Long URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="long-url" className="text-sm font-medium">
                      Destination URL
                    </Label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="long-url"
                        type="url"
                        placeholder="https://example.com/very-long-url-here"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>

                  {/* Custom Alias Input */}
                  <div className="space-y-2">
                    <Label htmlFor="alias" className="text-sm font-medium">
                      Custom Alias <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">shrt.io/</span>
                      <Input
                        id="alias"
                        placeholder="my-link"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>

                  {/* Shorten Button */}
                  <Button
                    onClick={handleShorten}
                    disabled={isLoading}
                    size="xl"
                    className="w-full"
                  >
                    {isLoading ? (
                      <span className="animate-pulse-soft">Creating...</span>
                    ) : (
                      <>
                        Shorten URL
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                /* Result View */
                <div className="space-y-6 animate-scale-in">
                  <div className="flex items-center gap-2 text-success">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Link created successfully!</span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Short URL */}
                    <div className="flex-1 space-y-3 w-full">
                      <Label className="text-sm font-medium">Your shortened URL</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-accent rounded-lg px-4 py-3">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-medium hover:underline break-all"
                          >
                            {shortUrl}
                          </a>
                        </div>
                        <CopyButton value={shortUrl} variant="default" size="default" />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {longUrl}
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">QR Code</Label>
                      <div className="p-3 bg-background border rounded-xl">
                        <QRCodePreview value={shortUrl} size={100} />
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" onClick={handleReset} className="w-full">
                    Shorten Another URL
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;
