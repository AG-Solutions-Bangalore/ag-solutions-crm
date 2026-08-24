import React, { useState } from "react";
import { DASHBOARD_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  Boxes,
  ArrowRight,
  Sparkles,
  TrendingUp,
  RefreshCw,
  FolderPlus,
  PenTool,
  Award,
  Layers,
  Calendar,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const StatCard = ({ title, count, subtitle, icon: Icon, link, index, badgeVariant, badgeText, iconColor, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
  >
    <Card
      className="cursor-pointer group relative overflow-hidden rounded-xl border border-border bg-card shadow-2xs hover:border-primary/50 hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
              {badgeText && (
                <Badge variant={badgeVariant || "secondary"} className="text-[10px] px-1.5 py-0 h-4 font-medium">
                  {badgeText}
                </Badge>
              )}
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              {count}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 pt-0.5">
                <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                {subtitle}
              </p>
            )}
          </div>

          <div className={`flex size-11 items-center justify-center rounded-xl border border-border/80 ${iconColor || "bg-primary/10 text-primary"} group-hover:scale-105 transition-all duration-200 shadow-2xs`}>
            <Icon className="size-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground font-medium transition-colors">
          <span>Manage {title.replace("Total ", "")}</span>
          <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);



function Dashboard() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: DASHBOARD_API.list,
    queryKey: ["dashboard-data"],
  });

  const dashboardData = response?.data || {};

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  const stats = [
    {
      title: "Total Enquiries",
      count: dashboardData.enquiry_count || 0,
      subtitle: "Customer leads & messages",
      icon: MessageSquare,
      link: "/enquiries",
      badgeVariant: "info",
      badgeText: "Leads",
      iconColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      title: "Total Projects",
      count: dashboardData.project_count || 0,
      subtitle: "Showcase project catalog",
      icon: Boxes,
      link: "/projects",
      badgeVariant: "purple",
      badgeText: "Portfolio",
      iconColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    {
      title: "Total Subscribers",
      count: dashboardData.newsletter_count || 0,
      subtitle: "Active newsletter signups",
      icon: Users,
      link: "/newsletter",
      badgeVariant: "success",
      badgeText: "Audience",
      iconColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
  ];

  const quickActions = [
    {
      title: "Customer Leads",
      description: "Review & manage inquiries",
      icon: MessageSquare,
      link: "/enquiries",
      iconColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      badge: "Active",
      badgeVariant: "info",
    },
    {
      title: "Add Project",
      description: "Showcase new portfolio project",
      icon: FolderPlus,
      link: "/projects/create",
      iconColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      badge: "Showcase",
      badgeVariant: "purple",
    },
    {
      title: "Create Blog",
      description: "Publish latest company insights",
      icon: PenTool,
      link: "/create-blog",
      iconColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      badge: "Articles",
      badgeVariant: "warning",
    },
    {
      title: "Partner Sponsors",
      description: "Update sponsor logos & links",
      icon: Award,
      link: "/sponsor",
      iconColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      badge: "Partners",
      badgeVariant: "rose",
    },
  ];

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* 🔹 Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dashboard Overview
            </h1>
            <Badge variant="success" className="gap-1 px-2 py-0.5 text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Server
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>{todayFormatted} • Welcome back to AG Solutions CRM</span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-9 gap-1.5 rounded-lg border-border bg-background text-xs font-medium self-start sm:self-auto opacity-100 shadow-2xs hover:bg-muted"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Updating..." : "Refresh Stats"}</span>
        </Button>
      </div>

      {/* 🔹 Key Stat Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            index={index}
            {...stat}
            onClick={() => navigate(stat.link)}
          />
        ))}
      </div>

      {/* 🔹 Quick Navigation & Workspace Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch Cards */}
        <Card className="lg:col-span-2 rounded-xl border border-border bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold text-foreground">
                  Quick Actions & Workflows
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[11px] font-normal">
                Fast navigation
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Frequent management tasks and shortcut links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={() => navigate(action.link)}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-background hover:bg-muted/50 hover:border-primary/40 transition-all text-left group cursor-pointer"
                  >
                    <div className={`p-2.5 rounded-xl border ${action.iconColor} group-hover:scale-105 transition-transform shrink-0`}>
                      <ActionIcon className="size-4" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {action.title}
                        </span>
                        <Badge variant={action.badgeVariant} className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-medium">
                          {action.badge}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* System & Health Panel */}
        <Card className="rounded-xl border border-border bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold text-foreground">
                System Status
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Backend API connection health.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">API Server</span>
                <Badge variant="success" className="gap-1 text-[11px] font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Environment</span>
                <Badge variant="info" className="text-[11px] font-medium">
                  Production
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground">Data Sync</span>
                <Badge variant="purple" className="text-[11px] font-medium">
                  React Query
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">System Health</span>
                <Badge variant="cyan" className="text-[11px] font-medium">
                  Operational
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/settings")}
              className="w-full h-8 text-xs font-medium rounded-lg border-border bg-background hover:bg-muted"
            >
              Account & Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default Dashboard;

