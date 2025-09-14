"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { CreateEventDialog } from "@/components/calendar/create-event-dialog";
import { CreatePostDialog } from "@/components/calendar/create-post-dialog";
import { EditEventDialog } from "@/components/calendar/edit-event-dialog";
import { EditPostDialog } from "@/components/calendar/edit-post-dialog";
import { UpcomingItems } from "@/components/calendar/upcoming-items";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { useCalendarFilters } from "@/hooks/use-calendar-filters";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  FileText,
  Filter,
  Search,
  Trash2,
} from "lucide-react";

import type { Event, ScheduledPost } from "@/types/calendar";

export default function SchedulePage() {
  const router = useRouter();

  const {
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
  } = useCalendarData();
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filteredEvents,
    filteredPosts,
  } = useCalendarFilters(events, scheduledPosts);

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [isEditPostDialogOpen, setIsEditPostDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditEventDialogOpen(true);
  };

  const handleEditPost = (post: ScheduledPost) => {
    setSelectedPost(post);
    setIsEditPostDialogOpen(true);
  };

  // Navigate to distribution page when scheduling posts
  const handleSchedulePost = () => {
    router.push("/dashboard/distribution");
  };

  // Listen for calendar refresh events from content editor
  useEffect(() => {
    const handleCalendarRefresh = () => {
      refreshCalendarData();
    };

    window.addEventListener("calendarRefresh", handleCalendarRefresh);

    return () => {
      window.removeEventListener("calendarRefresh", handleCalendarRefresh);
    };
  }, [refreshCalendarData]);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <CalendarHeader
        onExportSchedule={handleExportSchedule}
        onOpenEventDialog={() => setIsEventDialogOpen(true)}
        onOpenPostDialog={handleSchedulePost}
      />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-2 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events and posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="posts">Posts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedItems.length} selected
                </Badge>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Views */}
      <CalendarView
        events={filteredEvents as import("@/types/calendar").Event[]}
        scheduledPosts={filteredPosts}
        onDeleteEvent={handleDeleteEvent}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {filteredEvents.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {events.filter((e) => e.startDateTime > new Date()).length}{" "}
              upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Scheduled Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {filteredPosts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                scheduledPosts.filter((p) => p.scheduledDate > new Date())
                  .length
              }{" "}
              pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {(() => {
                const now = new Date();
                const weekStart = new Date(
                  now.setDate(now.getDate() - now.getDay())
                );
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);

                const thisWeekEvents = events.filter(
                  (e) =>
                    e.startDateTime >= weekStart && e.startDateTime <= weekEnd
                ).length;

                const thisWeekPosts = scheduledPosts.filter(
                  (p) =>
                    p.scheduledDate >= weekStart && p.scheduledDate <= weekEnd
                ).length;

                return thisWeekEvents + thisWeekPosts;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">events & posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {filteredEvents.filter((e) => e.eventType === "meeting").length}
            </div>
            <p className="text-xs text-muted-foreground">total meetings</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Items */}
      <UpcomingItems
        events={filteredEvents as import("@/types/calendar").Event[]}
        scheduledPosts={filteredPosts}
        onEditEvent={handleEditEvent}
        onEditPost={handleEditPost}
        onDeleteEvent={handleDeleteEvent}
      />

      {/* Dialogs */}
      <CreateEventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onCreateEvent={handleCreateEvent}
      />
      <EditEventDialog
        open={isEditEventDialogOpen}
        onOpenChange={setIsEditEventDialogOpen}
        event={selectedEvent}
        onUpdateEvent={handleUpdateEvent}
      />

      <EditPostDialog
        open={isEditPostDialogOpen}
        onOpenChange={setIsEditPostDialogOpen}
        post={selectedPost}
        onUpdatePost={handleUpdatePost}
      />
    </div>
  );
}
