import { useState } from "react";
import { Link2, MousePointerClick, Globe, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/shared/StatsCard";
import { URLCard } from "@/components/shared/URLCard";
import { EditURLModal } from "@/components/shared/EditURLModal";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Mock data
const mockUrls = [
  {
    id: "1",
    originalUrl: "https://example.com/blog/how-to-build-a-url-shortener-with-react",
    shortUrl: "https://shrt.io/react-url",
    clicks: 1247,
    createdAt: "Nov 28",
    alias: "react-url",
  },
  {
    id: "2",
    originalUrl: "https://github.com/my-awesome-project/documentation/readme",
    shortUrl: "https://shrt.io/gh-docs",
    clicks: 892,
    createdAt: "Nov 25",
    alias: "gh-docs",
  },
  {
    id: "3",
    originalUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    shortUrl: "https://shrt.io/yt-vid",
    clicks: 3421,
    createdAt: "Nov 20",
    alias: "yt-vid",
  },
  {
    id: "4",
    originalUrl: "https://docs.company.com/api/v2/authentication/oauth2",
    shortUrl: "https://shrt.io/api-auth",
    clicks: 156,
    createdAt: "Nov 18",
    alias: "api-auth",
  },
];

const Dashboard = () => {
  const [urls, setUrls] = useState(mockUrls);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<typeof mockUrls[0] | null>(null);

  const filteredUrls = urls.filter(
    (url) =>
      url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.shortUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (url: typeof mockUrls[0]) => {
    setSelectedUrl(url);
    setEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setUrls(urls.filter((url) => url.id !== id));
    toast({
      title: "Link deleted",
      description: "The shortened URL has been removed",
    });
  };

  const handleSaveEdit = (data: { alias: string; expiresAt?: string }) => {
    if (selectedUrl) {
      setUrls(urls.map((url) =>
        url.id === selectedUrl.id
          ? { ...url, alias: data.alias, shortUrl: `https://shrt.io/${data.alias}` }
          : url
      ));
      toast({
        title: "Link updated",
        description: "Your changes have been saved",
      });
    }
  };

  const totalClicks = urls.reduce((acc, url) => acc + url.clicks, 0);

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage and track your shortened URLs</p>
          </div>
          <Link to="/">
            <Button>
              <Plus className="w-4 h-4" />
              Create Link
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total Links"
            value={urls.length}
            icon={Link2}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Clicks"
            value={totalClicks.toLocaleString()}
            icon={MousePointerClick}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Countries Reached"
            value={24}
            icon={Globe}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* URL List */}
        <div className="space-y-3">
          {filteredUrls.length > 0 ? (
            filteredUrls.map((url, index) => (
              <div
                key={url.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <URLCard
                  {...url}
                  onEdit={() => handleEdit(url)}
                  onDelete={() => handleDelete(url.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No links found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Create your first shortened URL"}
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <EditURLModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          url={selectedUrl || undefined}
          onSave={handleSaveEdit}
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
