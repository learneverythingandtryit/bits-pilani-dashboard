import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, FileText, BookOpen, Download, Calendar, Bell, ArrowLeft, Filter } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface RecentActivityItem {
  id: string;
  title: string;
  type: 'course' | 'note' | 'library' | 'announcement' | 'calendar';
  course?: string;
  icon?: string;
  lastAccessed: string;
  timestamp: number;
}

interface RecentActivityPageProps {
  recentActivity: RecentActivityItem[];
  onBack: () => void;
}

export function RecentActivityPage({ recentActivity = [], onBack }: RecentActivityPageProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

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
      case 'course': return 'Course';
      case 'note': return 'Notes';
      case 'library': return 'Library';
      case 'calendar': return 'Event';
      case 'announcement': return 'News';
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
      return minutes <= 1 ? 'Just now' : `${minutes} mins ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter and sort the activity
  const filteredActivity = recentActivity
    .filter(item => filterType === "all" || item.type === filterType)
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return b.timestamp - a.timestamp;
      } else {
        return a.timestamp - b.timestamp;
      }
    });

  // Group by date for better organization
  const groupedActivity = filteredActivity.reduce((groups: any, item) => {
    const date = new Date(item.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-university-primary mb-2">
              Recent Activity
            </h1>
            <p className="text-gray-600">
              Complete history of your recent activity ({recentActivity.length} items)
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="course">Courses</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
            <SelectItem value="library">Library</SelectItem>
            <SelectItem value="calendar">Calendar</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity List */}
      {filteredActivity.length === 0 ? (
        <Card className="p-12 text-center border-gray-200 bg-white">
          <div className="text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No activity found</h3>
            {filterType === "all" ? (
              <p className="text-sm">Start exploring courses, notes, and library resources to see your activity here!</p>
            ) : (
              <p className="text-sm">No {getTypeLabel(filterType).toLowerCase()} activity found. Try changing the filter.</p>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivity).map(([dateString, items]: [string, any]) => (
            <div key={dateString}>
              <h3 className="text-lg font-medium text-university-primary mb-4 sticky top-0 bg-background py-2">
                {getRelativeDate(dateString)}
              </h3>
              
              <div className="space-y-3">
                {items.map((item: RecentActivityItem) => {
                  const Icon = getIcon(item.icon, item.type);
                  const color = getColor(item.type);
                  const timeAgo = getTimeAgo(item.timestamp);
                  
                  return (
                    <Card key={item.id} className="p-4 hover:shadow-md transition-all duration-200 border-gray-200 bg-white group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#0F172A] truncate group-hover:text-university-primary transition-colors">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-[#475569]">
                            {item.course && (
                              <>
                                <span>{item.course}</span>
                                <span>•</span>
                              </>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{timeAgo}</span>
                            </div>
                            <span>•</span>
                            <span>{formatDate(item.timestamp)}</span>
                          </div>
                        </div>
                        
                        <Badge 
                          variant="secondary" 
                          className={`${color} text-white text-xs border-0 flex-shrink-0`}
                        >
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}