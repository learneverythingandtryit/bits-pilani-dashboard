import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarWidgetProps {
  onEventsChange?: (events: any[]) => void;
  events?: any[];
}

export function CalendarWidget({ onEventsChange, events: propEvents }: CalendarWidgetProps = {}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [events, setEvents] = useState(propEvents || [
    {
      id: "1",
      title: "Physics Lab Report",
      date: "2024-09-15",
      time: "23:59",
      type: "deadline",
      color: "bg-red",
      bgColor: "bg-red/10",
      textColor: "text-red"
    },
    {
      id: "2",
      title: "Math Assignment",
      date: "2024-09-16",
      time: "14:00",
      type: "assignment",
      color: "bg-orange",
      bgColor: "bg-orange/10",
      textColor: "text-orange"
    },
    {
      id: "3",
      title: "CS Project Demo",
      date: "2024-09-18",
      time: "10:00",
      type: "presentation",
      color: "bg-blue",
      bgColor: "bg-blue/10",
      textColor: "text-blue"
    },
    {
      id: "4",
      title: "Study Group",
      date: "2024-09-20",
      time: "16:00",
      type: "meeting",
      color: "bg-green",
      bgColor: "bg-green/10",
      textColor: "text-green"
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "assignment",
    description: ""
  });

  const addEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const eventTypeConfig = {
        deadline: { color: "bg-red-500", bgColor: "bg-red-50 dark:bg-red-900/20", textColor: "text-red-600" },
        assignment: { color: "bg-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20", textColor: "text-orange-600" },
        presentation: { color: "bg-blue-500", bgColor: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-600" },
        meeting: { color: "bg-green-500", bgColor: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-600" },
        exam: { color: "bg-purple-500", bgColor: "bg-purple-50 dark:bg-purple-900/20", textColor: "text-purple-600" }
      };

      const config = eventTypeConfig[newEvent.type as keyof typeof eventTypeConfig] || eventTypeConfig.assignment;

      const updatedEvents = [...events, {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        type: newEvent.type,
        description: newEvent.description,
        ...config
      }];
      
      setEvents(updatedEvents);
      onEventsChange?.(updatedEvents);
      setNewEvent({ title: "", date: "", time: "", type: "assignment", description: "" });
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDisplayTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(event => event.date === dateStr);
      const isToday = new Date().toDateString() === new Date(dateStr).toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 min-h-[40px] border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
            isToday ? 'bg-[#000080]/10 border-[#000080]' : ''
          }`}
          onClick={() => {
            setSelectedDate(new Date(dateStr));
            // Show events for this day or allow adding new events
            const dayEventsList = events.filter(event => event.date === dateStr);
            if (dayEventsList.length > 0) {
              console.log('Events for', dateStr, ':', dayEventsList);
            }
          }}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[#000080]' : 'text-gray-900 dark:text-gray-100'}`}>
            {day}
          </div>
          {dayEvents.map((event, idx) => (
            <div
              key={idx}
              className={`text-xs p-1 rounded mb-1 ${event.bgColor} ${event.textColor} truncate cursor-pointer hover:opacity-80`}
              title={event.title}
              onClick={(e) => {
                e.stopPropagation();
                console.log('Event clicked:', event);
              }}
            >
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "deadline": return "Due";
      case "assignment": return "Submit";
      case "presentation": return "Present";
      case "meeting": return "Meet";
      default: return type;
    }
  };

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#000080] rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-foreground">Calendar & Events</h3>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#000080] hover:bg-[#000080]/90 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
              <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <Button onClick={addEvent} className="w-full bg-[#000080] hover:bg-[#000080]/90">
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar View Toggle */}
      <div className="mb-4">
        <Button
          variant={showCalendar ? "default" : "outline"}
          size="sm"
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full"
        >
          {showCalendar ? "Show Event List" : "Show Calendar View"}
        </Button>
      </div>

      {showCalendar ? (
        <div className="space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h4 className="font-semibold text-lg">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 bg-gray-50 dark:bg-gray-700 text-center text-xs font-medium text-gray-600 dark:text-gray-300">
                {day}
              </div>
            ))}
            {/* Calendar days */}
            {renderCalendar()}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {events.slice(0, 4).map((event) => (
            <div 
              key={event.id} 
              className={`flex items-start gap-4 p-4 rounded-2xl ${event.bgColor} hover:shadow-md transition-all duration-200 group cursor-pointer`}
              onClick={() => {
                // Handle event click - could open a detailed view
                console.log('Event clicked:', event);
              }}
            >
              <div className={`w-4 h-4 rounded-full ${event.color} mt-1 flex-shrink-0 shadow-sm`}></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm truncate group-hover:text-[#000080] transition-colors">{event.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-muted-foreground">{formatDisplayDate(event.date)}</span>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{formatDisplayTime(event.time)}</span>
                </div>
              </div>
              <Badge 
                className={`text-xs ${event.color} text-white rounded-full px-3 py-1 shadow-sm`}
              >
                {getTypeLabel(event.type)}
              </Badge>
            </div>
          ))}
        </div>
      )}
      
      {!showCalendar && events.length > 4 && (
        <div className="mt-6 pt-4 border-t border-border">
          <button 
            className="text-sm font-semibold text-[#000080] hover:text-[#000080]/80 transition-colors"
            onClick={() => setShowCalendar(true)}
          >
            View full calendar →
          </button>
        </div>
      )}
    </Card>
  );
}