import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  RefreshCw,
  LinkIcon,
  Users,
  UserX,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  Database,
  Loader2,
} from "lucide-react";
import { adminService } from "@/lib/admin";
import type { CleanupStats, CleanupResult } from "@/lib/types";

// Skeleton for cleanup task card
const CleanupTaskSkeleton = () => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 max-w-[200px]">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Skeleton for summary card
const SummarySkeleton = () => (
  <Card className="border-amber-500/20 bg-amber-500/5">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface CleanupTask {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  statKey: keyof CleanupStats;
  defaultDays?: number;
  hasDaysInput?: boolean;
  action: (days: number, dryRun: boolean) => Promise<CleanupResult>;
  color: string;
}

const AdminTools = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    task: CleanupTask | null;
    days: number;
  }>({ open: false, task: null, days: 0 });
  const [daysInputs, setDaysInputs] = useState<Record<string, number>>({
    unverified_users: 7,
    inactive_users: 30,
    zero_click_links: 90,
    old_analytics: 365,
  });

  // Fetch stats with caching and background refresh
  const { data: stats, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "cleanup-stats"],
    queryFn: () => adminService.getCleanupStats(),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 60 * 1000, // Auto-refresh every minute in background
  });

  const cleanupTasks: CleanupTask[] = [
    {
      id: "expired_links",
      title: "Expired Links",
      description: "Remove links that have passed their expiration date along with their analytics data.",
      icon: <Clock className="w-5 h-5" />,
      statKey: "expired_links",
      action: (_, dryRun) => adminService.cleanupExpiredLinks(dryRun),
      color: "text-orange-500",
    },
    {
      id: "unverified_users",
      title: "Unverified Users",
      description: "Remove users who never verified their email. OAuth users are excluded.",
      icon: <UserX className="w-5 h-5" />,
      statKey: "unverified_users",
      defaultDays: 7,
      hasDaysInput: true,
      action: (days, dryRun) => adminService.cleanupUnverifiedUsers(days, dryRun),
      color: "text-yellow-500",
    },
    {
      id: "inactive_users",
      title: "Inactive Users",
      description: "Remove users who have no links and haven't been active. Admins are excluded.",
      icon: <Users className="w-5 h-5" />,
      statKey: "inactive_users",
      defaultDays: 30,
      hasDaysInput: true,
      action: (days, dryRun) => adminService.cleanupInactiveUsers(days, dryRun),
      color: "text-red-500",
    },
    {
      id: "zero_click_links",
      title: "Zero-Click Links",
      description: "Remove old links that have never been clicked.",
      icon: <LinkIcon className="w-5 h-5" />,
      statKey: "zero_click_links",
      defaultDays: 90,
      hasDaysInput: true,
      action: (days, dryRun) => adminService.cleanupZeroClickLinks(days, dryRun),
      color: "text-blue-500",
    },
    {
      id: "old_analytics",
      title: "Old Analytics",
      description: "Remove analytics records older than specified days to save storage.",
      icon: <BarChart3 className="w-5 h-5" />,
      statKey: "old_analytics",
      defaultDays: 365,
      hasDaysInput: true,
      action: (days, dryRun) => adminService.cleanupOldAnalytics(days, dryRun),
      color: "text-purple-500",
    },
  ];

  const handlePreview = async (task: CleanupTask) => {
    setIsProcessing(task.id);
    try {
      const days = daysInputs[task.id] || task.defaultDays || 0;
      const result = await task.action(days, true);
      toast({
        title: "Preview Complete",
        description: `Found ${result.count} ${task.title.toLowerCase()} to clean up.`,
      });
      // Refresh stats in background
      queryClient.invalidateQueries({ queryKey: ["admin", "cleanup-stats"] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Preview failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCleanup = async (task: CleanupTask) => {
    const days = daysInputs[task.id] || task.defaultDays || 0;
    setConfirmDialog({ open: true, task, days });
  };

  const confirmCleanup = async () => {
    if (!confirmDialog.task) return;
    
    const task = confirmDialog.task;
    const days = confirmDialog.days;
    setConfirmDialog({ open: false, task: null, days: 0 });
    setIsProcessing(task.id);
    
    try {
      const result = await task.action(days, false);
      toast({
        title: "Cleanup Complete",
        description: `Successfully deleted ${result.count} ${task.title.toLowerCase()}.`,
      });
      // Refresh stats and admin stats in background
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Cleanup failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const totalCleanable = stats
    ? Object.values(stats).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Database className="w-6 h-6" />
              Database Cleanup Tools
            </h1>
            <p className="text-muted-foreground">
              Clean up old and unused data to optimize your database
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh Stats
          </Button>
        </div>

        {/* Summary Card */}
        {isLoading ? (
          <SummarySkeleton />
        ) : (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {totalCleanable} items can be cleaned up
                    {isFetching && !isLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review each category below. Use "Preview" to see what will be deleted before running cleanup.
                    <strong className="text-amber-600"> Deletions are permanent and cannot be undone.</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cleanup Tasks */}
        <div className="grid gap-4">
          {isLoading ? (
            <>
              <CleanupTaskSkeleton />
              <CleanupTaskSkeleton />
              <CleanupTaskSkeleton />
              <CleanupTaskSkeleton />
              <CleanupTaskSkeleton />
            </>
          ) : (
            cleanupTasks.map((task) => {
              const count = stats?.[task.statKey] || 0;
              const isTaskProcessing = isProcessing === task.id;
              
              return (
                <Card key={task.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${task.color}`}>
                          {task.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {task.title}
                            <Badge variant={count > 0 ? "destructive" : "secondary"}>
                              {count} items
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {task.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      {task.hasDaysInput && (
                        <div className="flex-1 max-w-[200px]">
                          <Label htmlFor={`days-${task.id}`} className="text-sm text-muted-foreground">
                            Older than (days)
                          </Label>
                          <Input
                            id={`days-${task.id}`}
                            type="number"
                            min={1}
                            value={daysInputs[task.id] || task.defaultDays}
                            onChange={(e) =>
                              setDaysInputs({
                                ...daysInputs,
                                [task.id]: parseInt(e.target.value) || task.defaultDays || 0,
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePreview(task)}
                          disabled={isTaskProcessing}
                        >
                          {isTaskProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          Preview
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleCleanup(task)}
                          disabled={isTaskProcessing || count === 0}
                        >
                          {isTaskProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Delete {count}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Always use "Preview" first to see what will be affected
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Run cleanup during off-peak hours to minimize impact on users
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Start with expired links and old analytics - these are safest to remove
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Be cautious with user deletions - consider reaching out to inactive users first
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                Schedule regular cleanups (monthly) to keep your database optimized
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, task: null, days: 0 })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <strong>{stats?.[confirmDialog.task?.statKey || "expired_links"] || 0}</strong>{" "}
              {confirmDialog.task?.title.toLowerCase()}.
              {confirmDialog.task?.hasDaysInput && (
                <> Older than <strong>{confirmDialog.days} days</strong>.</>
              )}
              <br /><br />
              <span className="text-destructive font-medium">
                This action cannot be undone. All associated data will be permanently removed.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCleanup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default AdminTools;
