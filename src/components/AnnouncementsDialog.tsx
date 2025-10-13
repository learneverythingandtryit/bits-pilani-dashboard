import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Megaphone } from "lucide-react";

export type AnnouncementPriority = "high" | "medium" | "low";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  time: string;
  priority: AnnouncementPriority;
  category: string;
}

interface AnnouncementsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
}

// Ensure priority is one of the allowed literal types
const getPriorityColor = (priority: AnnouncementPriority) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-orange-500";
    case "low":
      return "bg-green-500";
  }
};

// Map categories to colors
const getCategoryColor = (category: string) => {
  switch (category) {
    case "Academic":
      return "bg-blue-100 text-blue-800";
    case "Facilities":
      return "bg-green-100 text-green-800";
    case "IT Services":
      return "bg-purple-100 text-purple-800";
    case "Hostel":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Validate announcements to ensure type safety
const validateAnnouncements = (announcements: any[]): Announcement[] => {
  return announcements.map((a) => ({
    ...a,
    priority: ["high", "medium", "low"].includes(a.priority) ? (a.priority as AnnouncementPriority) : "low",
  }));
};

export function AnnouncementsDialog({ isOpen, onClose, announcements }: AnnouncementsDialogProps) {
  const validatedAnnouncements = validateAnnouncements(announcements);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Megaphone className="w-6 h-6 text-[#2563EB]" />
            All Announcements
          </DialogTitle>
          <DialogDescription>
            View all university announcements and important updates
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto pr-2 space-y-4 max-h-[60vh]">
          {validatedAnnouncements.map((announcement) => (
            <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-semibold text-[#0F172A] text-base leading-tight">
                  {announcement.title}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className={getCategoryColor(announcement.category)}>
                    {announcement.category}
                  </Badge>
                  <div
                    className={`w-2 h-2 rounded-full ${getPriorityColor(announcement.priority)}`}
                    title={`${announcement.priority} priority`}
                  ></div>
                </div>
              </div>
              
              <p className="text-sm text-[#475569] mb-3 leading-relaxed">
                {announcement.content}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#475569]">{announcement.time}</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
