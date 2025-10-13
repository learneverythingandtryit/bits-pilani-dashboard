import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Award, Star, Trophy, Target, Zap, BookOpen } from "lucide-react";

export function BadgesWidget() {
  const badges = [
    {
      id: 1,
      name: "Perfect Attendance",
      description: "Attended 100% of lectures this month",
      icon: Target,
      color: "bg-[#10B981]",
      earned: true,
      progress: 100
    },
    {
      id: 2,
      name: "Quiz Master",
      description: "Scored 90+ in 5 consecutive quizzes",
      icon: Trophy,
      color: "bg-[#F59E0B]",
      earned: true,
      progress: 100
    },
    {
      id: 3,
      name: "Early Bird",
      description: "Submit assignments 2 days early",
      icon: Zap,
      color: "bg-[#2563EB]",
      earned: false,
      progress: 75
    },
    {
      id: 4,
      name: "Study Streak",
      description: "7 days of continuous learning",
      icon: Star,
      color: "bg-purple-500",
      earned: false,
      progress: 60
    },
    {
      id: 5,
      name: "Top Performer",
      description: "Ranked in top 10% of class",
      icon: Award,
      color: "bg-red-500",
      earned: true,
      progress: 100
    },
    {
      id: 6,
      name: "Knowledge Seeker",
      description: "Completed 50 additional readings",
      icon: BookOpen,
      color: "bg-indigo-500",
      earned: false,
      progress: 45
    }
  ];

  const earnedBadges = badges.filter(badge => badge.earned);
  const inProgressBadges = badges.filter(badge => !badge.earned);

  return (
    <Card className="p-6 bg-white border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#2563EB]" />
          <h3 className="font-semibold text-[#0F172A]">Achievements</h3>
        </div>
        <Badge variant="secondary" className="bg-[#F59E0B] text-white">
          {earnedBadges.length} earned
        </Badge>
      </div>
      
      {/* Earned Badges */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#0F172A] mb-3">Earned Badges</h4>
        <div className="grid grid-cols-3 gap-3">
          {earnedBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.id} className="flex flex-col items-center p-3 rounded-lg bg-[#F3F4F6] hover:bg-gray-100 transition-colors group cursor-pointer">
                <div className={`w-10 h-10 ${badge.color} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-[#0F172A] font-medium text-center leading-tight">
                  {badge.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* In Progress */}
      <div>
        <h4 className="text-sm font-medium text-[#0F172A] mb-3">In Progress</h4>
        <div className="space-y-3">
          {inProgressBadges.slice(0, 2).map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#F3F4F6] hover:bg-gray-100 transition-colors">
                <div className={`w-8 h-8 ${badge.color} opacity-60 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-[#0F172A] truncate">{badge.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${badge.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${badge.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-[#475569] font-medium">{badge.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-[#2563EB] hover:text-[#1F3A8A] font-medium">
          View all achievements →
        </button>
      </div>
    </Card>
  );
}