import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  ArrowRight,
  Sunrise,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";

interface GreetingCardProps {
  userName?: string;
  onViewSchedule?: () => void;
}

export function GreetingCard({
  userName = "Student",
  onViewSchedule,
}: GreetingCardProps) {
  const currentHour = new Date().getHours();
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getGreeting = () => {
    if (currentHour < 6)
      return { text: "Good Evening", icon: Moon };
    if (currentHour < 12)
      return { text: "Good Morning", icon: Sunrise };
    if (currentHour < 17)
      return { text: "Good Afternoon", icon: Sun };
    if (currentHour < 21)
      return { text: "Good Evening", icon: Sunset };
    return { text: "Good Evening", icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <Card className="bg-university-primary text-white p-4 sm:p-8 border-none shadow-lg relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <GreetingIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-lg sm:text-2xl font-semibold">
              {greeting.text}, {userName}!
            </h2>
          </div>
          <p className="text-white/90 mb-2 text-sm sm:text-base">
            {currentDate}
          </p>
          <p className="text-white/70 text-xs sm:text-sm">
            Welcome to your student dashboard. Stay organized and on top of your academic journey.
          </p>
        </div>

        <div className="w-full sm:w-auto sm:text-right">
          <Button
            className="bg-white text-university-primary hover:bg-white/90 font-medium rounded-lg w-full sm:w-auto"
            size={typeof window !== 'undefined' && window.innerWidth < 640 ? "sm" : "lg"}
            onClick={onViewSchedule}
          >
            <span className="sm:hidden">Calendar</span>
            <span className="hidden sm:inline">View Schedule</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Simple decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
    </Card>
  );
}