import { useState } from "react";
import { ExternalLink, BarChart3, Pencil, Trash2, MoreVertical, Calendar, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "./CopyButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
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

export function URLCard({
  id,
  originalUrl,
  shortUrl,
  clicks,
  createdAt,
  expiresAt,
  onEdit,
  onDelete,
}: URLCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "card-interactive p-4 group",
        isHovered && "shadow-lg border-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* URL Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary hover:underline truncate"
            >
              {shortUrl.replace("https://", "")}
            </a>
            <CopyButton value={shortUrl} size="sm" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm text-muted-foreground truncate">{originalUrl}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{clicks.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{createdAt}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
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
      </div>
    </div>
  );
}
