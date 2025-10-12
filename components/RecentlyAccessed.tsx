import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, FileText, Video, BookOpen, Download, Calendar, Bell } from "lucide-react";

interface RecentActivityItem {
  id: string;
  title: string;
  type: 'course' | 'note' | 'library' | 'announcement' | 'calendar';
  course?: string;
  icon?: string;
  lastAccessed: string;
  timestamp: number;
}

interface RecentlyAccessedProps {
  recentActivity: RecentActivityItem[];
  onViewAllClick?: () => void;
}

export function RecentlyAccessed({ recentActivity = [], onViewAllClick }: RecentlyAccessedProps) {
  const getIcon = (iconName: string | undefined, type: string) => {
    switch (iconName) {
      case 'BookOpen': return BookOpen;
      case 'FileText': return FileText;
      case 'Download': return Download;
      case 'Calendar': return Calendar;
      case 'Bell': return Bell;
      default:
        switch (type) {
          case 'course': return BookOpen;
          case 'note': return FileText;
          case 'library': return Download;
          case 'calendar': return Calendar;
          case 'announcement': return Bell;
          default: return FileText;
        }
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-university-primary';
      case 'note': return 'bg-green-600';
      case 'library': return 'bg-blue-600';
      case 'calendar': return 'bg-orange-600';
      case 'announcement': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course': return "Courses";
      case 'note': return "Notes";
      case 'library': return "Library";
      case 'calendar': return "Events";
      case 'announcement': return "Announcements";
      default: return type;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return minutes <= 1 ? "Just now" : `${minutes} mins ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  // Show message if no recent activity
  if (recentActivity.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-university-primary mb-4">Recently Accessed</h2>
        <Card className="p-8 text-center border-gray-200 bg-card">
          <div className="text-university-secondary">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No recent activity</p>
            <p className="text-sm mt-1">Start exploring courses and notes</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Recently Accessed</h2>
      
      <div className="grid gap-3">
        {recentActivity.slice(0, 6).map((item) => {
          const Icon = getIcon(item.icon, item.type);
          const color = getColor(item.type);
          const timeAgo = getTimeAgo(item.timestamp);
          
          return (
            <Card key={item.id} className="p-3 sm:p-4 hover:shadow-md transition-all duration-200 border-border bg-card group cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-card-foreground truncate group-hover:text-university-primary transition-colors text-sm sm:text-base">
                    {item.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                    {item.course && (
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">{item.course}</span>
                    )}
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
                
                <Badge 
                  variant="secondary" 
                  className={`${color} text-white text-xs border-0 hidden sm:inline-flex`}
                >
                  {getTypeLabel(item.type)}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
      
      {recentActivity.length > 6 && (
        <div className="mt-4 text-center">
          <button 
            onClick={onViewAllClick}
            className="text-sm text-university-primary hover:text-university-secondary font-medium transition-colors"
          >
            View all recent items ({recentActivity.length}) →
          </button>
        </div>
      )}
    </div>
  );
}