import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/shared/StatsCard";
import { Loader } from "@/components/shared/Loader";
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

const Analytics = () => {
  const { data: analytics, isLoading, error } = useUserAnalytics();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8 max-w-6xl mx-auto flex justify-center py-16">
          <Loader size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AppLayout>
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="text-center py-16">
            <p className="text-muted-foreground">No analytics data available yet. Create some links to get started!</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const deviceIcons: Record<string, typeof Monitor> = {
    Desktop: Monitor,
    Mobile: Smartphone,
    Tablet: Monitor,
  };
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
        </div>

        {/* Click Trends Chart */}
        {analytics.click_data.length > 0 && (
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
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          <Card className="card-interactive">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Top Countries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {analytics.top_countries.length > 0 ? (
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

          {/* Devices */}
          <Card className="card-interactive">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Devices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {analytics.devices.length > 0 ? (
                analytics.devices.map((device) => {
                  const Icon = deviceIcons[device.type] || Monitor;
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
        </div>

        {/* Recent Activity */}
        <Card className="card-interactive">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {analytics.recent_activity.length > 0 ? (
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
      </div>
    </AppLayout>
  );
};

export default Analytics;
