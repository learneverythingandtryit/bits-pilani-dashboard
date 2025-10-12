import image_7f13a12b6e7cf3d6a516fe74feab5ad5b5053146 from 'figma:asset/7f13a12b6e7cf3d6a516fe74feab5ad5b5053146.png';
import { Bell, Search, LogOut, User, Settings, Sun, Moon, BookOpen, FileText, Calendar, Download, X, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";

interface UserProfile {
  name: string;
  id: string;
  email: string;
  phone: string;
  course: string;
  semester: string;
  avatar: string;
}

interface Course {
  id: string;
  title: string;
  code: string;
  semester: number;
  status: 'completed' | 'ongoing' | 'upcoming';
}

interface Note {
  id: string;
  title: string;
  course: string;
  content: string;
  category: string;
  date: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  description?: string;
}

interface LibraryItem {
  id: string;
  title: string;
  type: string;
  course: string;
  fileType: string;
  size?: string;
  uploadDate: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'course' | 'note' | 'event' | 'library' | 'announcement';
  subtitle?: string;
  description?: string;
  icon: any;
  data?: any;
}

interface HeaderProps {
  onLogout?: () => void;
  announcements?: Array<{ id: string; title: string; content: string; time: string; priority: string; category: string; read: boolean; }>;
  notifications?: Array<{ id: string; title: string; message: string; time: string; read: boolean; }>;
  onNotificationClick?: (id: string) => void;
  onThemeToggle?: () => void;
  theme?: "light" | "dark";
  onProfileEdit?: () => void;
  userProfile?: UserProfile;
  courses?: Course[];
  notes?: Note[];
  events?: Event[];
  libraryItems?: LibraryItem[];
  onSearchResultClick?: (result: SearchResult) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  onLogoClick?: () => void;
}

export function Header({ 
  onLogout, 
  announcements = [], 
  notifications = [],
  onNotificationClick,
  onThemeToggle,
  theme = "light",
  onProfileEdit,
  userProfile,
  courses = [],
  notes = [],
  events = [],
  libraryItems = [],
  onSearchResultClick,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
  onLogoClick
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const unreadAnnouncementsCount = announcements.filter(a => !a.read).length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const totalUnreadCount = unreadAnnouncementsCount + unreadNotificationsCount;

  // Search logic
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setSelectedIndex(-1);
      return;
    }

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search courses
    courses.forEach(course => {
      const titleMatch = course.title.toLowerCase().includes(searchTerm);
      const codeMatch = course.code.toLowerCase().includes(searchTerm);
      
      if (titleMatch || codeMatch) {
        results.push({
          id: `course-${course.id}`,
          title: course.title,
          type: 'course',
          subtitle: course.code,
          description: `Semester ${course.semester} • ${course.status}`,
          icon: BookOpen,
          data: course
        });
      }
    });

    // Search notes
    notes.forEach(note => {
      const titleMatch = note.title.toLowerCase().includes(searchTerm);
      const courseMatch = note.course.toLowerCase().includes(searchTerm);
      const contentMatch = note.content.toLowerCase().includes(searchTerm);
      
      if (titleMatch || courseMatch || contentMatch) {
        results.push({
          id: `note-${note.id}`,
          title: note.title,
          type: 'note',
          subtitle: note.course,
          description: note.category,
          icon: FileText,
          data: note
        });
      }
    });

    // Search events
    events.forEach(event => {
      const titleMatch = event.title.toLowerCase().includes(searchTerm);
      const typeMatch = event.type.toLowerCase().includes(searchTerm);
      const descMatch = event.description?.toLowerCase().includes(searchTerm);
      
      if (titleMatch || typeMatch || descMatch) {
        results.push({
          id: `event-${event.id}`,
          title: event.title,
          type: 'event',
          subtitle: new Date(event.date).toLocaleDateString(),
          description: `${event.time} • ${event.type}`,
          icon: Calendar,
          data: event
        });
      }
    });

    // Search library items
    libraryItems.forEach(item => {
      const titleMatch = item.title.toLowerCase().includes(searchTerm);
      const courseMatch = item.course.toLowerCase().includes(searchTerm);
      const typeMatch = item.type.toLowerCase().includes(searchTerm);
      
      if (titleMatch || courseMatch || typeMatch) {
        results.push({
          id: `library-${item.id}`,
          title: item.title,
          type: 'library',
          subtitle: item.course,
          description: `${item.fileType} • ${item.type}`,
          icon: Download,
          data: item
        });
      }
    });

    // Search announcements
    announcements.forEach(announcement => {
      const titleMatch = announcement.title.toLowerCase().includes(searchTerm);
      const contentMatch = announcement.content.toLowerCase().includes(searchTerm);
      const categoryMatch = announcement.category.toLowerCase().includes(searchTerm);
      
      if (titleMatch || contentMatch || categoryMatch) {
        results.push({
          id: `announcement-${announcement.id}`,
          title: announcement.title,
          type: 'announcement',
          subtitle: announcement.category,
          description: announcement.content.substring(0, 100) + "...",
          icon: Bell,
          data: announcement
        });
      }
    });

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchTerm;
      const bExact = b.title.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.title.localeCompare(b.title);
    });

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
    setShowResults(true);
    setSelectedIndex(-1);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    setSearchQuery("");
    setShowResults(false);
    setSelectedIndex(-1);
    onSearchResultClick?.(result);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-university-primary text-white';
      case 'note': return 'bg-green-600 text-white';
      case 'event': return 'bg-orange-600 text-white';
      case 'library': return 'bg-blue-600 text-white';
      case 'announcement': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course': return "Courses";
      case 'note': return "Notes";
      case 'event': return "Events";
      case 'library': return "Library";
      case 'announcement': return "Announcements";
      default: return type;
    }
  };
  
  return (
    <header className="university-header flex items-center justify-between sticky top-0 z-50 w-full px-2 xs:px-3 sm:px-6 py-2 xs:py-3">
      {/* Mobile Menu Button & Logo */}
      <div className="flex items-center gap-1 xs:gap-2 sm:gap-4 min-w-0 flex-shrink-0">
        {/* Mobile Menu Button - Only show on mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden text-white hover:bg-white/10 p-1 xs:p-2 min-w-0 w-8 h-8 xs:w-9 xs:h-9"
        >
          <Menu className="w-4 h-4 xs:w-5 xs:h-5" />
        </Button>
        
        <ImageWithFallback 
          src={image_7f13a12b6e7cf3d6a516fe74feab5ad5b5053146}
          alt="BITS Pilani Logo"
          className="h-6 xs:h-8 sm:h-10 w-auto object-contain max-w-[120px] xs:max-w-none cursor-pointer"
          onClick={onLogoClick}
        />
      </div>

      {/* Search Bar - Hidden on small mobile, visible on larger screens */}
      <div className="hidden sm:flex flex-1 max-w-xl mx-2 lg:mx-8" ref={searchRef}>
        <div className="relative w-full">
          <Input 
            ref={inputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Search Courses & Notes" 
            className="university-input border-white/20 bg-white/10 text-white placeholder-blue-100 focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 w-full max-w-80 px-4 py-3"
          />
          {searchQuery && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-200 text-gray-500"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg border bg-white w-full max-w-full">
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2 px-2">
                  {searchResults.length} {searchResults.length === 1 ? "result found" : "results found"}
                </div>
                {searchResults.map((result, index) => {
                  const Icon = result.icon;
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-university-primary text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-white/20' : getTypeColor(result.type)
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium text-sm truncate ${
                            isSelected ? 'text-white' : 'text-gray-900'
                          }`}>
                            {result.title}
                          </h4>
                          <Badge 
                            className={`text-xs ${
                              isSelected ? 'bg-white/20 text-white' : getTypeColor(result.type)
                            }`}
                          >
                            {getTypeLabel(result.type)}
                          </Badge>
                        </div>
                        {result.subtitle && (
                          <p className={`text-xs truncate ${
                            isSelected ? 'text-white/80' : 'text-gray-600'
                          }`}>
                            {result.subtitle}
                          </p>
                        )}
                        {result.description && (
                          <p className={`text-xs truncate mt-1 ${
                            isSelected ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            {result.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          
          {/* No Results */}
          {showResults && searchQuery && searchResults.length === 0 && (
            <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border bg-white">
              <div className="p-4 text-center">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-1">No results found</p>
                <p className="text-xs text-gray-400">
                  search courses & notes
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 xs:gap-2 sm:gap-4 min-w-0 flex-shrink-0">
        {/* Mobile Search Button - Only show on small screens */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {/* TODO: Add mobile search functionality */}}
          className="sm:hidden text-white hover:bg-white/10 p-1 xs:p-2 min-w-0 w-8 h-8 xs:w-9 xs:h-9"
        >
          <Search className="w-4 h-4 xs:w-5 xs:h-5" />
        </Button>

        {/* Theme Toggle - Now visible on all screen sizes */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          className="rounded-lg hover:bg-white/10 transition-colors text-white w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4 xs:w-5 xs:h-5" />
          ) : (
            <Sun className="w-4 h-4 xs:w-5 xs:h-5" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-white/10 relative transition-colors text-white w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10"
            >
              <Bell className="w-4 h-4 xs:w-5 xs:h-5" />
              {totalUnreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 xs:w-5 xs:h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center animate-pulse min-w-0">
                  <span className="text-xs leading-none">{totalUnreadCount > 9 ? '9+' : totalUnreadCount}</span>
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <div className="p-2">
              {/* Notifications Section */}
              {notifications.length > 0 && (
                <>
                  <h3 className="font-semibold text-sm text-university-primary mb-2">Notifications</h3>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                        notification.read 
                          ? 'bg-gray-50/50' 
                          : 'bg-green-50 border-l-4 border-green-500'
                      }`}
                      onClick={() => onNotificationClick?.(notification.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm text-university-primary">{notification.title}</h4>
                        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                          System
                        </span>
                      </div>
                      <p className="text-xs text-university-secondary mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  ))}
                  {announcements.length > 0 && <div className="border-t border-gray-200 my-2"></div>}
                </>
              )}
              
              {/* Announcements Section */}
              <h3 className="font-semibold text-sm text-university-primary mb-2">Announcements</h3>
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No announcements</p>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                      announcement.read 
                        ? 'bg-gray-50/50' 
                        : announcement.priority === 'high' 
                        ? 'bg-red-50 border-l-4 border-red-500' 
                        : announcement.priority === 'medium'
                        ? 'bg-orange-50 border-l-4 border-orange-500'
                        : 'bg-blue-50 border-l-4 border-university-primary'
                    }`}
                    onClick={() => onNotificationClick?.(announcement.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-university-primary">{announcement.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        announcement.priority === 'high' ? 'bg-red-100 text-red-700' :
                        announcement.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {announcement.category}
                      </span>
                    </div>
                    <p className="text-xs text-university-secondary mt-1 line-clamp-2">{announcement.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{announcement.time}</p>
                  </div>
                ))
              )}
              
              {/* Show message if no notifications or announcements */}
              {notifications.length === 0 && announcements.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 hover:bg-white/10 rounded-lg p-1 xs:p-2 cursor-pointer transition-colors min-w-0">
              <Avatar className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ring-1 xs:ring-2 ring-white/30 flex-shrink-0">
                <AvatarImage src={userProfile?.avatar} />
                <AvatarFallback className="bg-university-primary text-white font-semibold text-xs xs:text-sm">
                  {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block md:block min-w-0">
                <p className="text-xs sm:text-sm text-white font-medium truncate max-w-[80px] sm:max-w-none">
                  HARI HARA SUDHAN
                </p>
                <p className="text-xs text-blue-100 truncate max-w-[80px] sm:max-w-none">
                  {userProfile?.id || 'ID not set'}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userProfile?.avatar || "https://images.unsplash.com/photo-1627561950134-112f5d15e30f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwYXZhdGFyJTIwcHJvZmlsZSUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzU3NjU4NDgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"} />
                  <AvatarFallback className="bg-university-primary text-white">
                    {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('') : 'AK'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-university-primary">HARI HARA SUDHAN</p>
                  <p className="text-xs text-university-secondary">{userProfile?.course || 'M.Tech Student'}</p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-gray-50"
              onClick={onProfileEdit}
            >
              <User className="w-4 h-4 mr-2 text-university-primary" />
              <span className="text-university-secondary">Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
              <Settings className="w-4 h-4 mr-2 text-university-primary" />
              <span className="text-university-secondary">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onLogout && (
              <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}