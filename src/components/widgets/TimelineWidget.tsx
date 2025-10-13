import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Bot, Bell, CheckCircle } from "lucide-react";

export function TimelineWidget() {
  const reminders = [
    {
      id: 1,
      type: "ai-suggestion",
      title: "Review Calculus Chapter 5",
      description: "Based on your exam schedule, I recommend reviewing derivatives before tomorrow's class.",
      time: "30 minutes ago",
      status: "pending",
      priority: "high"
    },
    {
      id: 2,
      type: "reminder",
      title: "Submit Lab Report",
      description: "Physics lab report is due in 2 days. Start working on the conclusion section.",
      time: "1 hour ago",
      status: "pending",
      priority: "medium"
    },
    {
      id: 3,
      type: "ai-suggestion",
      title: "Study Group Recommendation",
      description: "Your classmates are discussing Data Structures. Join the conversation to clarify doubts.",
      time: "2 hours ago",
      status: "completed",
      priority: "low"
    },
    {
      id: 4,
      type: "reminder",
      title: "Assignment Completed",
      description: "Great job! You've submitted your Math assignment ahead of the deadline.",
      time: "1 day ago",
      status: "completed",
      priority: "low"
    }
  ];

  const getIcon = (type: string, status: string) => {
    if (status === "completed") return CheckCircle;
    return type === "ai-suggestion" ? Bot : Bell;
  };

  const getIconColor = (type: string, status: string) => {
    if (status === "completed") return "text-[#10B981]";
    return type === "ai-suggestion" ? "text-[#2563EB]" : "text-[#F59E0B]";
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="p-6 bg-white border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-[#2563EB]" />
        <h3 className="font-semibold text-[#0F172A]">AI Timeline</h3>
      </div>
      
      <div className="space-y-4">
        {reminders.map((reminder, index) => {
          const Icon = getIcon(reminder.type, reminder.status);
          const iconColor = getIconColor(reminder.type, reminder.status);
          
          return (
            <div key={reminder.id} className="relative">
              {index !== reminders.length - 1 && (
                <div className="absolute left-6 top-8 w-px h-8 bg-gray-200"></div>
              )}
              
              <div className="flex gap-3">
                <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 ${reminder.status === "completed" ? "opacity-60" : ""}`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`font-medium text-sm ${reminder.status === "completed" ? "text-[#475569] line-through" : "text-[#0F172A]"}`}>
                      {reminder.title}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getPriorityBadge(reminder.priority)}`}
                    >
                      {reminder.priority}
                    </Badge>
                  </div>
                  
                  <p className={`text-xs mb-2 leading-relaxed ${reminder.status === "completed" ? "text-[#475569]" : "text-[#475569]"}`}>
                    {reminder.description}
                  </p>
                  
                  <span className="text-xs text-[#475569]">{reminder.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-[#2563EB] hover:text-[#1F3A8A] font-medium">
          View all reminders →
        </button>
      </div>
    </Card>
  );
}