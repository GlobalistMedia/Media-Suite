"use client";

import { useState, useEffect } from "react";
import type { Event, ScheduledPost } from "@/types/calendar";
import axios from "axios";

export function useCalendarData() {
  const [events, setEvents] = useState<Event[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events and scheduled posts from API
  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/calendar/all");
        const data = res.data;
        console.log('Calendar hook - Received data:', data);
        // Convert date strings to Date objects for events
        setEvents(
          (data.events || []).map((event: any) => ({
            ...event,
            startDateTime: new Date(event.startDateTime),
            createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
            updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
          }))
        );
        // Convert scheduled posts from database to ScheduledPost format
        const scheduledPosts = (data.scheduledPosts || []).map((post: any) => ({
          id: post._id,
          title: post.title,
          content:
            post.blocks
              ?.map((block: any) => {
                switch (block.type) {
                  case "text":
                  case "heading":
                  case "quote":
                    return block.content?.text || "";
                  case "list":
                    return block.content?.items?.join(", ") || "";
                  default:
                    return "";
                }
              })
              .join(" ") || "",
          scheduledDate: new Date(post.scheduledDate),
          platforms: post.platforms || [],
          mediaCount: post.mediaFiles?.length || 0,
          mediaTypes: post.mediaFiles?.map((file: any) => file.type) || [],
          status: post.status,
        }));

        setScheduledPosts(scheduledPosts);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, []);

  const handleCreateEvent = async (
    eventData: Omit<Event, "_id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    try {
      const res = await axios.post("/api/calendar/events", {
        title: eventData.title,
        description: eventData.description,
        date: eventData.startDateTime,
        type: eventData.eventType,
        duration: eventData.duration,
        attendees: eventData.attendees,
      });
      const result = res.data;
      if (result.event) {
        setEvents((prev) => [
          ...prev,
          {
            ...result.event,
            startDateTime: new Date(result.event.startDateTime),
            createdAt: result.event.createdAt
              ? new Date(result.event.createdAt)
              : undefined,
            updatedAt: result.event.updatedAt
              ? new Date(result.event.updatedAt)
              : undefined,
          },
        ]);
      }
    } catch (err) {
      // Optionally handle error (e.g., toast)
      console.error(err);
    }
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents((prev) =>
      prev.map((event) =>
        event._id === updatedEvent._id
          ? { ...updatedEvent, updatedAt: new Date() }
          : event
      )
    );
  };

  const handleUpdatePost = (updatedPost: ScheduledPost) => {
    setScheduledPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handleBulkDelete = () => {
    setEvents((prev) =>
      prev.filter((event) => !selectedItems.includes(parseInt(event._id)))
    );
    setScheduledPosts((prev) =>
      prev.filter((post) => !selectedItems.includes(post.id))
    );
    setSelectedItems([]);
  };

  const handleExportSchedule = () => {
    const allItems = [
      ...events.map((event) => ({
        type: "Event",
        title: event.title,
        description: event.description,
        date: event.startDateTime.toISOString(),
        duration: event.duration,
        attendees: event.attendees,
      })),
      ...scheduledPosts.map((post) => ({
        type: "Post",
        title: post.title,
        content: post.content,
        date: post.scheduledDate.toISOString(),
        platforms: post.platforms.length,
        status: post.status,
      })),
    ];

    const csvContent = [
      [
        "Type",
        "Title",
        "Description/Content",
        "Date",
        "Duration/Platforms",
        "Attendees/Status",
      ],
      ...allItems.map((item) => [
        item.type,
        item.title,
        "description" in item ? item.description : item.content,
        new Date(item.date).toLocaleString(),
        "duration" in item
          ? `${item.duration} min`
          : `${item.platforms} platforms`,
        "attendees" in item ? `${item.attendees} people` : item.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule-export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await axios.delete(`/api/calendar/events?eventId=${eventId}`);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    } catch (err) {
      console.error(err);
    }
  };

  const refreshCalendarData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/calendar/all");
      const data = res.data;
      console.log('Calendar hook refresh - Received data:', data);
      // Convert date strings to Date objects for events
      setEvents(
        (data.events || []).map((event: any) => ({
          ...event,
          startDateTime: new Date(event.startDateTime),
          createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
          updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
        }))
      );
      // Convert scheduled posts from database to ScheduledPost format
      const scheduledPosts = (data.scheduledPosts || []).map((post: any) => ({
        id: post._id,
        title: post.title,
        content:
          post.blocks
            ?.map((block: any) => {
              switch (block.type) {
                case "text":
                case "heading":
                case "quote":
                  return block.content?.text || "";
                case "list":
                  return block.content?.items?.join(", ") || "";
                default:
                  return "";
              }
            })
            .join(" ") || "",
        scheduledDate: new Date(post.scheduledDate),
        platforms: post.platforms || [],
        mediaCount: post.mediaFiles?.length || 0,
        mediaTypes: post.mediaFiles?.map((file: any) => file.type) || [],
        status: post.status,
      }));

      setScheduledPosts(scheduledPosts);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    scheduledPosts,
    selectedItems,
    setSelectedItems,
    handleCreateEvent,
    handleUpdateEvent,
    handleUpdatePost,
    handleBulkDelete,
    handleExportSchedule,
    handleDeleteEvent,
    refreshCalendarData,
    loading,
    error,
  };
}
