import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { Grid, List, X } from "lucide-react";
import { LoginPage } from "./components/LoginPage";
import { AdminLoginPage } from "./components/AdminLoginPage";
import { AdminDashboard } from "./components/AdminDashboard_Enhanced";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { GreetingCard } from "./components/GreetingCard";
import { DashboardStats } from "./components/DashboardStats";
import { CourseCard } from "./components/CourseCard";
import { RecentlyAccessed } from "./components/RecentlyAccessed";
import { AIAssistant } from "./components/AIAssistant_Conversational";
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
import { projectId, publicAnonKey } from './utils/supabase/info';

import "./utils/errorHandler";

// Import default profile picture
import defaultProfilePicture from 'figma:asset/4d1244c8cd23f93c1a9d40fe9c4df8756afecddf.png';

function AppContent() {
  // Core app state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  
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
  const [courses, setCourses] = useState(coursesData);
  const [events, setEvents] = useState(eventsData);
  const [announcements, setAnnouncements] = useState(getAnnouncementsData());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notes, setNotes] = useState(sampleNotes);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load from localStorage
        const savedLogin = localStorage.getItem("isLoggedIn");
        const savedIsAdmin = localStorage.getItem("isAdmin");
        const savedUserName = localStorage.getItem("userName");
        const savedTheme = localStorage.getItem("theme");
        const savedActivity = localStorage.getItem("recentActivity");
        const savedProfile = localStorage.getItem("userProfile");
        const savedNotes = localStorage.getItem("notes");
        const savedEvents = localStorage.getItem("events");
        const savedNotifications = localStorage.getItem("notifications");
        const savedAnnouncements = localStorage.getItem("announcements");
        
        if (savedLogin === "true") setIsLoggedIn(true);
        if (savedIsAdmin === "true") setIsAdmin(true);
        if (savedUserName) setUserName(savedUserName);
        if (savedTheme) setTheme(savedTheme as "light" | "dark");
        
        if (savedActivity) {
          try {
            setRecentActivity(JSON.parse(savedActivity));
          } catch (e) {
            console.warn("Failed to parse recent activity");
          }
        }
        
        if (savedNotes) {
          try {
            setNotes(JSON.parse(savedNotes));
          } catch (e) {
            console.warn("Failed to parse notes");
          }
        }
        
        let loadedEvents = eventsData;
        if (savedEvents) {
          try {
            loadedEvents = JSON.parse(savedEvents);
            setEvents(loadedEvents);
          } catch (e) {
            console.warn("Failed to parse events");
          }
        }
        
        if (savedNotifications) {
          try {
            setNotifications(JSON.parse(savedNotifications));
          } catch (e) {
            console.warn("Failed to parse notifications");
          }
        }
        
        // Fetch events from backend
        try {
          const eventsResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/events`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );
          
          const eventsData = await eventsResponse.json();
          if (eventsData.events) {
            // Merge admin events with local events
            const adminEvents = eventsData.events;
            setEvents(prev => {
              // Keep user-created events and merge with admin events
              const userEvents = prev.filter(e => !e.createdBy || e.createdBy !== 'admin');
              const mergedEvents = [...userEvents, ...adminEvents];
              localStorage.setItem("events", JSON.stringify(mergedEvents));
              console.log(`✅ Synced events: ${mergedEvents.length} total (${adminEvents.length} from admin)`);
              return mergedEvents;
            });
          }
        } catch (error) {
          console.error("Failed to fetch events from backend:", error);
        }

        // Fetch announcements from backend - ALWAYS use backend data
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/announcements`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );
          
          const data = await response.json();
          
          // ALWAYS use backend data, even if empty array
          if (data.announcements !== undefined) {
            // Create a set of existing event IDs for quick lookup
            const eventIds = new Set(loadedEvents.map((event: any) => event.id));
            
            // Filter out orphaned event announcements
            const cleanedAnnouncements = data.announcements.filter((announcement: any) => {
              // If it's an event announcement, check if the event still exists
              if (announcement.id && announcement.id.startsWith('event-announcement-')) {
                const eventId = announcement.id.replace('event-announcement-', '');
                return eventIds.has(eventId);
              }
              // Keep all non-event announcements
              return true;
            });
            
            setAnnouncements(cleanedAnnouncements);
            localStorage.setItem("announcements", JSON.stringify(cleanedAnnouncements));
            
            console.log(`✅ Synced announcements from backend: ${cleanedAnnouncements.length} announcements`);
          } else {
            // Only use fallback if backend response is malformed
            console.warn("Backend returned malformed data, using fallback");
            if (savedAnnouncements) {
              try {
                const loadedAnnouncements = JSON.parse(savedAnnouncements);
                setAnnouncements(loadedAnnouncements);
              } catch (e) {
                setAnnouncements([]);
              }
            } else {
              setAnnouncements([]);
            }
          }
        } catch (error) {
          console.error("Failed to fetch announcements from backend:", error);
          // Clear localStorage on fetch error to prevent stale data
          localStorage.removeItem("announcements");
          setAnnouncements([]);
        }
        
        // Re-authenticate student on refresh if logged in
        if (savedLogin === "true" && savedUserName && !savedIsAdmin) {
          // Try to re-fetch student profile from backend
          if (savedProfile) {
            try {
              const parsedProfile = JSON.parse(savedProfile);
              
              // Verify this profile is still valid by checking backend
              try {
                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/student/login`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`
                    },
                    body: JSON.stringify({ 
                      username: parsedProfile.email,
                      password: 'student123' // Default password for verification
                    })
                  }
                );

                const data = await response.json();
                
                if (data.success && data.student) {
                  // Use fresh data from backend
                  const profile = {
                    name: data.student.name,
                    id: data.student.id,
                    email: data.student.email,
                    phone: data.student.phone,
                    course: data.student.course,
                    semester: data.student.semester,
                    avatar: data.student.avatar || defaultProfilePicture
                  };
                  setUserProfile(profile);
                  setUserName(profile.name);
                  localStorage.setItem("userProfile", JSON.stringify(profile));
                  localStorage.setItem("userName", profile.name);
                  console.log(`Refreshed profile for: ${profile.name}`);
                } else {
                  // Use cached profile if backend fails
                  setUserProfile(parsedProfile);
                  setUserName(parsedProfile.name);
                }
              } catch (error) {
                console.warn("Failed to refresh student profile from backend, using cached");
                setUserProfile(parsedProfile);
                setUserName(parsedProfile.name);
              }
            } catch (e) {
              console.warn("Failed to parse user profile");
              // Logout if profile is corrupted
              setIsLoggedIn(false);
              localStorage.removeItem("isLoggedIn");
              localStorage.removeItem("userProfile");
              localStorage.removeItem("userName");
            }
          }
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
    if (isLoggedIn && userProfile && userProfile.name && userName !== userProfile.name) {
      setUserName(userProfile.name);
    }
  }, [userProfile, isLoggedIn, userName]);

  // Periodic events refresh - sync with backend every 30 seconds
  useEffect(() => {
    if (!isLoggedIn || isAdmin) return;

    const refreshEvents = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/events`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        const data = await response.json();
        
        if (data.events !== undefined) {
          // Merge admin events with user-created events
          setEvents(prev => {
            const userEvents = prev.filter((e: any) => !e.createdBy || e.createdBy !== 'admin');
            const adminEvents = data.events || [];
            const mergedEvents = [...userEvents, ...adminEvents];
            
            const hasChanged = JSON.stringify(prev) !== JSON.stringify(mergedEvents);
            if (hasChanged) {
              localStorage.setItem("events", JSON.stringify(mergedEvents));
              console.log(`🔄 Events refreshed: ${mergedEvents.length} total (${adminEvents.length} from admin)`);
              return mergedEvents;
            }
            return prev;
          });
        }
      } catch (error) {
        console.warn("Failed to refresh events:", error);
      }
    };

    // Refresh immediately
    refreshEvents();

    // Then refresh every 30 seconds
    const interval = setInterval(refreshEvents, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn, isAdmin]);

  // Periodic announcement refresh - sync with backend every 30 seconds
  useEffect(() => {
    if (!isLoggedIn || isAdmin) return;

    const refreshAnnouncements = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/announcements`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        const data = await response.json();
        
        if (data.announcements !== undefined) {
          // Filter out orphaned event announcements
          const eventIds = new Set(events.map((event: any) => event.id));
          const cleanedAnnouncements = data.announcements.filter((announcement: any) => {
            if (announcement.id && announcement.id.startsWith('event-announcement-')) {
              const eventId = announcement.id.replace('event-announcement-', '');
              return eventIds.has(eventId);
            }
            return true;
          });
          
          // Only update if changed to avoid unnecessary re-renders
          setAnnouncements(prev => {
            const hasChanged = JSON.stringify(prev) !== JSON.stringify(cleanedAnnouncements);
            if (hasChanged) {
              localStorage.setItem("announcements", JSON.stringify(cleanedAnnouncements));
              console.log(`🔄 Announcements refreshed: ${cleanedAnnouncements.length} announcements`);
              return cleanedAnnouncements;
            }
            return prev;
          });
        }
      } catch (error) {
        console.warn("Failed to refresh announcements:", error);
      }
    };

    // Refresh immediately
    refreshAnnouncements();

    // Then refresh every 30 seconds
    const interval = setInterval(refreshAnnouncements, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn, isAdmin, events]);

  // Handlers
  const handleLogin = useCallback(async (name: string, password: string, studentData?: any) => {
    if (!studentData) {
      console.error("No student data provided for login");
      return;
    }
    
    // Always use student data from backend - NO DEFAULT PROFILE
    const profile = {
      name: studentData.name,
      id: studentData.id,
      email: studentData.email,
      phone: studentData.phone,
      course: studentData.course,
      semester: studentData.semester,
      avatar: studentData.avatar || defaultProfilePicture
    };
    
    console.log(`Logging in as: ${profile.name} (${profile.id})`);
    
    setUserName(profile.name);
    setUserProfile(profile);
    setIsLoggedIn(true);
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", profile.name);
    localStorage.setItem("userProfile", JSON.stringify(profile));

    // Immediately fetch courses after login
    try {
      const coursesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/courses`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (coursesResponse.ok) {
        const backendData = await coursesResponse.json();
        if (backendData.courses && backendData.courses.length > 0) {
          // Merge backend courses with hardcoded courses
          const backendCourseIds = new Set(backendData.courses.map((c: any) => c.id));
          const hardcodedCoursesFiltered = coursesData.filter((c: any) => !backendCourseIds.has(c.id));
          const allCourses = [...backendData.courses, ...hardcodedCoursesFiltered];
          
          setCourses(allCourses);
          console.log(`✅ Student logged in - Loaded ${allCourses.length} courses (${backendData.courses.length} from backend, ${hardcodedCoursesFiltered.length} hardcoded)`);
        } else {
          console.log('Backend empty, using hardcoded courses');
        }
      }
    } catch (error: any) {
      console.debug("Could not fetch courses from backend:", error.message);
    }
  }, []);

  const handleAdminLogin = useCallback((username: string) => {
    setIsLoggedIn(true);
    setIsAdmin(true);
    setUserName(username);
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("userName", username);
  }, []);

  const handleLogout = useCallback(() => {
    console.log("Logging out...");
    
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName("");
    setUserProfile(null);
    setActiveTab("dashboard");
    setShowAdminLogin(false);
    
    // Clear all auth-related localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
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

    setRecentActivity(prev => {
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
    // Check if it's an announcement
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
      trackActivity({
        id: `announcement-${id}`,
        title: announcement.title,
        type: 'announcement',
        icon: 'Bell'
      });
      const updatedAnnouncements = announcements.map(ann => 
        ann.id === id ? { ...ann, read: true } : ann
      );
      setAnnouncements(updatedAnnouncements);
      localStorage.setItem("announcements", JSON.stringify(updatedAnnouncements));
    }
    
    // Check if it's a notification
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      trackActivity({
        id: `notification-${id}`,
        title: notification.title || notification.message,
        type: 'notification',
        icon: 'Bell'
      });
      const updatedNotifications = notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    }
  };

  const handleNotesChange = useCallback((updatedNotes: any[]) => {
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  }, []);

  const handleNoteSave = useCallback((updatedNote: any) => {
    console.log(`💾 Saving note: ${updatedNote.title}`, updatedNote);
    
    setNotes(prev => {
      const updated = prev.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      );
      localStorage.setItem("notes", JSON.stringify(updated));
      console.log(`✅ Note saved to localStorage with ${updatedNote.attachments?.length || 0} attachments`);
      return updated;
    });
    
    // Update selectedNote if it's the same note
    if (selectedNote && selectedNote.id === updatedNote.id) {
      setSelectedNote(updatedNote);
    }
  }, [selectedNote]);

  const handleNoteToggleFavorite = useCallback((noteId: string) => {
    setNotes(prev => {
      const updated = prev.map(note => 
        note.id === noteId ? { ...note, favorite: !note.favorite } : note
      );
      localStorage.setItem("notes", JSON.stringify(updated));
      return updated;
    });
    
    // Update selectedNote if it's the same note
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, favorite: !prev.favorite } : prev);
    }
  }, [selectedNote]);

  const handleEventsChange = useCallback((updatedEvents: any[]) => {
    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));
  }, []);

  const handleNotificationAdd = useCallback((notification: any) => {
    const newNotification = {
      ...notification,
      id: notification.id || `notif-${Date.now()}`,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });

    // Also add to announcements if it's an event
    if (notification.type === 'event' && notification.eventData) {
      const eventDate = new Date(notification.eventData.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      const eventAnnouncement = {
        id: `event-announcement-${notification.eventData.id}`,
        title: `New Event: ${notification.eventData.title}`,
        content: `${notification.eventData.title} scheduled for ${formattedDate}${notification.eventData.time ? ' at ' + notification.eventData.time : ''}${notification.eventData.location ? ' - ' + notification.eventData.location : ''}`,
        time: "just now",
        priority: 'medium' as const,
        category: notification.eventData.type === 'exam' ? 'Academic' : 
                  notification.eventData.type === 'assignment' || notification.eventData.type === 'deadline' ? 'Academic' :
                  notification.eventData.type === 'class' ? 'Academic' :
                  'Events',
        read: false
      };
      
      setAnnouncements(prev => {
        const updated = [eventAnnouncement, ...prev];
        localStorage.setItem("announcements", JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  const handleAnnouncementRemove = useCallback((announcementId: string) => {
    setAnnouncements(prev => {
      const updated = prev.filter(ann => ann.id !== announcementId);
      localStorage.setItem("announcements", JSON.stringify(updated));
      return updated;
    });
  }, []);

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

  // If logged in but no profile, force re-login
  if (isLoggedIn && !isAdmin && !userProfile) {
    console.warn("Logged in but no profile found, forcing re-login");
    handleLogout();
    return null;
  }

  // Show admin dashboard if logged in as admin
  if (isLoggedIn && isAdmin) {
    return <AdminDashboard onLogout={handleLogout} adminUsername={userName} />;
  }

  // Show admin login if selected
  if (!isLoggedIn && showAdminLogin) {
    return (
      <AdminLoginPage
        onLogin={handleAdminLogin}
        onSwitchToStudent={() => setShowAdminLogin(false)}
      />
    );
  }

  // Show student login if not logged in
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToAdmin={() => setShowAdminLogin(true)}
      />
    );
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
    userProfile: userProfile || { name: "Guest", id: "", email: "", phone: "", course: "", semester: "", avatar: defaultProfilePicture },
    courses,
    notes: notes,
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
              handleNoteSave(updatedNote);
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
            onToggleFavorite={handleNoteToggleFavorite}
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
                    userName={userName || "Guest"} 
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
                <NotesPage 
                  courses={courses} 
                  notes={notes}
                  onNoteClick={handleNoteClick}
                  onNotesChange={handleNotesChange}
                />
              </Suspense>
            )}

            {activeTab === "calendar" && (
              <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-university-primary rounded-full"></div></div>}>
                <CalendarPage 
                  events={events} 
                  onEventsChange={handleEventsChange} 
                  courses={courses}
                  onEventClick={(event) => trackActivity({
                    id: `event-${event.id}`,
                    title: event.title,
                    type: 'calendar',
                    icon: 'Calendar'
                  })}
                  onNotificationAdd={handleNotificationAdd}
                  onAnnouncementRemove={handleAnnouncementRemove}
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
        userName={userName || "Guest"}
        userProfile={userProfile || { name: userName || "Guest", id: "", email: "", phone: "", course: "", semester: "", avatar: defaultProfilePicture }}
        announcements={announcements}
        notes={notes}
        libraryItems={[]}
      />
      
      {/* Dialogs */}
      {userProfile && (
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
      )}
      
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
