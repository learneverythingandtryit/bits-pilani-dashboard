import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  time: string;
  priority: "high" | "medium" | "low";
  category: string;
}

interface AnnouncementsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-orange-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

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
    case "Events":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function AnnouncementsDialog({ isOpen, onClose, announcements }: AnnouncementsDialogProps) {
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
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No announcements at this time</p>
            </div>
          ) : (
            announcements.map((announcement) => (
            <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-semibold text-[#0F172A] text-base leading-tight">
                  {announcement.title}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className={getCategoryColor(announcement.category)}>
                    {announcement.category}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(announcement.priority)}`} title={`${announcement.priority} priority`}></div>
                </div>
              </div>
              
              <p className="text-sm text-[#475569] mb-3 leading-relaxed">
                {announcement.content}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#475569]">{announcement.time}</span>
              </div>
            </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}