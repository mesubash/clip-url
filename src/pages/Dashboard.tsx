import { useState } from "react";
import { Link2, MousePointerClick, Globe, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/shared/StatsCard";
import { URLCard } from "@/components/shared/URLCard";
import { EditURLModal } from "@/components/shared/EditURLModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useUrls, useDeleteUrl, useUpdateUrl } from "@/hooks/useUrls";
import type { URLData } from "@/lib/types";

// Skeleton Components
function StatsCardSkeleton() {
  return (
    <Card className="card-interactive">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function URLCardSkeleton() {
  return (
    <Card className="card-interactive">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<URLData | null>(null);
  
  const { data, isLoading, error } = useUrls(searchQuery || undefined);
  const deleteUrl = useDeleteUrl();
  const updateUrl = useUpdateUrl();

  const urls = data?.urls || [];
  const totalClicks = data?.total_clicks || 0;

  const handleEdit = (url: URLData) => {
    setSelectedUrl(url);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUrl.mutateAsync(id);
      toast({
        title: "Link deleted",
        description: "The shortened URL has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete link",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async (editData: { alias: string; expiresAt?: string }) => {
    if (selectedUrl) {
      try {
        await updateUrl.mutateAsync({
          id: selectedUrl.id,
          data: { alias: editData.alias, expires_at: editData.expiresAt || null },
        });
        toast({
          title: "Link updated",
          description: "Your changes have been saved",
        });
        setEditModalOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update link",
          variant: "destructive",
        });
      }
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="text-center py-16">
            <p className="text-destructive">Failed to load URLs. Please try again.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage and track your shortened URLs</p>
          </div>
          <Link to="/">
            <Button className="gradient-primary btn-glow text-primary-foreground">
              <Plus className="w-4 h-4" />
              Create Link
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Links"
                value={urls.length}
                icon={Link2}
              />
              <StatsCard
                title="Total Clicks"
                value={totalClicks.toLocaleString()}
                icon={MousePointerClick}
              />
              <StatsCard
                title="Active Links"
                value={urls.length}
                icon={Globe}
              />
            </>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 input-focus"
            />
          </div>
        </div>

        {/* URL List */}
        <div className="space-y-3">
          {isLoading ? (
            <>
              <URLCardSkeleton />
              <URLCardSkeleton />
              <URLCardSkeleton />
              <URLCardSkeleton />
            </>
          ) : urls.length > 0 ? (
            urls.map((url, index) => (
              <div
                key={url.id}
                className="animate-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <URLCard
                  id={String(url.id)}
                  originalUrl={url.original_url}
                  shortUrl={url.short_url}
                  clicks={url.click_count}
                  createdAt={new Date(url.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  onEdit={() => handleEdit(url)}
                  onDelete={() => handleDelete(url.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No links found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "Create your first shortened URL"}
              </p>
              {!searchQuery && (
                <Link to="/">
                  <Button className="gradient-primary btn-glow text-primary-foreground">
                    <Plus className="w-4 h-4" />
                    Create Link
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <EditURLModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          url={selectedUrl ? {
            id: String(selectedUrl.id),
            originalUrl: selectedUrl.original_url,
            shortUrl: selectedUrl.short_url,
            clicks: selectedUrl.click_count,
            createdAt: selectedUrl.created_at,
            alias: selectedUrl.slug,
          } : undefined}
          onSave={handleSaveEdit}
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
