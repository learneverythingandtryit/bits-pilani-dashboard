import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { Grid, List } from "lucide-react";
import { LoginPage } from "./components/LoginPage";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { GreetingCard } from "./components/GreetingCard";
import { DashboardStats } from "./components/DashboardStats";
import { CourseCard } from "./components/CourseCard";
import { RecentlyAccessed } from "./components/RecentlyAccessed";
import { AIAssistant } from "./components/AIAssistant_Fixed";
import { AnnouncementsWidget } from "./components/widgets/AnnouncementsWidget";
import { ProfileEditDialog } from "./components/ProfileEditDialog";
import { AnnouncementsDialog } from "./components/AnnouncementsDialog";
import { SchedulePopup } from "./components/SchedulePopup";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/utils";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load heavy components
const CoursesPage = lazy(() => import("./components/CoursesPage").then(m => ({ default: m.CoursesPage })));
const NotesPage = lazy(() => import("./components/NotesPage").then(m => ({ default: m.NotesPage })));
const CalendarPage = lazy(() => import("./components/CalendarPage").then(m => ({ default: m.CalendarPage })));
const CourseDetailsPage = lazy(() => import("./components/CourseDetailsPage").then(m => ({ default: m.CourseDetailsPage })));
const CompletedCoursesPage = lazy(() => import("./components/CompletedCoursesPage").then(m => ({ default: m.CompletedCoursesPage })));
const RecentActivityPage = lazy(() => import("./components/RecentActivityPage").then(m => ({ default: m.RecentActivityPage })));
const NoteDetailPage = lazy(() => import("./components/NoteDetailPage").then(m => ({ default: m.NoteDetailPage })));
const NoteEditPage = lazy(() => import("./components/NoteEditPage").then(m => ({ default: m.NoteEditPage })));
const UniversityInfoPage = lazy(() => import("./components/UniversityInfoPage").then(m => ({ default: m.UniversityInfoPage })));

// Import data from separate files
import { coursesData } from "./data/coursesData";
import { eventsData } from "./data/eventsData";
import { sampleNotes, getAnnouncementsData } from "./data/sampleData";

import "./utils/errorHandler";

// Default profile picture - using a placeholder
const defaultProfilePicture = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23191f5e" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-size="40" font-family="Arial"%3EHS%3C/text%3E%3C/svg%3E';

// Default user profile
const DEFAULT_USER_PROFILE = {
  name: "HARI HARA SUDHAN",
  id: "2021WA15025",
  email: "2021WA15025@pilani.bits-pilani.ac.in",
  phone: "+91 9876543210",
  course: "B.Tech Computer Science",
  semester: "4th Semester",
  avatar: defaultProfilePicture
};

function AppContent() {
  // Core app state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState(DEFAULT_USER_PROFILE);
  
  // UI state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Dialog states
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [showAnnouncementsDialog, setShowAnnouncementsDialog] = useState(false);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  
  // Page navigation states
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [showNoteDetail, setShowNoteDetail] = useState(false);
  const [showNoteEdit, setShowNoteEdit] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [showCompletedCourses, setShowCompletedCourses] = useState(false);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [showUniversityInfo, setShowUniversityInfo] = useState(false);
  
  // Data states
  const [courses] = useState(coursesData);
  const [events, setEvents] = useState(eventsData);
  const [announcements, setAnnouncements] = useState(getAnnouncementsData());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load from localStorage
        const savedLogin = localStorage.getItem("isLoggedIn");
        const savedUserName = localStorage.getItem("userName");
        const savedTheme = localStorage.getItem("theme");
        const savedActivity = localStorage.getItem("recentActivity");
        const savedProfile = localStorage.getItem("userProfile");
        
        if (savedLogin === "true") setIsLoggedIn(true);
        if (savedUserName) setUserName(savedUserName);
        if (savedTheme) setTheme(savedTheme as "light" | "dark");
        
        if (savedActivity) {
          try {
            setRecentActivity(JSON.parse(savedActivity));
          } catch (e) {
            console.warn("Failed to parse recent activity");
          }
        }
        
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            setUserProfile(parsedProfile);
            // Ensure userName matches the profile name
            if (parsedProfile.name) {
              setUserName(parsedProfile.name);
            }
          } catch (e) {
            console.warn("Failed to parse user profile");
            // Fallback to default profile
            setUserProfile(DEFAULT_USER_PROFILE);
            setUserName(DEFAULT_USER_PROFILE.name);
          }
        } else {
          // If no saved profile, use default
          setUserProfile(DEFAULT_USER_PROFILE);
          setUserName(DEFAULT_USER_PROFILE.name);
        }
      } catch (error) {
        console.warn("Failed to initialize app:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sync userName with profile
  useEffect(() => {
    if (isLoggedIn && userProfile.name && userName !== userProfile.name) {
      setUserName(userProfile.name);
    }
  }, [userProfile.name, isLoggedIn, userName]);

  // Handlers
  const handleLogin = useCallback((_name: string, _password: string) => {
    // Always use the default profile name, not the login name
    const initialProfile = { ...DEFAULT_USER_PROFILE };
    setUserName(DEFAULT_USER_PROFILE.name);
    setUserProfile(initialProfile);
    setIsLoggedIn(true);
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", DEFAULT_USER_PROFILE.name);
    localStorage.setItem("userProfile", JSON.stringify(initialProfile));
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName("");
    setActiveTab("dashboard");
    
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userProfile");
  }, []);

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [theme]);

  const trackActivity = useCallback((item: any) => {
    const activityItem = {
      ...item,
      lastAccessed: new Date().toISOString(),
      timestamp: Date.now()
    };

    setRecentActivity((prev: any) => {
      const filtered = prev.filter((existing: any) => existing.id !== item.id);
      const updated = [activityItem, ...filtered].slice(0, 10);
      localStorage.setItem("recentActivity", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle library tab click with redirect
  const handleTabChange = useCallback((tab: string) => {
    if (tab === "library") {
      // Redirect to OpenAthens E-library
      window.open("https://my.openathens.net/?passiveLogin=false", "_blank");
      return;
    }
    setActiveTab(tab);
  }, []);

  const handleCourseClick = useCallback((course: any) => {
    trackActivity({
      id: `course-${course.id}`,
      title: course.title,
      type: 'course',
      course: course.code,
      icon: 'BookOpen'
    });
    setSelectedCourse(course);
    setShowCourseDetails(true);
  }, [trackActivity]);

  const handleNoteClick = useCallback((note: any) => {
    trackActivity({
      id: `note-${note.id}`,
      title: note.title,
      type: 'note',
      course: note.course,
      icon: 'FileText'
    });
    setSelectedNote(note);
    setShowNoteDetail(true);
  }, [trackActivity]);

  const handleSearchResultClick = useCallback((result: any) => {
    switch (result.type) {
      case 'course':
        handleCourseClick(result.data);
        break;
      case 'note':
        handleNoteClick(result.data);
        break;
      case 'event':
        trackActivity({
          id: `event-${result.data.id}`,
          title: result.data.title,
          type: 'calendar',
          icon: 'Calendar'
        });
        setActiveTab('calendar');
        break;
      case 'library':
        trackActivity({
          id: `library-${result.data.id}`,
          title: result.data.title,
          type: 'library',
          course: result.data.course,
          icon: 'Download'
        });
        // Redirect to OpenAthens E-library instead of setting active tab
        window.open("https://my.openathens.net/?passiveLogin=false", "_blank");
        break;
    }
  }, [handleCourseClick, handleNoteClick, trackActivity]);

  const handleNotificationClick = (id: string) => {
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
      trackActivity({
        id: `announcement-${id}`,
        title: announcement.title,
        type: 'announcement',
        icon: 'Bell'
      });
      setAnnouncements(prev => 
        prev.map(ann => ann.id === id ? { ...ann, read: true } : ann)
      );
    }
  };

  // Loading state
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-university-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading BITS Pilani Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Shared header props
  const headerProps = {
    onLogout: handleLogout,
    announcements,
    notifications,
    onNotificationClick: handleNotificationClick,
    onThemeToggle: handleThemeToggle,
    theme,
    onProfileEdit: () => setIsProfileDialogOpen(true),
    userProfile,
    courses,
    notes: sampleNotes,
    events,
    libraryItems: [],
    onSearchResultClick: handleSearchResultClick,
    onMobileMenuToggle: () => setIsMobileSidebarOpen(!isMobileSidebarOpen),
    isMobileMenuOpen: isMobileSidebarOpen,
    onLogoClick: () => setShowUniversityInfo(true)
  };

  // Show special pages
  if (showUniversityInfo) {
    return (
      <div className={cn("min-h-screen bg-background", theme === "dark" ? "dark" : "")}>
        <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-university-primary rounded-full"></div></div>}>
          <UniversityInfoPage 
            onBack={() => setShowUniversityInfo(false)}
          />
        </Suspense>
      </div>
    );
  }

  if (showNoteEdit && editingNote) {
    return (
      <div className={cn("min-h-screen bg-background", theme === "dark" ? "dark" : "")}>
        <Header {...headerProps} />
        <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-university-primary rounded-full"></div></div>}>
          <NoteEditPage 
            note={editingNote}
            courses={courses}
            onBack={() => {
              setShowNoteEdit(false);
              setEditingNote(null);
              if (selectedNote) setShowNoteDetail(true);
            }}
            onSave={(updatedNote) => {
              if (selectedNote && selectedNote.id === updatedNote.id) {
                setSelectedNote(updatedNote);
              }
              setShowNoteEdit(false);
              setEditingNote(null);
              setShowNoteDetail(true);
              trackActivity({
                id: `note-edit-${updatedNote.id}`,
                title: `Edited: ${updatedNote.title}`,
                type: 'note',
                course: updatedNote.course,
                icon: 'Edit'
              });
            }}
            onCancel={() => {
              setShowNoteEdit(false);
              setEditingNote(null);
              if (selectedNote) setShowNoteDetail(true);
            }}
          />
        </Suspense>
      </div>
    );
  }

  if (showNoteDetail && selectedNote) {
    return (
      <div className={cn("min-h-screen bg-background", theme === "dark" ? "dark" : "")}>
        <Header {...headerProps} />
        <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-university-primary rounded-full"></div></div>}>
          <NoteDetailPage 
            note={selectedNote} 
            onBack={() => {
              setShowNoteDetail(false);
              setSelectedNote(null);
            }}
            onEdit={(note) => {
              setEditingNote(note);
              setShowNoteDetail(false);
              setShowNoteEdit(true);
            }}
            onToggleFavorite={(noteId) => {
              console.log('Toggle favorite for note:', noteId);
            }}
          />
        </Suspense>
      </div>
    );
  }

  if (showCourseDetails && selectedCourse) {
    return (
      <div className={cn("min-h-screen bg-background", theme === "dark" ? "dark" : "")}>
        <Header {...headerProps} />
        <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-university-primary rounded-full"></div></div>}>
          <CourseDetailsPage 
            course={selectedCourse} 
            onBack={() => {
              setShowCourseDetails(false);
              setSelectedCourse(null);
            }}
          />
        </Suspense>
      </div>
    );
  }

  if (showCompletedCourses) {
    return (
      <div className={cn("min-h-screen bg-background", theme === "dark" ? "dark" : "")}>
        <Header {...headerProps} />
        <div className="flex university-content">
          <div className="hidden lg:block">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={handleTabChange}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />
          </div>
          <main className="flex-1 p-3 sm:p-6 w-full min-w-0 bg-background">
            <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-university-primary rounded-full"></div></div>}>
              <CompletedCoursesPage 
                courses={courses}
                onBack={() => setShowCompletedCourses(false)}
              />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  if (showRecentActivity) {
    return (
      <div className={cn("min-h-screen bg-background", theme === "dark" ? "dark" : "")}>
        <Header {...headerProps} />
        <div className="flex university-content">
          <div className="hidden lg:block">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={handleTabChange}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />
          </div>
          <main className="flex-1 p-3 sm:p-6 w-full min-w-0 bg-background">
            <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-university-primary rounded-full"></div></div>}>
              <RecentActivityPage 
                recentActivity={recentActivity}
                onBack={() => setShowRecentActivity(false)}
              />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Main app layout
  return (
    <div className={cn("min-h-screen bg-background", theme === "dark" ? "dark" : "")}>
      <Header {...headerProps} />
        
      <div className="flex university-content">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleTabChange}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>
        
        {/* Mobile Sidebar */}
        {isMobileSidebarOpen && (
          <>
            <div className="lg:hidden fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-sm" 
                 onClick={() => setIsMobileSidebarOpen(false)} />
            <div className="lg:hidden fixed left-0 top-16 h-[calc(100vh-4rem)] w-48 z-50 bg-card border-r border-university-border shadow-2xl overflow-y-auto">
              <Sidebar 
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                  handleTabChange(tab);
                  setIsMobileSidebarOpen(false);
                }}
                isCollapsed={false}
                setIsCollapsed={() => {}}
                isMobile={true}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </>
        )}
        
        <main className="flex-1 p-3 sm:p-6 w-full min-w-0 bg-background transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <>
                <div className="mb-8">
                  <GreetingCard 
                    userName={userName} 
                    onViewSchedule={() => setShowSchedulePopup(true)}
                  />
                </div>

                <div className="mb-8">
                  <AnnouncementsWidget 
                    onViewAll={() => setShowAnnouncementsDialog(true)} 
                    announcements={announcements}
                  />
                </div>

                <DashboardStats 
                  courses={courses} 
                  onCompletedCoursesClick={() => setShowCompletedCourses(true)}
                  onCoursesTabClick={() => setActiveTab("courses")}
                  onCurrentSemesterClick={() => setActiveTab("courses")}
                />

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white">Course Overview</h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={viewMode === "grid" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className="rounded-lg"
                        >
                          <Grid className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className="rounded-lg"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className={cn(
                      "gap-4 sm:gap-6",
                      viewMode === "grid" 
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                        : "space-y-4"
                    )}>
                      {courses.filter(c => c.status === "ongoing").slice(0, 4).map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          viewMode={viewMode}
                          onCourseClick={handleCourseClick}
                        />
                      ))}
                    </div>
                  </div>

                  <RecentlyAccessed 
                    recentActivity={recentActivity} 
                    onViewAllClick={() => setShowRecentActivity(true)}
                  />
                </div>
              </>
            )}

            {activeTab === "courses" && (
              <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-university-primary rounded-full"></div></div>}>
                <CoursesPage courses={courses} onCourseClick={handleCourseClick} />
              </Suspense>
            )}

            {activeTab === "notes" && (
              <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-university-primary rounded-full"></div></div>}>
                <NotesPage courses={courses} onNoteClick={handleNoteClick} />
              </Suspense>
            )}

            {activeTab === "calendar" && (
              <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-university-primary rounded-full"></div></div>}>
                <CalendarPage 
                  events={events} 
                  onEventsChange={setEvents} 
                  courses={courses}
                  onEventClick={(event) => trackActivity({
                    id: `event-${event.id}`,
                    title: event.title,
                    type: 'calendar',
                    icon: 'Calendar'
                  })}
                  onNotificationAdd={(notification) => setNotifications(prev => [notification, ...prev])}
                />
              </Suspense>
            )}

            {!["dashboard", "courses", "notes", "calendar", "library"].includes(activeTab) && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-[#0F172A] dark:text-white mb-2">
                    {activeTab === "elearn" ? "E-learn Portal" :
                     activeTab === "settings" ? "Settings" : "Dashboard"}
                  </h2>
                  <p className="text-[#475569] dark:text-gray-300">This section is coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        events={events} 
        courses={courses}
        userName={userName}
        userProfile={userProfile}
        announcements={announcements}
        notes={sampleNotes}
        libraryItems={[]}
      />
      
      {/* Dialogs */}
      <ProfileEditDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        userProfile={userProfile}
        onSave={(updatedProfile) => {
          setUserProfile(updatedProfile);
          setUserName(updatedProfile.name);
          setIsProfileDialogOpen(false);
          localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
          localStorage.setItem("userName", updatedProfile.name);
        }}
      />
      
      <AnnouncementsDialog
        isOpen={showAnnouncementsDialog}
        onClose={() => setShowAnnouncementsDialog(false)}
        announcements={announcements}
      />

      <SchedulePopup
        isOpen={showSchedulePopup}
        onClose={() => setShowSchedulePopup(false)}
        events={events}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-university-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing BITS Pilani Dashboard...</p>
          </div>
        </div>
      }>
        <AppContent />
      </Suspense>
    </ErrorBoundary>
  );
}