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
import { AnnouncementsDialog, type Announcement } from "./components/AnnouncementsDialog";
import { SchedulePopup } from "./components/SchedulePopup";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/utils";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";

import defaultProfilePicture from 'figma:asset/4d1244c8cd23f93c1a9d40fe9c4df8756afecddf.png';

import { coursesData } from "./data/coursesData";
import { eventsData, type Event } from "./data/eventsData";
import { sampleNotes, getAnnouncementsData } from "./data/sampleData";

// Lazy loaded pages
const CoursesPage = lazy(() => import("./components/CoursesPage").then(m => ({ default: m.CoursesPage })));
const NotesPage = lazy(() => import("./components/NotesPage").then(m => ({ default: m.NotesPage })));
const CalendarPage = lazy(() => import("./components/CalendarPage").then(m => ({ default: m.CalendarPage })));
const CourseDetailsPage = lazy(() => import("./components/CourseDetailsPage").then(m => ({ default: m.CourseDetailsPage })));
const CompletedCoursesPage = lazy(() => import("./components/CompletedCoursesPage").then(m => ({ default: m.CompletedCoursesPage })));
const RecentActivityPage = lazy(() => import("./components/RecentActivityPage").then(m => ({ default: m.RecentActivityPage })));
const NoteDetailPage = lazy(() => import("./components/NoteDetailPage").then(m => ({ default: m.NoteDetailPage })));
const NoteEditPage = lazy(() => import("./components/NoteEditPage").then(m => ({ default: m.NoteEditPage })));
const UniversityInfoPage = lazy(() => import("./components/UniversityInfoPage").then(m => ({ default: m.UniversityInfoPage })));

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

  // Dialogs
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [showAnnouncementsDialog, setShowAnnouncementsDialog] = useState(false);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);

  // Page navigation
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
  const [events, setEvents] = useState<Event[]>(eventsData);
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncementsData());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Initialize app
  useEffect(() => {
    const initializeApp = () => {
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
        } catch {}
      }

      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setUserProfile(parsedProfile);
          if (parsedProfile.name) setUserName(parsedProfile.name);
        } catch {
          setUserProfile(DEFAULT_USER_PROFILE);
          setUserName(DEFAULT_USER_PROFILE.name);
        }
      } else {
        setUserProfile(DEFAULT_USER_PROFILE);
        setUserName(DEFAULT_USER_PROFILE.name);
      }

      setIsInitialized(true);
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
  const handleLogin = useCallback((name: string, password: string) => {
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
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme]);

  const trackActivity = useCallback((item: any) => {
    const activityItem = { ...item, lastAccessed: new Date().toISOString(), timestamp: Date.now() };
    setRecentActivity(prev => {
      const filtered = prev.filter((existing: any) => existing.id !== item.id);
      const updated = [activityItem, ...filtered].slice(0, 10);
      localStorage.setItem("recentActivity", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === "library") {
      window.open("https://my.openathens.net/?passiveLogin=false", "_blank");
      return;
    }
    setActiveTab(tab);
  }, []);

  const handleCourseClick = useCallback((course: any) => {
    trackActivity({ id: `course-${course.id}`, title: course.title, type: 'course', course: course.code, icon: 'BookOpen' });
    setSelectedCourse(course);
    setShowCourseDetails(true);
  }, [trackActivity]);

  const handleNoteClick = useCallback((note: any) => {
    trackActivity({ id: `note-${note.id}`, title: note.title, type: 'note', course: note.course, icon: 'FileText' });
    setSelectedNote(note);
    setShowNoteDetail(true);
  }, [trackActivity]);

  const handleSearchResultClick = useCallback((result: any) => {
    switch (result.type) {
      case 'course': handleCourseClick(result.data); break;
      case 'note': handleNoteClick(result.data); break;
      case 'event': 
        trackActivity({ id: `event-${result.data.id}`, title: result.data.title, type: 'calendar', icon: 'Calendar' });
        setActiveTab('calendar'); 
        break;
      case 'library': 
        trackActivity({ id: `library-${result.data.id}`, title: result.data.title, type: 'library', course: result.data.course, icon: 'Download' });
        window.open("https://my.openathens.net/?passiveLogin=false", "_blank");
        break;
    }
  }, [handleCourseClick, handleNoteClick, trackActivity]);

  const handleNotificationClick = (id: string) => {
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
      trackActivity({ id: `announcement-${id}`, title: announcement.title, type: 'announcement', icon: 'Bell' });
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    }
  };

  // Loading
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

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

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

  // -----------------------------
  // Render main app layout here
  // -----------------------------
  // For brevity, you can reuse your previous rendering code for dashboard, courses, notes, calendar, dialogs etc.
  // -----------------------------

  return (
    <div className={cn("min-h-screen bg-background", theme === "dark" ? "dark" : "")}>
      <Header {...headerProps} />
      {/* Sidebar and Main content */}
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
      <AIAssistant
        events={events}
        courses={courses}
        userName={userName}
        userProfile={userProfile}
        announcements={announcements}
        notes={sampleNotes}
        libraryItems={[]}
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
