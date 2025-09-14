"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { RecentPosts } from "@/components/dashboard/recent-posts";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface post {
  id: string;
  title?: string;
  category?: string[];
  country?: string[];
  type?: string;
  articleImage?: any; // Base64 image string
  status?: "draft" | "scheduled" | "published";
  postId?: string;
  scheduledDate?: string;
  image?: string;
  platforms?: string[];
  createdAt: string;
  tags?: string[];
  isPublic?: boolean;
  engagement: number;
}

interface dashboard {
  totalPost?: number;
  percentageChange?: number;
  activePlatform?: number;
  scheduledPost?: number;
  scheduledPostLast7Days?: number;
  recentPosts?: post[];
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<dashboard>();
  const [loading, setLoading] = useState(true);

  const fetchTotalPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/content/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Get the current date and previous month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // 0-based index for month
        const currentYear = currentDate.getFullYear();

        // Get posts created this month and last month
        const currentMonthPosts = data.posts.filter((post: any) => {
          const postDate = new Date(post.createdAt);
          return (
            postDate.getMonth() === currentMonth &&
            postDate.getFullYear() === currentYear
          );
        });

        const previousMonthPosts = data.posts.filter((post: any) => {
          const postDate = new Date(post.createdAt);
          return (
            postDate.getMonth() === currentMonth - 1 &&
            postDate.getFullYear() === currentYear
          );
        });

        const currentMonthPostCount = currentMonthPosts.length;
        const previousMonthPostCount = previousMonthPosts.length;

        // Calculate the percentage increase from last month
        const percentageChange =
          previousMonthPostCount === 0
            ? currentMonthPostCount * 100 // If no posts in the previous month
            : ((currentMonthPostCount - previousMonthPostCount) /
                previousMonthPostCount) *
              100;

        // Get posts that are scheduled
        const scheduledPosts = data.posts.filter(
          (post: any) => post.status === "scheduled"
        );

        // Get posts scheduled within the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const scheduledPostsLast7Days = scheduledPosts.filter((post: any) => {
          const postDate = new Date(post.createdAt);
          return postDate >= sevenDaysAgo; // Check if the post was created within the last 7 days
        });

        // Filter recent posts
        const recentPosts = data.posts.filter((post: any) => {
          const postDate = new Date(post.createdAt);
          return postDate >= sevenDaysAgo; // Posts created in the last 7 days
        });

        setDashboardData((prevData) => ({
          ...prevData,
          totalPost: currentMonthPostCount,
          percentageChange,
          scheduledPost: scheduledPosts.length,
          scheduledPostLast7Days: scheduledPostsLast7Days.length, // Add the scheduled posts in the last 7 days
          recentPosts: recentPosts,
        }));
      }
    } catch (error: any) {
      console.error("Error fetching posts", error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log(dashboardData?.recentPosts);
  const fetchCreatorSettings = async () => {
    try {
      const response = await fetch("/api/settings");

      if (response.ok) {
        const data = await response.json();
        const platformArray = data.data.platformIntegrations;

        // Filter the array and assign the result to platformArray
        const connectedPlatforms = platformArray.filter(
          (item: any) => item.isConnected === true
        );

        // Log the filtered array (connected platforms)
        console.log(connectedPlatforms);
        setDashboardData((prevData) => ({
          ...prevData,
          activePlatform: connectedPlatforms.length,
        }));
      }
    } catch (error: any) {
      console.error("Error fetching settings", error.message);
    }
  };

  useEffect(() => {
    fetchTotalPosts();
    fetchCreatorSettings();
  }, []);

  return (
    <div className="h-full p-4 md:p-8 space-y-6 md:space-y-8">
      {loading ? (
        <div className="col-span-4 flex justify-center items-center h-[90vh]">
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin h-12 w-12" />{" "}
            {/* Display spinner from lucide-react */}
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard
            </h2>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {dashboardData?.totalPost}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{dashboardData?.percentageChange}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Engagement Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">5.2%</div>
                <p className="text-xs text-muted-foreground">
                  +1.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Scheduled Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {dashboardData?.scheduledPostLast7Days}
                </div>
                <p className="text-xs text-muted-foreground">For next 7 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {dashboardData?.activePlatform}
                </div>
                <p className="text-xs text-muted-foreground">
                  Connected and active
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Overview</CardTitle>
                <CardDescription>
                  Your social media performance this month
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                  Recent Posts
                </CardTitle>
                <CardDescription>
                  Your latest social media updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentPosts posts={dashboardData?.recentPosts} />
              </CardContent>
            </Card>
          </div>
        </>
      )}{" "}
    </div>
  );
}
