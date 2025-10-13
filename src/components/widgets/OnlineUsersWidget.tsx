import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Users, MessageCircle } from "lucide-react";

export function OnlineUsersWidget() {
  const onlineUsers = [
    {
      id: 1,
      name: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332e234?w=150",
      status: "studying",
      course: "Data Structures",
      initials: "PS"
    },
    {
      id: 2,
      name: "Raj Patel",
      avatar: "",
      status: "online",
      course: "Physics Lab",
      initials: "RP"
    },
    {
      id: 3,
      name: "Sarah Wilson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      status: "in-class",
      course: "Mathematics",
      initials: "SW"
    },
    {
      id: 4,
      name: "Ahmed Khan",
      avatar: "",
      status: "studying",
      course: "Computer Networks",
      initials: "AK"
    },
    {
      id: 5,
      name: "Lisa Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      status: "online",
      course: "Engineering Graphics",
      initials: "LC"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-[#10B981]";
      case "studying": return "bg-[#2563EB]";
      case "in-class": return "bg-[#F59E0B]";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "online": return "Online";
      case "studying": return "Studying";
      case "in-class": return "In Class";
      default: return status;
    }
  };

  return (
    <Card className="p-6 bg-white border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#2563EB]" />
          <h3 className="font-semibold text-[#0F172A]">Online Classmates</h3>
        </div>
        <Badge variant="secondary" className="bg-[#10B981] text-white">
          {onlineUsers.length} online
        </Badge>
      </div>
      
      <div className="space-y-3">
        {onlineUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors group">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-[#1F3A8A] to-[#2563EB] text-white text-sm">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-[#0F172A] text-sm truncate">{user.name}</h4>
              <p className="text-xs text-[#475569] truncate">{user.course}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${getStatusColor(user.status)} text-white`}
              >
                {getStatusLabel(user.status)}
              </Badge>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MessageCircle className="w-4 h-4 text-[#475569] hover:text-[#2563EB]" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-[#2563EB] hover:text-[#1F3A8A] font-medium w-full text-left">
          View all classmates →
        </button>
      </div>
    </Card>
  );
}