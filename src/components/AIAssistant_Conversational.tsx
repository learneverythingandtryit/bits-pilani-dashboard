import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Plus, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface AIAssistantProps {
  events?: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    type: string;
    description?: string;
    course?: string;
    location?: string;
  }>;
  courses?: Array<{
    id: string;
    title: string;
    code: string;
    semester: number;
    status: "ongoing" | "completed" | "upcoming";
    progress?: number;
    grades: {
      assignmentQuiz: number | null;
      midSemester: number | null;
      comprehensive: number | null;
      total: number | null;
      finalGrade: string | null;
    };
  }>;
  userName?: string;
  userProfile?: {
    name: string;
    id: string;
    email: string;
    phone: string;
    course: string;
    semester: string;
    avatar?: string;
  };
  announcements?: Array<{
    id: string;
    title: string;
    content: string;
    time: string;
    priority: string;
    category: string;
    read: boolean;
  }>;
  notes?: Array<{
    id: string;
    title: string;
    content: string;
    course: string;
    tags: string;
    createdAt: string;
    lastModified: string;
    favorite: boolean;
    attachments?: Array<{
      id: string;
      name: string;
      type: string;
      size: number;
      url: string;
      uploadDate: string;
    }>;
  }>;
  libraryItems?: Array<{
    id: string;
    title: string;
    type: string;
    course: string;
    fileType: string;
    size: string;
    uploadDate: string;
  }>;
}

export function AIAssistant({ 
  events = [], 
  courses = [], 
  userName = "Student", 
  userProfile,
  announcements = [],
  notes = [],
  libraryItems = []
}: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(() => {
    const displayName = userProfile?.name || userName;
    return [{
      id: "initial-1",
      type: "assistant",
      content: `Hi ${displayName}! 👋 How can I help you today?`,
      timestamp: "Just now"
    }];
  });
  
  // Ticket form state
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCourse, setTicketCourse] = useState("");
  const [ticketCategory, setTicketCategory] = useState("general");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Find course mentioned in message
  const findCourse = (msg: string) => {
    const lower = msg.toLowerCase();
    for (const course of courses) {
      const title = course.title.toLowerCase();
      const code = course.code.toLowerCase();
      
      if (lower.includes(title) || lower.includes(code)) {
        return course;
      }
      
      // Check word matches
      const words = title.split(' ');
      for (const word of words) {
        if (word.length > 4 && lower.includes(word)) {
          return course;
        }
      }
    }
    return null;
  };

  // Check if out of scope
  const isOutOfScope = (msg: string) => {
    const lower = msg.toLowerCase();
    if (/\d+\s*[\+\-\*\/×÷]\s*\d+/.test(lower)) return true;
    if (/who is|capital of|world history|windows|mac|iphone|android/.test(lower)) return true;
    if (/movie|song|music|game/.test(lower)) return true;
    return false;
  };

  // Create support ticket (used by chat detection)
  const createTicket = async (issue: string, course?: any) => {
    try {
      const ticketData = {
        studentId: userProfile?.id || 'unknown',
        studentName: userProfile?.name || userName || 'Student',
        studentEmail: userProfile?.email || 'unknown@email.com',
        courseId: course?.id,
        courseName: course?.title,
        subject: course ? `Issue with ${course.title}` : 'General Support Request',
        description: issue,
        category: /grade|mark/.test(issue.toLowerCase()) ? 'grades' : 
                  /content|material|slide/.test(issue.toLowerCase()) ? 'content' : 
                  /technical|not working|error/.test(issue.toLowerCase()) ? 'technical' : 'general',
        priority: 'medium'
      };

      const response = await fetch(
        `https://${(await import('../utils/supabase/info')).projectId}.supabase.co/functions/v1/make-server-917daa5d/tickets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await import('../utils/supabase/info')).publicAnonKey}`
          },
          body: JSON.stringify(ticketData)
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ticket created:', data.ticket.id);
        return data.ticket;
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
    return null;
  };

  // Handle ticket form submission
  const handleTicketSubmit = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      return;
    }

    setIsSubmittingTicket(true);

    try {
      const selectedCourse = ticketCourse ? courses.find(c => c.id === ticketCourse) : undefined;
      
      const ticketData = {
        studentId: userProfile?.id || 'unknown',
        studentName: userProfile?.name || userName || 'Student',
        studentEmail: userProfile?.email || 'unknown@email.com',
        courseId: selectedCourse?.id,
        courseName: selectedCourse?.title,
        subject: ticketSubject,
        description: ticketDescription,
        category: ticketCategory as 'grades' | 'content' | 'technical' | 'general',
        priority: ticketPriority as 'low' | 'medium' | 'high'
      };

      const response = await fetch(
        `https://${(await import('../utils/supabase/info')).projectId}.supabase.co/functions/v1/make-server-917daa5d/tickets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await import('../utils/supabase/info')).publicAnonKey}`
          },
          body: JSON.stringify(ticketData)
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ticket created via form:', data.ticket.id);
        
        // Add confirmation message to chat
        const ticketId = data.ticket.id;
        const newMessage = {
          id: Date.now().toString(),
          type: "assistant",
          content: `✅ Ticket #${ticketId} created successfully!\n\n**Subject:** ${ticketSubject}\n**Status:** Open\n\nA staff member will review your ticket and respond soon. You'll receive a notification when they reply.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Reset form and close dialog
        setTicketSubject("");
        setTicketDescription("");
        setTicketCourse("");
        setTicketCategory("general");
        setTicketPriority("medium");
        setShowTicketForm(false);
      } else {
        // Show error message
        const errorMessage = {
          id: Date.now().toString(),
          type: "assistant",
          content: "❌ Failed to create ticket. Please try again or contact support.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      const errorMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content: "❌ Failed to create ticket. Please try again or contact support.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Generate response
  const generateResponse = async (userMessage: string) => {
    const lower = userMessage.toLowerCase().trim();
    const name = userProfile?.name || userName;
    
    // Out of scope
    if (isOutOfScope(lower)) {
      return "I'll forward this to a tutor who can help you better. Meanwhile, I can help with courses, grades, schedule, or notes. What would you like to know?";
    }

    // Thank you
    if (/thank|thanks/.test(lower)) {
      return `You're welcome, ${name}! 😊 Happy to help anytime!`;
    }

    // Greetings
    if (/^(hi|hello|hey)/.test(lower)) {
      return `Hello! What would you like to know about?`;
    }

    // Help
    if (/help|what can/.test(lower)) {
      return "I can help you with grades, courses, schedule, notes, and announcements. What do you need?";
    }

    const course = findCourse(userMessage);
    
    // Detect support issues - marks not updated, validation needed
    const isSupportIssue = /not updated|not showing|wrong|incorrect|missing|validate|check with staff|issue|problem|error/.test(lower);
    
    if (isSupportIssue && course) {
      // Create ticket for course-specific issue
      const ticket = await createTicket(userMessage, course);
      if (ticket) {
        return `I've created a support ticket (#${ticket.id}) for ${course.title}.\n\nA staff member will review your concern and respond soon. You'll receive a notification when they reply.\n\nAnything else I can help with?`;
      }
      return `I'll create a support ticket for ${course.title} and forward your concern to staff. They'll get back to you soon.\n\nWhat else can I help with?`;
    }
    
    if (isSupportIssue && !course) {
      // General support issue
      const ticket = await createTicket(userMessage);
      if (ticket) {
        return `I've created a support ticket (#${ticket.id}) for your concern.\n\nStaff will review it and respond soon. You'll be notified when they reply.\n\nAnything else?`;
      }
      return "I'll create a support ticket and forward your concern to staff. They'll get back to you soon.\n\nWhat else can I help with?";
    }

    // Grades for specific course
    if (/grade|mark|score|result/.test(lower) && course) {
      if (course.status === 'completed' && course.grades.finalGrade) {
        return `${course.title}: Grade ${course.grades.finalGrade} (${course.grades.total}/100)\n\nNeed anything else?`;
      }
      if (course.status === 'ongoing') {
        return `${course.title} is ongoing. Current progress: ${course.progress}%\n\nGrades available after completion. Check Courses tab for details.`;
      }
      return `${course.title} starts in Semester ${course.semester}.`;
    }

    // General grades
    if (/grade|mark|score|performance/.test(lower)) {
      const completed = courses.filter(c => c.status === 'completed' && c.grades.finalGrade);
      if (completed.length === 0) {
        return "No final grades yet. You're currently working on ongoing courses. Which course would you like to check?";
      }
      const list = completed.slice(0, 3).map((c, i) => `${i + 1}. ${c.title}: ${c.grades.finalGrade}`).join('\n');
      return `Your grades:\n${list}\n\nView all in Dashboard → Completed Courses`;
    }

    // Schedule queries
    if (/today|tomorrow|week|due|deadline/.test(lower)) {
      const today = new Date().toISOString().split('T')[0];
      let filtered = [];
      
      if (lower.includes('today')) {
        filtered = events.filter(e => e.date === today);
        if (filtered.length === 0) return "Nothing due today! 🎉";
        const list = filtered.slice(0, 3).map((e, i) => `${i + 1}. ${e.title} at ${e.time}`).join('\n');
        return `Today:\n${list}\n\nCheck Calendar tab for more.`;
      }
      
      if (lower.includes('week')) {
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + 7);
        filtered = events.filter(e => new Date(e.date) <= weekEnd);
        if (filtered.length === 0) return "Clear week ahead!";
        const list = filtered.slice(0, 3).map((e, i) => `${i + 1}. ${e.title}`).join('\n');
        return `This week:\n${list}\n\nView full schedule in Calendar tab.`;
      }
      
      return "Check the Calendar tab for your schedule. What else can I help with?";
    }

    // Current courses
    if (/current|enrolled|taking|my course/.test(lower)) {
      const ongoing = courses.filter(c => c.status === 'ongoing');
      if (ongoing.length === 0) return "No ongoing courses right now.";
      const list = ongoing.slice(0, 4).map((c, i) => `${i + 1}. ${c.title}`).join('\n');
      return `Your courses:\n${list}\n\nClick any in Courses tab for details.`;
    }

    // Course details
    if (/about|details|info/.test(lower) && course) {
      const status = course.status === 'ongoing' ? 'Ongoing' : course.status === 'completed' ? 'Completed' : 'Upcoming';
      return `${course.title} (${course.code})\nStatus: ${status}\n\nFind materials in Courses tab → ${course.title}`;
    }

    // Notes
    if (/note|material|find|search/.test(lower)) {
      if (course) {
        const courseNotes = notes.filter(n => n.course.toLowerCase().includes(course.title.toLowerCase()));
        if (courseNotes.length === 0) return `No notes for ${course.title} yet. Create one in Notes tab!`;
        const list = courseNotes.slice(0, 3).map((n, i) => `${i + 1}. ${n.title}`).join('\n');
        return `Notes for ${course.title}:\n${list}\n\nCheck Notes tab for all.`;
      }
      if (notes.length === 0) return "No notes yet. Create your first note in the Notes tab!";
      const list = notes.slice(0, 3).map((n, i) => `${i + 1}. ${n.title}`).join('\n');
      return `Your notes:\n${list}\n\nView all in Notes tab.`;
    }

    // Announcements
    if (/announcement|news|update|notice/.test(lower)) {
      if (announcements.length === 0) return "No new announcements. All caught up! ✅";
      const unread = announcements.filter(a => !a.read).length;
      const latest = announcements.slice(0, 2).map((a, i) => `${i + 1}. ${a.title}`).join('\n');
      return `${unread > 0 ? `${unread} unread` : 'Latest'} announcements:\n${latest}\n\nClick 🔔 bell icon for all.`;
    }

    // Navigation
    if (/where|how do i|how to/.test(lower)) {
      if (/login/.test(lower)) {
        return "Login page → Enter your BITS email and password. Having trouble?";
      }
      if (/calendar/.test(lower)) {
        return "Calendar tab in left sidebar → View all events and deadlines.";
      }
      if (/course|material/.test(lower)) {
        return "Courses tab → Click any course → See all materials, slides, quizzes.";
      }
      if (/grade/.test(lower)) {
        return "Dashboard → Completed Courses card → View all your grades.";
      }
      return "Which section are you looking for? (Courses, Calendar, Notes, etc)";
    }

    // Default
    return "Could you be more specific? Try asking:\n• \"My grades for [course name]\"\n• \"What's due today?\"\n• \"Show my courses\"\n• \"Any announcements?\"";
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setMessage("");

    // Generate response asynchronously
    const responseContent = await generateResponse(userMsg.content);
    
    const botMsg = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: responseContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMsg]);
  };

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40"
          >
            <Card className="w-80 sm:w-96 h-[500px] sm:h-[550px] flex flex-col shadow-2xl border-university-border bg-white">
              {/* Header */}
              <div className="p-3 sm:p-4 rounded-t-lg" style={{ backgroundColor: 'rgb(25, 35, 94)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-white">BITS Assistant</h3>
                      <p className="text-xs text-white opacity-90">Always here to help</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(false)}
                    className="text-white hover:bg-white/20 rounded-lg w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[85%] p-2 sm:p-3 rounded-lg"
                      style={msg.type === "user" 
                        ? { backgroundColor: 'rgb(25, 35, 94)' }
                        : { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }
                      }
                    >
                      <p 
                        className="text-xs sm:text-sm leading-relaxed whitespace-pre-line"
                        style={{ color: msg.type === "user" ? '#ffffff' : '#1f2937' }}
                      >
                        {msg.content}
                      </p>
                      <p 
                        className="text-xs mt-1"
                        style={{ color: msg.type === "user" ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)' }}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 bg-white" style={{ borderTop: '1px solid #e2e8f0' }}>
                {/* Create Ticket Button */}
                <div className="mb-3">
                  <Button
                    onClick={() => setShowTicketForm(true)}
                    variant="outline"
                    className="w-full rounded-lg text-xs sm:text-sm border-[rgb(25,35,94)] text-[rgb(25,35,94)] hover:bg-[rgb(25,35,94)] hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Support Ticket
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 rounded-lg text-xs sm:text-sm border-gray-300 focus:border-[rgb(25,35,94)] focus:ring-[rgb(25,35,94)]"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="rounded-lg px-3 text-white"
                    style={{ backgroundColor: 'rgb(25, 35, 94)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(20, 28, 75)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(25, 35, 94)'}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg relative text-white"
            style={{ backgroundColor: 'rgb(25, 35, 94)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(20, 28, 75)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(25, 35, 94)'}
          >
            {isExpanded ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <>
                <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
                <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 p-0 text-white text-xs flex items-center justify-center rounded-full" style={{ backgroundColor: '#10b981' }}>
                  AI
                </Badge>
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={showTicketForm} onOpenChange={setShowTicketForm}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-university-primary dark:text-blue-400">
              <AlertCircle className="w-5 h-5" />
              Create Support Ticket
            </DialogTitle>
            <DialogDescription className="dark:text-slate-300">
              Submit a support request to staff. You'll be notified when they respond.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="ticket-subject" className="dark:text-white">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ticket-subject"
                placeholder="Brief description of your issue"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
              />
            </div>

            {/* Course (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="ticket-course" className="dark:text-white">
                Related Course (Optional)
              </Label>
              <Select value={ticketCourse} onValueChange={setTicketCourse}>
                <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                  <SelectItem value="none">No specific course</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="ticket-category" className="dark:text-white">
                Category
              </Label>
              <Select value={ticketCategory} onValueChange={setTicketCategory}>
                <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="grades">Grades/Marks</SelectItem>
                  <SelectItem value="content">Course Content</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="ticket-priority" className="dark:text-white">
                Priority
              </Label>
              <Select value={ticketPriority} onValueChange={setTicketPriority}>
                <SelectTrigger className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="ticket-description" className="dark:text-white">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="ticket-description"
                placeholder="Provide detailed information about your issue..."
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                rows={4}
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowTicketForm(false);
                setTicketSubject("");
                setTicketDescription("");
                setTicketCourse("");
                setTicketCategory("general");
                setTicketPriority("medium");
              }}
              disabled={isSubmittingTicket}
              className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTicketSubmit}
              disabled={!ticketSubject.trim() || !ticketDescription.trim() || isSubmittingTicket}
              className="text-white"
              style={{ backgroundColor: 'rgb(25, 35, 94)' }}
              onMouseEnter={(e) => !isSubmittingTicket && (e.currentTarget.style.backgroundColor = 'rgb(20, 28, 75)')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(25, 35, 94)'}
            >
              {isSubmittingTicket ? "Creating..." : "Create Ticket"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
