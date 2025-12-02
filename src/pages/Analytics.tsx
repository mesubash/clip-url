import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/shared/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { MousePointerClick, Globe, Smartphone, Monitor, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useUserAnalytics } from "@/hooks/useUrls";

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

function ChartSkeleton() {
  return (
    <Card className="card-interactive overflow-hidden">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="h-72 flex items-end gap-2 pt-8">
          {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <Skeleton 
                className="w-full rounded-t-sm" 
                style={{ height: `${height}%` }} 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CountriesSkeleton() {
  return (
    <Card className="card-interactive">
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DevicesSkeleton() {
  return (
    <Card className="card-interactive">
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-11 h-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <Card className="card-interactive">
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 px-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Static device icons mapping - defined outside component to prevent recreation
const DEVICE_ICONS: Record<string, typeof Monitor> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Monitor,
};

const Analytics = () => {
  const { data: analytics, isLoading, error } = useUserAnalytics();

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track performance across all your links</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : analytics ? (
            <>
              <StatsCard
                title="Total Clicks"
                value={analytics.total_clicks.toLocaleString()}
                icon={MousePointerClick}
              />
              <StatsCard
                title="Unique Visitors"
                value={analytics.unique_visitors.toLocaleString()}
                icon={Globe}
              />
              <StatsCard
                title="Avg. Daily Clicks"
                value={analytics.avg_daily_clicks.toFixed(0)}
                icon={TrendingUp}
              />
              <StatsCard
                title="Countries"
                value={analytics.countries_count.toString()}
                icon={Globe}
              />
            </>
          ) : (
            <>
              <StatsCard title="Total Clicks" value="0" icon={MousePointerClick} />
              <StatsCard title="Unique Visitors" value="0" icon={Globe} />
              <StatsCard title="Avg. Daily Clicks" value="0" icon={TrendingUp} />
              <StatsCard title="Countries" value="0" icon={Globe} />
            </>
          )}
        </div>

        {/* Click Trends Chart */}
        {isLoading ? (
          <ChartSkeleton />
        ) : analytics && analytics.click_data.length > 0 ? (
          <Card className="card-interactive overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Click Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.click_data}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 32%, 91%)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.06)",
                        padding: "12px 16px",
                      }}
                      labelStyle={{ color: "hsl(222, 47%, 11%)", fontWeight: 600, marginBottom: 4 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="hsl(199, 89%, 48%)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorClicks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-interactive overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Click Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center">
                <p className="text-muted-foreground">No click data available yet</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          {isLoading ? (
            <CountriesSkeleton />
          ) : (
            <Card className="card-interactive">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Top Countries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {analytics && analytics.top_countries.length > 0 ? (
                  analytics.top_countries.map((item, index) => (
                    <div key={item.country} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground w-5">{index + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{item.country}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.clicks.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No country data available yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Devices */}
          {isLoading ? (
            <DevicesSkeleton />
          ) : (
            <Card className="card-interactive">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Devices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {analytics && analytics.devices.length > 0 ? (
                  analytics.devices.map((device) => {
                    const Icon = DEVICE_ICONS[device.type] || Monitor;
                    return (
                      <div key={device.type} className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-accent border border-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">{device.type}</span>
                            <span className="text-sm font-semibold text-foreground">{device.percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No device data available yet</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        {isLoading ? (
          <ActivitySkeleton />
        ) : (
          <Card className="card-interactive">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {analytics && analytics.recent_activity.length > 0 ? (
                  analytics.recent_activity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-2.5 h-2.5 rounded-full bg-success" />
                          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success animate-ping opacity-75" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.location}</p>
                          <p className="text-xs text-muted-foreground">{activity.device}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Analytics;
