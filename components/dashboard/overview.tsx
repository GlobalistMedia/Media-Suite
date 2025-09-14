import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Overview() {
  const { theme, resolvedTheme } = useTheme();
  const [data, setData] = useState([
    { name: "Jan", total: 0 },
    { name: "Feb", total: 0 },
    { name: "Mar", total: 0 },
    { name: "Apr", total: 0 },
    { name: "May", total: 0 },
    { name: "Jun", total: 0 },
    { name: "Jul", total: 0 },
    { name: "Aug", total: 0 },
    { name: "Sep", total: 0 },
    { name: "Oct", total: 0 },
    { name: "Nov", total: 0 },
    { name: "Dec", total: 0 },
  ]);

  const [screenWidth, setScreenWidth] = useState(1200);

  const fetchPostCounts = async () => {
    try {
      const response = await fetch("/api/content/posts");

      if (response.ok) {
        const fetchedData = await response.json();
        const posts = fetchedData.posts;

        // Get the current date
        const currentYear = new Date().getFullYear();

        // Initialize an array to store post counts by month
        let postCounts = new Array(12).fill(0);

        // Loop through posts and count them by month
        posts.forEach((post: any) => {
          const postDate = new Date(post.createdAt);
          if (postDate.getFullYear() === currentYear) {
            const month = postDate.getMonth(); // 0-based month index
            postCounts[month]++;
          }
        });

        // Update data for the graph
        const newData = data.map((item: any, index: any) => ({
          name: item.name,
          total: postCounts[index], // Use the count of posts for each month
        }));

        setData(newData);
      }
    } catch (error: any) {
      console.error("Error fetching posts", error.message);
    }
  };

  useEffect(() => {
    fetchPostCounts();
    const handleResize = () => setScreenWidth(window.innerWidth);
    if (typeof window !== "undefined") {
      setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const isDark =
    theme === "dark" || (theme === "system" && resolvedTheme === "dark");

  const textColor = isDark ? "#000000" : "#ffffff";
  const graphcolor = isDark ? "#ffffff" : "#000000";

  // Responsive settings for X-axis labels
  const getXAxisSettings = () => {
    if (screenWidth <= 480) {
      return { fontSize: 10, interval: 1 };
    } else if (screenWidth <= 1024) {
      return { fontSize: 11, interval: 1 };
    } else {
      return { fontSize: 12, interval: 0 };
    }
  };

  const { fontSize, interval } = getXAxisSettings();

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
      >
        <XAxis
          dataKey="name"
          stroke={graphcolor}
          fontSize={fontSize}
          interval={interval}
          tickLine={false}
          axisLine={false}
          tick={{ fill: graphcolor }}
        />
        <YAxis
          stroke={graphcolor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          tick={{ fill: graphcolor }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
            borderRadius: "6px",
            color: isDark ? "#ffffff" : "#000000",
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
