import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  time: string;
  priority: "high" | "medium" | "low";
  category: string;
}

interface AnnouncementsWidgetProps {
  onViewAll: () => void;
  announcements: Announcement[];
}

export function AnnouncementsWidget({ onViewAll, announcements }: AnnouncementsWidgetProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-[#F59E0B]";
      case "low": return "bg-[#10B981]";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className="bg-card border-border p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-card-foreground text-sm sm:text-base">Latest Announcements</h3>
      </div>
      
      <div className="space-y-4">
        {announcements.slice(0, 1).map((announcement) => (
          <div key={announcement.id} className="border-l-4 border-primary pl-3 sm:pl-4 py-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-card-foreground text-sm leading-tight">
                {announcement.title}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
              {announcement.content}
            </p>
            <span className="text-xs text-muted-foreground">{announcement.time}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <button 
          onClick={onViewAll}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View all announcements →
        </button>
      </div>
    </Card>
  );
}