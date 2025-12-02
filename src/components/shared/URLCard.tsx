import { memo, useMemo } from "react";
import { ExternalLink, BarChart3, Pencil, Trash2, MoreVertical, Calendar, MousePointerClick, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./CopyButton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface URLCardProps {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  expiresAt?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

type LinkStatus = "active" | "expiring" | "expired";

function getLinkStatus(expiresAt?: string): LinkStatus {
  if (!expiresAt) return "active";
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= 7) return "expiring";
  return "active";
}

const statusConfig: Record<LinkStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
  active: { label: "Active", variant: "default", icon: CheckCircle2 },
  expiring: { label: "Expiring Soon", variant: "secondary", icon: AlertTriangle },
  expired: { label: "Expired", variant: "destructive", icon: Clock },
};

export const URLCard = memo(function URLCard({
  id,
  originalUrl,
  shortUrl,
  clicks,
  createdAt,
  expiresAt,
  onEdit,
  onDelete,
}: URLCardProps) {
  const status = useMemo(() => getLinkStatus(expiresAt), [expiresAt]);
  const { label, variant, icon: StatusIcon } = statusConfig[status];

  return (
    <div className="card-interactive p-3 sm:p-4 group hover:shadow-lg hover:border-primary/20 transition-all">
      <div className="flex flex-col gap-3">
        {/* URL Info - Top Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:underline truncate max-w-[200px] sm:max-w-none"
              >
                {shortUrl.replace("https://", "")}
              </a>
              <CopyButton value={shortUrl} size="sm" className="h-6 w-6 shrink-0" />
              {expiresAt && (
                <Badge variant={variant} className="text-xs gap-1 h-5 shrink-0 hidden sm:inline-flex">
                  <StatusIcon className="w-3 h-3" />
                  {label}
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{originalUrl}</p>
          </div>

          {/* Actions - Always visible dropdown on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-accent">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to={`/analytics?url=${id}`}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <a href={originalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open URL
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive cursor-pointer focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats & Status - Bottom Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2 sm:px-2.5 py-1 rounded-lg">
              <MousePointerClick className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span className="font-medium text-foreground">{clicks.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span>{createdAt}</span>
            </div>
          </div>
          
          {/* Status badge on mobile - shown at bottom */}
          {expiresAt && (
            <Badge variant={variant} className="text-xs gap-1 h-5 sm:hidden">
              <StatusIcon className="w-3 h-3" />
              {label}
            </Badge>
          )}

          {/* Desktop quick actions */}
          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link to={`/analytics?url=${id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
                <BarChart3 className="w-4 h-4" />
              </Button>
            </Link>
            <a href={originalUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});
