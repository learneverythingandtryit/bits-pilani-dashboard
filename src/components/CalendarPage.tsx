import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Edit3, AlertCircle, BookOpen, Users, Presentation, Briefcase, GraduationCap, Heart, Microscope, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "deadline" | "assignment" | "presentation" | "meeting" | "class" | "exam" | "holiday" | "viva" | "lab_assessment";
  description: string;
  course?: string;
  location?: string;
}

interface CalendarPageProps {
  events: Event[];
  onEventsChange: (events: Event[]) => void;
  courses: Array<{ id: string; title: string; code: string }>;
  onEventClick?: (event: Event) => void;
  onNotificationAdd?: (notification: any) => void;
  onAnnouncementRemove?: (announcementId: string) => void;
}

export function CalendarPage({ events, onEventsChange, courses, onEventClick, onNotificationAdd, onAnnouncementRemove }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");


  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "assignment" as Event["type"],
    description: "",
    course: "",
    location: ""
  });

  // Default holidays and academic events
  const defaultEvents: Event[] = [
    {
      id: "holiday-1",
      title: "Independence Day",
      date: "2024-08-15",
      time: "00:00",
      type: "holiday",
      description: "National Holiday - Independence Day"
    },
    {
      id: "holiday-2", 
      title: "Gandhi Jayanti",
      date: "2024-10-02",
      time: "00:00",
      type: "holiday",
      description: "National Holiday - Gandhi Jayanti"
    },
    {
      id: "holiday-3",
      title: "Diwali",
      date: "2024-11-01",
      time: "00:00", 
      type: "holiday",
      description: "Festival Holiday - Diwali"
    },
    {
      id: "exam-1",
      title: "Mid-Semester Viva",
      date: "2024-10-15",
      time: "10:00",
      type: "viva",
      description: "Oral examination for mid-semester evaluation",
      course: "SSWT ZC467"
    },
    {
      id: "lab-1",
      title: "Database Lab Assessment",
      date: "2024-10-20",
      time: "14:00",
      type: "lab_assessment", 
      description: "Practical assessment for database implementation",
      course: "SSWT ZC337",
      location: "Computer Lab 3"
    },
    {
      id: "exam-2",
      title: "Software Testing Viva",
      date: "2024-11-05",
      time: "11:00",
      type: "viva",
      description: "Oral examination for testing methodologies",
      course: "SSWT ZC528"
    },
    {
      id: "lab-2",
      title: "Network Configuration Lab",
      date: "2024-11-12",
      time: "16:00",
      type: "lab_assessment",
      description: "Hands-on network setup and configuration assessment",
      course: "SSWT ZC467",
      location: "Network Lab"
    }
  ];

  // Get current month details
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  // Adjust to start from Monday (0 = Sunday, 1 = Monday, etc.)
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7;

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days (to fill the week)
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i),
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth, day),
      isCurrentMonth: true
    });
  }

  // Next month days to fill the grid
  const remainingCells = 42 - calendarDays.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth + 1, day),
      isCurrentMonth: false
    });
  }

  // Combine user events with default events
  const allEvents = [...events, ...defaultEvents];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === "next" ? 1 : -1), 1));
  };

  const getEventsForDate = (date: Date) => {
    // Format date in IST (Indian Standard Time) YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const matchingEvents = allEvents.filter(event => event.date === dateString);
    
    // Debug logging for today's events (IST)
    if (date.toDateString() === new Date().toDateString()) {
      console.log(`📅 Today (IST): ${dateString}`);
      console.log(`📅 Total events: ${allEvents.length}`);
      console.log(`📅 Events today:`, matchingEvents.map(e => ({ title: e.title, date: e.date })));
    }
    
    return matchingEvents;
  };

  // Updated with dark colors and icons
  const getEventTypeColor = (type: Event["type"]) => {
    const colors = {
      deadline: "bg-red-600 text-white border-red-700",
      assignment: "bg-blue-600 text-white border-blue-700",
      presentation: "bg-purple-600 text-white border-purple-700",
      meeting: "bg-green-600 text-white border-green-700",
      class: "bg-yellow-600 text-white border-yellow-700",
      exam: "bg-orange-600 text-white border-orange-700",
      holiday: "bg-pink-600 text-white border-pink-700",
      viva: "bg-indigo-600 text-white border-indigo-700",
      lab_assessment: "bg-teal-600 text-white border-teal-700"
    };
    return colors[type] || "bg-gray-600 text-white border-gray-700";
  };

  // Get icon for event type
  const getEventTypeIcon = (type: Event["type"]) => {
    const icons = {
      deadline: AlertCircle,
      assignment: BookOpen,
      presentation: Presentation,
      meeting: Users,
      class: GraduationCap,
      exam: Briefcase,
      holiday: Heart,
      viva: UserCheck,
      lab_assessment: Microscope
    };
    return icons[type] || BookOpen;
  };

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        type: newEvent.type,
        description: newEvent.description,
        course: newEvent.course,
        location: newEvent.location
      };
      
      console.log(`✅ Event created (IST): "${event.title}" on ${event.date} at ${event.time}`);
      
      onEventsChange([...events, event]);

      // Add notification when event is created
      if (onNotificationAdd) {
        onNotificationAdd({
          id: `event-${event.id}`,
          type: 'event',
          title: "Event Scheduled Successfully",
          message: `${event.title} has been scheduled for ${new Date(event.date).toLocaleDateString()} at ${event.time}`,
          time: "just now",
          read: false,
          eventData: event
        });
      }

      setNewEvent({
        title: "",
        date: "",
        time: "",
        type: "assignment",
        description: "",
        course: "",
        location: ""
      });
      setIsCreateEventOpen(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.type,
      description: event.description,
      course: event.course || "",
      location: event.location || ""
    });
    setIsEditEventOpen(true);
  };

  const handleUpdateEvent = () => {
    if (editingEvent && newEvent.title && newEvent.date && newEvent.time) {
      const updatedEvents = events.map(event => 
        event.id === editingEvent.id 
          ? {
              ...event,
              title: newEvent.title,
              date: newEvent.date,
              time: newEvent.time,
              type: newEvent.type,
              description: newEvent.description,
              course: newEvent.course,
              location: newEvent.location
            }
          : event
      );
      
      onEventsChange(updatedEvents);

      // Add notification when event is updated
      if (onNotificationAdd) {
        onNotificationAdd({
          id: `event-update-${editingEvent.id}`,
          type: 'event',
          title: "Event Updated Successfully",
          message: `${newEvent.title} has been updated for ${new Date(newEvent.date).toLocaleDateString()} at ${newEvent.time}`,
          time: "just now",
          read: false,
          eventData: {
            id: editingEvent.id,
            title: newEvent.title,
            date: newEvent.date,
            time: newEvent.time,
            type: newEvent.type,
            description: newEvent.description,
            course: newEvent.course,
            location: newEvent.location
          }
        });
      }

      setNewEvent({
        title: "",
        date: "",
        time: "",
        type: "assignment",
        description: "",
        course: "",
        location: ""
      });
      setEditingEvent(null);
      setIsEditEventOpen(false);
    }
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      const updatedEvents = events.filter(event => event.id !== editingEvent.id);
      onEventsChange(updatedEvents);

      // Remove the announcement associated with this event
      if (onAnnouncementRemove) {
        const announcementId = `event-announcement-${editingEvent.id}`;
        onAnnouncementRemove(announcementId);
      }

      // Add notification when event is deleted
      if (onNotificationAdd) {
        onNotificationAdd({
          id: `event-delete-${editingEvent.id}`,
          type: 'event-delete',
          title: "Event Deleted Successfully",
          message: `${editingEvent.title} has been removed from your calendar`,
          time: "just now",
          read: false
        });
      }

      setNewEvent({
        title: "",
        date: "",
        time: "",
        type: "assignment",
        description: "",
        course: "",
        location: ""
      });
      setEditingEvent(null);
      setIsEditEventOpen(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNewEvent(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }));
    setIsCreateEventOpen(true);
  };

  const upcomingEvents = allEvents
    .filter(event => {
      // Compare dates in IST (no time component)
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1 text-[12px]">Manage your academic schedule and events</p>
        </div>
        <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Add a new event to your calendar with course assignment and details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="event-title">Title</Label>
                <Input
                  id="event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Event title..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="event-time">Time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="event-type">Type</Label>
                <Select value={newEvent.type} onValueChange={(value: Event["type"]) => setNewEvent({...newEvent, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="viva">Viva</SelectItem>
                    <SelectItem value="lab_assessment">Lab Assessment</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="event-course">Course</Label>
                <Select value={newEvent.course} onValueChange={(value) => setNewEvent({...newEvent, course: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.code}>
                        {course.code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="event-location">Location (optional)</Label>
                <Input
                  id="event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Location..."
                />
              </div>
              <div>
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Event description..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} className="bg-primary hover:bg-primary/90">
                  Create Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Event Dialog - NO DELETE OPTION */}
        <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the event details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-event-title">Title</Label>
                <Input
                  id="edit-event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Event title..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-event-date">Date</Label>
                  <Input
                    id="edit-event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-event-time">Time</Label>
                  <Input
                    id="edit-event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-event-type">Type</Label>
                <Select value={newEvent.type} onValueChange={(value: Event["type"]) => setNewEvent({...newEvent, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="viva">Viva</SelectItem>
                    <SelectItem value="lab_assessment">Lab Assessment</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-event-course">Course</Label>
                <Select value={newEvent.course} onValueChange={(value) => setNewEvent({...newEvent, course: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.code}>
                        {course.code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-event-location">Location (optional)</Label>
                <Input
                  id="edit-event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Location..."
                />
              </div>
              <div>
                <Label htmlFor="edit-event-description">Description</Label>
                <Textarea
                  id="edit-event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Event description..."
                  rows={3}
                />
              </div>
              {/* Action buttons with Delete option */}
              <div className="flex justify-between">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteEvent}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Event
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditEventOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateEvent} className="bg-primary hover:bg-primary/90">
                    Update Event
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card className="professional-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    {monthNames[currentMonth]} {currentYear}
                  </h2>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="calendar-grid grid gap-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                {/* Day headers */}
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center font-medium text-muted-foreground text-sm bg-[rgba(25,31,95,0)]">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const dayOfWeek = day.date.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] p-1 border border-border rounded cursor-pointer hover:bg-accent transition-colors ${
                        !day.isCurrentMonth ? 'bg-muted text-muted-foreground' : 'bg-card text-card-foreground'
                      } ${isToday ? 'bg-accent/50 border-primary' : ''}`}
                      onClick={() => handleDateClick(day.date)}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                        {day.date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => {
                          const IconComponent = getEventTypeIcon(event.type);
                          return (
                            <div
                              key={event.id}
                              className={`text-xs px-1.5 py-0.5 rounded truncate ${getEventTypeColor(event.type)} cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1`}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Only allow editing of user-created events (not default events)
                                if (!defaultEvents.find(de => de.id === event.id)) {
                                  handleEditEvent(event);
                                }
                                // Track event click if callback provided
                                if (onEventClick) {
                                  onEventClick(event);
                                }
                              }}
                            >
                              <IconComponent className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{event.title}</span>
                              {!defaultEvents.find(de => de.id === event.id) && (
                                <Edit3 className="w-2.5 h-2.5 ml-auto opacity-70" />
                              )}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground pl-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card className="professional-card bg-university-primary dark:bg-university-light">
            <CardHeader>
              <CardTitle className="text-lg text-white dark:text-foreground font-semibold">Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              {getEventsForDate(new Date()).length > 0 ? (
                <div className="space-y-4">
                  {getEventsForDate(new Date()).map((event) => {
                    // Get background color for event type
                    const getEventBgColor = (type: Event["type"]) => {
                      const bgColors = {
                        deadline: "bg-red-50 dark:bg-red-900/40 border-red-100 dark:border-red-800/50",
                        assignment: "bg-blue-50 dark:bg-blue-900/40 border-blue-100 dark:border-blue-800/50",
                        presentation: "bg-purple-50 dark:bg-purple-900/40 border-purple-100 dark:border-purple-800/50",
                        meeting: "bg-green-50 dark:bg-green-900/40 border-green-100 dark:border-green-800/50",
                        class: "bg-yellow-50 dark:bg-yellow-900/40 border-yellow-100 dark:border-yellow-800/50",
                        exam: "bg-orange-50 dark:bg-orange-900/40 border-orange-100 dark:border-orange-800/50",
                        holiday: "bg-pink-50 dark:bg-pink-900/40 border-pink-100 dark:border-pink-800/50",
                        viva: "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-100 dark:border-indigo-800/50",
                        lab_assessment: "bg-teal-50 dark:bg-teal-900/40 border-teal-100 dark:border-teal-800/50"
                      };
                      return bgColors[type] || "bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800/50";
                    };

                    const getEventCircleColor = (type: Event["type"]) => {
                      const circleColors = {
                        deadline: "bg-red-500 dark:bg-red-400",
                        assignment: "bg-blue-500 dark:bg-blue-400",
                        presentation: "bg-purple-500 dark:bg-purple-400",
                        meeting: "bg-green-500 dark:bg-green-400",
                        class: "bg-yellow-500 dark:bg-yellow-400",
                        exam: "bg-orange-500 dark:bg-orange-400",
                        holiday: "bg-pink-500 dark:bg-pink-400",
                        viva: "bg-indigo-500 dark:bg-indigo-400",
                        lab_assessment: "bg-teal-500 dark:bg-teal-400"
                      };
                      return circleColors[type] || "bg-gray-500 dark:bg-gray-400";
                    };
                    
                    return (
                      <div 
                        key={event.id} 
                        className={`p-4 rounded-xl ${getEventBgColor(event.type)} hover:shadow-sm transition-all duration-200`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Colored Circle */}
                          <div className={`w-5 h-5 rounded-full ${getEventCircleColor(event.type)} flex-shrink-0`} />
                          
                          <div className="flex-1 min-w-0 flex items-center">
                            {/* Event Title */}
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xs leading-tight text-left w-full">
                              {event.title}
                            </h4>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No events today</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="professional-card bg-university-primary dark:bg-university-light">
            <CardHeader>
              <CardTitle className="text-lg text-white dark:text-foreground font-semibold">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const today = new Date();
                    const diffTime = eventDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    // Get background color for event type  
                    const getEventBgColor = (type: Event["type"]) => {
                      const bgColors = {
                        deadline: "bg-red-50 dark:bg-red-900/40 border-red-100 dark:border-red-800/50",
                        assignment: "bg-blue-50 dark:bg-blue-900/40 border-blue-100 dark:border-blue-800/50",
                        presentation: "bg-purple-50 dark:bg-purple-900/40 border-purple-100 dark:border-purple-800/50",
                        meeting: "bg-green-50 dark:bg-green-900/40 border-green-100 dark:border-green-800/50",
                        class: "bg-yellow-50 dark:bg-yellow-900/40 border-yellow-100 dark:border-yellow-800/50",
                        exam: "bg-orange-50 dark:bg-orange-900/40 border-orange-100 dark:border-orange-800/50",
                        holiday: "bg-pink-50 dark:bg-pink-900/40 border-pink-100 dark:border-pink-800/50",
                        viva: "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-100 dark:border-indigo-800/50",
                        lab_assessment: "bg-teal-50 dark:bg-teal-900/40 border-teal-100 dark:border-teal-800/50"
                      };
                      return bgColors[type] || "bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800/50";
                    };

                    const getEventCircleColor = (type: Event["type"]) => {
                      const circleColors = {
                        deadline: "bg-red-500 dark:bg-red-400",
                        assignment: "bg-blue-500 dark:bg-blue-400",
                        presentation: "bg-purple-500 dark:bg-purple-400",
                        meeting: "bg-green-500 dark:bg-green-400",
                        class: "bg-yellow-500 dark:bg-yellow-400",
                        exam: "bg-orange-500 dark:bg-orange-400",
                        holiday: "bg-pink-500 dark:bg-pink-400",
                        viva: "bg-indigo-500 dark:bg-indigo-400",
                        lab_assessment: "bg-teal-500 dark:bg-teal-400"
                      };
                      return circleColors[type] || "bg-gray-500 dark:bg-gray-400";
                    };
                    
                    return (
                      <div 
                        key={event.id} 
                        className={`p-4 rounded-xl ${getEventBgColor(event.type)} hover:shadow-sm transition-all duration-200`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Colored Circle */}
                          <div className={`w-5 h-5 rounded-full ${getEventCircleColor(event.type)} flex-shrink-0`} />
                          
                          <div className="flex-1 min-w-0 flex items-center">
                            {/* Event Title */}
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xs leading-tight text-left w-full">
                              {event.title}
                            </h4>  
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No upcoming events</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}