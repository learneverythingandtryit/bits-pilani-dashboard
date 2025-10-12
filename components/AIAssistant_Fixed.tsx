import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Cpu } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";

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
    files?: Array<{
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
    return [{
      id: "initial-1",
      type: "assistant",
      content: `Hello! I'm BITS-Bot, your intelligent academic assistant. How can I help you today?`,
      timestamp: "Just now"
    }];
  });

  useEffect(() => {
    const getInitialDisplayName = () => {
      if (userProfile?.name && userProfile.name.trim() && userProfile.name !== "Student") {
        return userProfile.name.trim();
      }
      if (userName && userName.trim() && userName !== "Student") {
        return userName.trim();
      }
      return null;
    };

    const displayName = getInitialDisplayName();
    
    if (displayName) {
      setMessages([
        {
          id: "initial-1",
          type: "assistant",
          content: `Hello ${displayName}! I'm BITS-Bot, your intelligent academic assistant. How can I help you today?`,
          timestamp: "Just now"
        }
      ]);
    }
  }, [userName, userProfile?.name]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const getDisplayName = () => {
      if (userProfile?.name && userProfile.name.trim() && userProfile.name !== "Student") {
        return userProfile.name.trim();
      }
      if (userName && userName.trim() && userName !== "Student") {
        return userName.trim();
      }
      return "Student";
    };

    // Enhanced keyword detection - more flexible
    const containsAny = (text: string, keywords: string[]) => {
      return keywords.some(keyword => text.includes(keyword));
    };

    // Comprehensive question analysis
    const isGreeting = containsAny(lowerMessage, ['hi', 'hello', 'hey', 'morning', 'afternoon', 'evening', 'greetings']);
    const isPersonalInfo = containsAny(lowerMessage, ['my name', 'who am i', 'my profile', 'about me', 'profile']);
    const isCourseQuery = containsAny(lowerMessage, ['course', 'subject', 'class', 'semester', 'study', 'studying']);
    const isGradeQuery = containsAny(lowerMessage, ['grade', 'mark', 'score', 'result', 'performance', 'progress']);
    const isEventQuery = containsAny(lowerMessage, ['event', 'schedule', 'deadline', 'today', 'tomorrow', 'week', 'due']);
    const isAnnouncementQuery = containsAny(lowerMessage, ['announcement', 'news', 'notification', 'update', 'notice']);
    const isNoteQuery = containsAny(lowerMessage, ['note', 'notes', 'search', 'find']);
    const isHelpQuery = containsAny(lowerMessage, ['help', 'what can you', 'how can you', 'assist']);
    
    // Greetings
    if (isGreeting) {
      const displayName = getDisplayName();
      const greetings = [
        `Hello ${displayName}! Great to see you here. I'm ready to help with your academic needs!`,
        `Hi there ${displayName}! How can I assist you with your BITS Pilani studies today?`,
        `Hey ${displayName}! I'm here to help with courses, grades, notes, schedules - anything you need!`,
        `Good to see you ${displayName}! What would you like to know about your academic progress?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Help queries
    if (isHelpQuery) {
      return `Absolutely! I'm here to help with your BITS Pilani studies. 🎓

**Here's what I can do for you:**

📚 **Academic Info:**
• Show your course progress and details
• Check your grades and performance
• Track assignment deadlines

📅 **Schedule & Events:**
• Today's events and deadlines
• Upcoming exams and assignments
• Weekly schedule overview

📝 **Study Materials:**
• Find your notes by topic or course
• Search through study materials
• Organize your academic content

📢 **Updates & News:**
• Latest announcements
• Important notifications
• University updates

💡 **Study Support:**
• Study tips and advice
• Academic guidance
• Progress tracking

Just ask me anything like "What's due today?" or "Show my current courses" and I'll help you out!`;
    }

    // Personal information
    if (isPersonalInfo) {
      const displayName = getDisplayName();
      return `**YOUR PROFILE:**

👤 **Name:** ${userProfile?.name || displayName}
🎓 **Course:** ${userProfile?.course || 'Computer Science'}
📧 **Email:** ${userProfile?.email || 'Not set'}
📱 **Phone:** ${userProfile?.phone || 'Not set'}
📚 **Current Semester:** ${userProfile?.semester || 'Not specified'}

Need to update any of this information? You can edit your profile anytime!`;
    }

    // Course queries
    if (isCourseQuery) {
      const ongoing = courses.filter(c => c.status === 'ongoing').length;
      const completed = courses.filter(c => c.status === 'completed').length;
      const upcoming = courses.filter(c => c.status === 'upcoming').length;
      
      if (lowerMessage.includes('current') || lowerMessage.includes('ongoing')) {
        const ongoingCourses = courses.filter(c => c.status === 'ongoing');
        if (ongoingCourses.length === 0) {
          return "You don't have any ongoing courses right now. 🤔\n\nWant me to check your upcoming courses for next semester instead?";
        }
        
        let response = `You're currently taking ${ongoingCourses.length} courses:\n\n`;
        ongoingCourses.forEach((course, index) => {
          response += `${index + 1}. ${course.title} (${course.progress || 0}%)\n`;
        });
        response += "\nWant details about any specific course?";
        return response;
      }
      
      return `I can help you with your courses! Here's your overview:

📚 Currently studying: ${ongoing} course${ongoing !== 1 ? 's' : ''}
✅ Completed: ${completed} course${completed !== 1 ? 's' : ''}
⏳ Upcoming: ${upcoming} course${upcoming !== 1 ? 's' : ''}

What would you like to know more about?

🔹 **Current courses** progress
🔹 **Completed courses** and grades
🔹 **Upcoming courses** for next semester

Just ask!`;
    }

    // Grade queries
    if (isGradeQuery) {
      const completedCourses = courses.filter(c => c.status === 'completed' && c.grades.finalGrade && c.grades.finalGrade !== 'N/A');
      
      if (completedCourses.length === 0) {
        return "You don't have any final grades yet - you're still working on your current courses! 💪\n\nOnce you complete your ongoing courses, I'll be able to show you your results. Keep up the great work!";
      }

      const excellentGrades = completedCourses.filter(c => ['A', 'A+', 'A-'].includes(c.grades.finalGrade || '')).length;
      
      let response = "";
      if (excellentGrades > 0) {
        response += `Excellent work! 🌟 You've earned ${excellentGrades} A-grade${excellentGrades > 1 ? 's' : ''} so far.\n\n`;
      } else {
        response += `You've completed ${completedCourses.length} course${completedCourses.length > 1 ? 's' : ''}! 📚\n\n`;
      }
      
      response += `You've completed ${completedCourses.length} out of ${courses.length} total courses.\n\nWould you like to see grades for a specific course or need study tips for your current ones?`;
      return response;
    }

    // Event queries
    if (isEventQuery) {
      if (lowerMessage.includes('today')) {
        const todayEvents = events.filter(event => event.date === todayStr);
        if (todayEvents.length === 0) {
          return "You have a free day today! 🎉 No scheduled events. Perfect time to catch up on studies or work on assignments.\n\nWould you like me to show you what's coming up this week instead?";
        }
        
        let response = `You have ${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} today:\n\n`;
        todayEvents.slice(0, 3).forEach((event, index) => {
          const typeIcon = event.type === 'exam' ? '📝' : event.type === 'assignment' ? '📋' : '📅';
          response += `${index + 1}. ${typeIcon} ${event.title} at ${event.time}\n`;
        });
        
        return response;
      }
      
      const upcomingCount = events.filter(event => new Date(event.date) >= today).length;
      return `I can help you with your schedule! You have ${upcomingCount} upcoming events.\n\nWhat specifically would you like to know about?\n\n🗓️ **Today's events**\n📅 **This week's schedule**\n📝 **Upcoming exams**\n📋 **Assignment deadlines**\n\nJust ask me about any of these!`;
    }

    // Announcement queries
    if (isAnnouncementQuery) {
      if (announcements.length === 0) {
        return "All quiet on the announcements front! 📢\n\nNo new announcements right now. I'll let you know as soon as something important comes up!";
      }

      const unreadCount = announcements.filter(a => !a.read).length;
      const latestAnnouncement = announcements[0];
      
      let response = "";
      if (unreadCount > 0) {
        response += `You have ${unreadCount} unread announcement${unreadCount > 1 ? 's' : ''}!\n\n`;
      }
      
      response += `**Latest update:** ${latestAnnouncement.title}\n📅 ${latestAnnouncement.time}\n\n`;
      response += "Would you like me to read the full announcement or show you all unread ones?";
      
      return response;
    }

    // Note queries
    if (isNoteQuery) {
      if (notes.length > 0) {
        const favoriteCount = notes.filter(n => n.favorite).length;
        
        let response = `You have ${notes.length} note${notes.length > 1 ? 's' : ''} in your collection! 📚\n\n`;
        
        if (favoriteCount > 0) {
          response += `⭐ ${favoriteCount} favorite${favoriteCount > 1 ? 's' : ''}\n`;
        }
        
        response += "**Your recent notes:**\n";
        notes.slice(0, 3).forEach((note, index) => {
          const favoriteIcon = note.favorite ? '⭐ ' : '';
          response += `${index + 1}. ${favoriteIcon}${note.title}\n`;
        });
        
        response += "\nWant me to help you find something specific? Just tell me what you're looking for!";
        return response;
      }

      return `You haven't created any notes yet, but I can help you get started! 📝\n\nYou can create notes for:\n• Lecture summaries\n• Assignment details\n• Study materials\n• Important reminders\n\nWant some tips on effective note-taking?`;
    }

    // Question type fallback
    if (lowerMessage.includes('?')) {
      return `Great question! 🤔 I want to give you the most helpful answer.

Here are some ways I can assist you:

🔍 **Search & Find:**
• "Find my notes about databases"
• "What assignments are due?"
• "Show me upcoming events"

📊 **Academic Status:**
• "How are my grades?"
• "What courses am I taking?"
• "What's my progress?"

📅 **Schedule Info:**
• "What's happening today?"
• "What's due this week?"
• "When is my next exam?"

Could you try rephrasing your question using one of these formats? I'm here to help! 😊`;
    }

    // Intelligent default responses
    const displayName = getDisplayName();
    const helpfulResponses = [
      `I'd love to help you, ${displayName}! 😊 I have access to all your BITS Pilani academic information.

**Try asking me:**
• "What courses am I taking?"
• "What's due today?"
• "Show my grades"
• "Any new announcements?"
• "Find my notes about..."

What would you like to know?`,
      
      `Hi ${displayName}! I'm your AI study assistant. 🤖

**I can help you with:**
📚 Course information and progress
📅 Schedule and deadlines
📝 Finding your notes and materials
📢 Latest announcements
📊 Academic performance

What can I help you with today?`,
      
      `Ready to assist with your studies, ${displayName}! 🎓

**Popular requests:**
🗓️ "What's happening today?"
📈 "How am I doing in my courses?"
🔍 "Find notes about algorithms"
📱 "Any important updates?"
💡 "Give me study tips"

Feel free to ask me anything about your academic life!`
    ];
    
    return helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const aiResponse = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: generateAIResponse(message),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage, aiResponse]);
    setMessage("");
  };

  return (
    <>
      {/* Chat Window */}
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
              <div className="bg-university-primary text-white p-3 sm:p-4 rounded-t-lg relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center relative">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        BITS-Bot 
                        <Cpu className="w-3 h-3 sm:w-4 sm:h-4" />
                      </h3>
                      <p className="text-xs sm:text-sm opacity-90 text-[rgba(244,245,248,1)]">AI Assistant</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(false)}
                    className="text-white hover:bg-white/20 rounded-lg w-8 h-8 sm:w-auto sm:h-auto"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 bg-gray-50/30">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-2 sm:p-3 rounded-lg ${
                        msg.type === "user"
                          ? "bg-university-primary text-white"
                          : "bg-white border border-university-border text-gray-800 shadow-sm"
                      }`}
                    >
                      <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        msg.type === "user" ? "text-white" : "text-gray-800"
                      }`}>{msg.content}</p>
                      <p className={`text-xs mt-1 sm:mt-2 opacity-70 ${
                        msg.type === "user" ? "text-white" : "text-gray-600"
                      }`}>{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-university-border bg-white">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about courses, grades, events, notes..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 rounded-lg text-xs sm:text-sm border-university-border focus:border-university-primary focus:ring-2 focus:ring-university-primary/20"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="bg-university-primary hover:bg-university-secondary rounded-lg px-2 sm:px-3"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-university-primary hover:bg-university-secondary shadow-lg transition-all duration-300 relative"
          >
            {isExpanded ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <>
                <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
                <Badge className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 p-0 bg-green-500 text-white text-xs flex items-center justify-center rounded-full">
                  AI
                </Badge>
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </>
  );
}