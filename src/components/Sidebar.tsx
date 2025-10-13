import { useState } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Calendar, 
  Library, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed = false, 
  setIsCollapsed,
  isMobile = false,
  onMobileClose
}: SidebarProps) {

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "elearn", label: "E-learn Portal", icon: ExternalLink, isExternal: true, url: "https://elearn.bits-pilani.ac.in/" },
    { id: "library", label: "E-library", icon: ExternalLink },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "university-header flex flex-col transition-all duration-300",
        isMobile ? "h-full w-48 block" : "h-screen sticky top-0 lg:block", // Mobile: compact width, Desktop: sticky with screen height
        isMobile ? "w-48" : (isCollapsed ? "w-16" : "w-64")
      )}
    >
      {/* Header - Compact for mobile, regular for desktop */}
      <div className={cn("border-b border-university", isMobile ? "p-2" : "p-4")}>
        {isMobile ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileClose}
            className="w-full justify-center rounded-lg bg-white hover:bg-white/90 text-university-primary h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
            className="w-full justify-center rounded-lg bg-white hover:bg-white/90 text-university-primary"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        )}
      </div>

      {/* Menu Items - Compact for mobile, regular for desktop */}
      <nav className={cn("flex-1 space-y-1 flex flex-col", isMobile ? "p-2" : "p-4 space-y-2")}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          const handleClick = () => {
            if (item.isExternal && item.url) {
              window.open(item.url, '_blank', 'noopener,noreferrer');
            } else {
              setActiveTab(item.id);
            }
          };
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size={isCollapsed && !isMobile ? "icon" : isMobile ? "sm" : "default"}
              onClick={handleClick}
              className={cn(
                "w-full justify-start rounded-lg transition-all duration-200 font-medium text-xs",
                isMobile ? "h-8 px-2 py-1" : "h-10 px-3 py-2 text-sm",
                isActive 
                  ? "bg-white/20 text-white shadow-sm" 
                  : "hover:bg-white/10 text-white/80 hover:text-white",
                !isMobile && isCollapsed && "justify-center"
              )}
            >
              <Icon className={cn(
                isMobile ? "w-4 h-4" : "w-5 h-5", 
                (!isCollapsed || isMobile) && (isMobile ? "mr-2" : "mr-3")
              )} />
              {(!isCollapsed || isMobile) && (
                <span className={cn("truncate", isMobile ? "text-xs" : "text-sm")}>{item.label}</span>
              )}
            </Button>
          );
        })}
      </nav>

    </aside>
  );
}