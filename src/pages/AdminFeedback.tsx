import { useState } from "react";
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  AlertCircle, 
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/shared/Loader";
import { toast } from "@/hooks/use-toast";
import {
  useAllFeedback,
  useFeedbackStats,
  useUpdateFeedback,
  useDeleteFeedback,
  type FeedbackAdmin,
  type FeedbackUpdate,
} from "@/hooks/useFeedback";

const typeConfig = {
  suggestion: { icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  complaint: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  bug: { icon: Bug, color: "text-orange-500", bg: "bg-orange-500/10" },
  other: { icon: HelpCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
};

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  reviewed: { icon: Eye, color: "text-blue-500", label: "Reviewed" },
  resolved: { icon: CheckCircle, color: "text-green-500", label: "Resolved" },
  dismissed: { icon: XCircle, color: "text-gray-500", label: "Dismissed" },
};

const AdminFeedback = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackAdmin | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");

  const { data: stats } = useFeedbackStats();
  const { data: feedback, isLoading } = useAllFeedback(
    page,
    statusFilter || undefined,
    typeFilter || undefined
  );
  const updateFeedback = useUpdateFeedback();
  const deleteFeedback = useDeleteFeedback();

  const handleViewDetail = (item: FeedbackAdmin) => {
    setSelectedFeedback(item);
    setAdminNotes(item.admin_notes || "");
    setNewStatus(item.status);
    setIsDetailOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedFeedback) return;

    const data: FeedbackUpdate = {};
    if (newStatus !== selectedFeedback.status) {
      data.status = newStatus as FeedbackUpdate["status"];
    }
    if (adminNotes !== (selectedFeedback.admin_notes || "")) {
      data.admin_notes = adminNotes;
    }

    if (Object.keys(data).length === 0) {
      setIsDetailOpen(false);
      return;
    }

    try {
      await updateFeedback.mutateAsync({ id: selectedFeedback.id, data });
      toast({ title: "Feedback updated" });
      setIsDetailOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      await deleteFeedback.mutateAsync(id);
      toast({ title: "Feedback deleted" });
      setIsDetailOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Feedback Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage user feedback
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="card-elevated p-4">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-2xl font-bold text-blue-500">{stats.reviewed}</p>
              <p className="text-sm text-muted-foreground">Reviewed</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-2xl font-bold text-green-500">{stats.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
            <div className="card-elevated p-4">
              <p className="text-2xl font-bold text-gray-500">{stats.dismissed}</p>
              <p className="text-sm text-muted-foreground">Dismissed</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
              <SelectItem value="complaint">Complaint</SelectItem>
              <SelectItem value="bug">Bug Report</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Feedback List */}
        {isLoading ? (
          <Loader />
        ) : feedback?.items.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No feedback found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback?.items.map((item) => {
              const TypeIcon = typeConfig[item.type as keyof typeof typeConfig]?.icon || HelpCircle;
              const typeStyle = typeConfig[item.type as keyof typeof typeConfig];
              const statusStyle = statusConfig[item.status as keyof typeof statusConfig];
              const StatusIcon = statusStyle?.icon || Clock;

              return (
                <div
                  key={item.id}
                  className="card-elevated p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetail(item)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${typeStyle?.bg}`}>
                      <TypeIcon className={`w-5 h-5 ${typeStyle?.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">
                          {item.subject}
                        </h3>
                        <Badge variant="outline" className={statusStyle?.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusStyle?.label}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.message}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.user_name || "Anonymous"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {item.user_email || item.email}
                        </span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {feedback && feedback.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {feedback.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(feedback.pages, p + 1))}
              disabled={page === feedback.pages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Feedback Detail</DialogTitle>
            </DialogHeader>
            
            {selectedFeedback && (
              <div className="space-y-4">
                {/* Type and Status */}
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="capitalize">
                    {selectedFeedback.type}
                  </Badge>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* User Info */}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="text-muted-foreground">From: </span>
                    <span className="font-medium">
                      {selectedFeedback.user_name || "Anonymous"}
                    </span>
                    {" "}
                    <span className="text-muted-foreground">
                      ({selectedFeedback.user_email || selectedFeedback.email})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted on {formatDate(selectedFeedback.created_at)}
                  </p>
                </div>

                {/* Subject */}
                <div>
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{selectedFeedback.subject}</p>
                </div>

                {/* Message */}
                <div>
                  <Label className="text-muted-foreground">Message</Label>
                  <p className="whitespace-pre-wrap bg-muted p-3 rounded-lg text-sm">
                    {selectedFeedback.message}
                  </p>
                </div>

                {/* Admin Notes */}
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Add internal notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {selectedFeedback.reviewed_at && (
                  <p className="text-xs text-muted-foreground">
                    Last reviewed: {formatDate(selectedFeedback.reviewed_at)}
                  </p>
                )}
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={() => selectedFeedback && handleDelete(selectedFeedback.id)}
                disabled={deleteFeedback.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateFeedback.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminFeedback;
