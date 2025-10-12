import { CalendarIcon, Clock, MapPin, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

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

interface SchedulePopupProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
}

export function SchedulePopup({ isOpen, onClose, events }: SchedulePopupProps) {
  const getEventTypeColor = (type: Event["type"]) => {
    const colors = {
      deadline: "bg-red-100 text-red-800 border-red-200",
      assignment: "bg-blue-100 text-blue-800 border-blue-200",
      presentation: "bg-purple-100 text-purple-800 border-purple-200",
      meeting: "bg-green-100 text-green-800 border-green-200",
      class: "bg-yellow-100 text-yellow-800 border-yellow-200",
      exam: "bg-orange-100 text-orange-800 border-orange-200",
      holiday: "bg-pink-100 text-pink-800 border-pink-200",
      viva: "bg-indigo-100 text-indigo-800 border-indigo-200",
      lab_assessment: "bg-teal-100 text-teal-800 border-teal-200"
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

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

  // Combine user events with default events
  const allEvents = [...events, ...defaultEvents];

  // Get upcoming events (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingEvents = allEvents
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const todayEvents = allEvents
    .filter(event => {
      const eventDate = new Date(event.date);
      const todayString = today.toISOString().split('T')[0];
      return event.date === todayString;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  // Get all upcoming events (any future date)
  const allUpcomingEvents = allEvents
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-university-primary flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Your Schedule Overview
          </DialogTitle>
          <DialogDescription>
            View your upcoming events and today's schedule at a glance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* All Upcoming Events */}
          <div>
            <h3 className="text-lg font-semibold text-university-primary mb-3">All Upcoming Events</h3>
            {allUpcomingEvents.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {allUpcomingEvents.map((event) => (
                  <Card key={event.id} className="p-4 bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-university-primary">{event.title}</h4>
                          <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-university-secondary">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                            <Clock className="w-4 h-4 ml-2" />
                            <span>{event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-university-secondary">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.course && (
                            <div className="text-sm text-university-secondary">
                              Course: {event.course}
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-university-secondary mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 bg-university-light">
                <p className="text-university-secondary text-center">No upcoming events scheduled</p>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} className="bg-university-primary hover:bg-university-secondary">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}