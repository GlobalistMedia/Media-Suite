"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsOverview } from "@/components/analytics/analytics-overview";
import { PlatformMetrics } from "@/components/analytics/platform-metrics";
import { ContentPerformance } from "@/components/analytics/content-performance";
import { AudienceInsights } from "@/components/analytics/audience-insights";
import { EngagementTrends } from "@/components/analytics/engagement-trends";
import { TopPosts } from "@/components/analytics/top-posts";
import { GrowthMetrics } from "@/components/analytics/growth-metrics";
import {
  BarChart3,
  Users,
  Eye,
  Heart,
  Download,
  Calendar,
  Filter,
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [tabGridClass, setTabGridClass] = useState("grid-cols-3 grid-rows-2");
  const [isIpadMini, setIsIpadMini] = useState(false);

  useEffect(() => {
    function updateTabGridClass() {
      const width = window.innerWidth;
      // iPad Mini (portrait/landscape) and phones: 3 cols, 2 rows
      if (width >= 768 && width <= 834) {
        setTabGridClass("grid-cols-3 grid-rows-2");
      } else if (width < 768) {
        setTabGridClass("grid-cols-3 grid-rows-2");
      } else {
        setTabGridClass("md:grid-rows-1 md:grid-cols-6");
      }
    }
    updateTabGridClass();
    window.addEventListener("resize", updateTabGridClass);
    return () => window.removeEventListener("resize", updateTabGridClass);
  }, []);

  useEffect(() => {
    function checkIpadMini() {
      const width = window.innerWidth;
      setIsIpadMini(width >= 768 && width <= 834);
    }
    checkIpadMini();
    window.addEventListener("resize", checkIpadMini);
    return () => window.removeEventListener("resize", checkIpadMini);
  }, []);

  const handleExportReport = () => {
    const reportData = {
      timeRange,
      selectedPlatform,
      generatedAt: new Date().toISOString(),
      metrics: {
        totalReach: 125000,
        engagement: 8.5,
        followers: 15420,
        posts: 45,
      },
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-report-${timeRange}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  return (
    <div className="rounded-lg p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Track your social media performance and audience insights
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleExportReport}
            className="flex-1 sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          {isIpadMini ? (
            <div className="flex flex-col gap-4 items-stretch">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 3 months</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={selectedPlatform}
                    onValueChange={setSelectedPlatform}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="twitter">X (Twitter)</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  Data updated 2 hours ago
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 3 months</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={selectedPlatform}
                    onValueChange={setSelectedPlatform}
                  >
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="twitter">X (Twitter)</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                Data updated 2 hours ago
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">125,430</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Rate
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">8.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Followers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">15,420</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Posts Published
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+8</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList
          className={`grid w-full border-b p-1 gap-2 gap-y-4 ${tabGridClass}`}
        >
          <TabsTrigger
            value="overview"
            className="text-xs md:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="platforms"
            className="text-xs md:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md"
          >
            Platforms
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="text-xs md:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md"
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="audience"
            className="text-xs md:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md"
          >
            Audience
          </TabsTrigger>
          <TabsTrigger
            value="engagement"
            className="text-xs md:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md"
          >
            Engagement
          </TabsTrigger>
          <TabsTrigger
            value="growth"
            className="text-xs md:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md"
          >
            Growth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsOverview timeRange={timeRange} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopPosts />
            <EngagementTrends timeRange={timeRange} />
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <PlatformMetrics
            timeRange={timeRange}
            selectedPlatform={selectedPlatform}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentPerformance timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <AudienceInsights timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <EngagementTrends timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <GrowthMetrics timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
