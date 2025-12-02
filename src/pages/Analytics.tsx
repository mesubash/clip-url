import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/shared/StatsCard";
import { MousePointerClick, Globe, Smartphone, Monitor, Clock } from "lucide-react";
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

// Mock data
const clickData = [
  { date: "Nov 26", clicks: 45 },
  { date: "Nov 27", clicks: 72 },
  { date: "Nov 28", clicks: 89 },
  { date: "Nov 29", clicks: 124 },
  { date: "Nov 30", clicks: 98 },
  { date: "Dec 01", clicks: 156 },
  { date: "Dec 02", clicks: 178 },
];

const topCountries = [
  { country: "United States", clicks: 2847, percentage: 42 },
  { country: "United Kingdom", clicks: 1243, percentage: 18 },
  { country: "Germany", clicks: 892, percentage: 13 },
  { country: "Canada", clicks: 756, percentage: 11 },
  { country: "France", clicks: 534, percentage: 8 },
];

const devices = [
  { type: "Desktop", percentage: 58, icon: Monitor },
  { type: "Mobile", percentage: 38, icon: Smartphone },
  { type: "Tablet", percentage: 4, icon: Monitor },
];

const recentActivity = [
  { time: "2 min ago", location: "New York, US", device: "Chrome / Mac" },
  { time: "5 min ago", location: "London, UK", device: "Safari / iPhone" },
  { time: "12 min ago", location: "Berlin, DE", device: "Firefox / Windows" },
  { time: "18 min ago", location: "Toronto, CA", device: "Chrome / Android" },
  { time: "25 min ago", location: "Paris, FR", device: "Safari / Mac" },
];

const Analytics = () => {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track performance across all your links</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Clicks"
            value="6,716"
            icon={MousePointerClick}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Unique Visitors"
            value="4,892"
            icon={Globe}
          />
          <StatsCard
            title="Avg. Daily Clicks"
            value="109"
            icon={Clock}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Countries"
            value="24"
            icon={Globe}
          />
        </div>

        {/* Click Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Click Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clickData}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(195, 80%, 35%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(195, 80%, 35%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(195, 80%, 35%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorClicks)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Top Countries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCountries.map((item, index) => (
                <div key={item.country} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-4">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.country}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.clicks.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Devices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {devices.map((device) => (
                <div key={device.type} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <device.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{device.type}</span>
                      <span className="text-sm text-muted-foreground">{device.percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <div>
                      <p className="text-sm font-medium">{activity.location}</p>
                      <p className="text-xs text-muted-foreground">{activity.device}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analytics;
