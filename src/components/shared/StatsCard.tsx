import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn(
      "card-interactive p-5 group",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              trend.isPositive 
                ? "text-success bg-success/10" 
                : "text-destructive bg-destructive/10"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              {Math.abs(trend.value)}% from last week
            </div>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl bg-accent border border-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
