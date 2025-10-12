import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Cpu } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

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
    // Initialize with a generic greeting first
    return [{
      id: "initial-1",
      type: "assistant",
      content: `Hello! I'm BITS-Bot, your intelligent academic assistant. How can I help you today?`,
      timestamp: "Just now"
    }];
  });

  useEffect(() => {
    // Get the proper display name for the initial greeting
    const getInitialDisplayName = () => {
      // Prioritize userProfile.name first, then userName
      if (userProfile?.name && userProfile.name.trim() && userProfile.name !== "Student") {
        return userProfile.name.trim();
      }
      if (userName && userName.trim() && userName !== "Student") {
        return userName.trim();
      }
      return null;
    };

    const displayName = getInitialDisplayName();
    
    // Only update if we have a valid display name
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
    
    // Get the proper display name - prioritize userProfile.name, then userName, then fallback
    const getDisplayName = () => {
      // First priority: userProfile.name (this should be "HARI HARA SUDHAN")
      if (userProfile?.name && userProfile.name.trim() && userProfile.name !== "Student") {
        return userProfile.name.trim();
      }
      // Second priority: userName 
      if (userName && userName.trim() && userName !== "Student") {
        return userName.trim();
      }
      // Fallback
      return "Student";
    };

    // Enhanced keyword detection
    const containsWords = (text: string, words: string[]) => {
      return words.some(word => text.includes(word));
    };

    // Question analysis
    const isGreeting = containsWords(lowerMessage, ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'sup', 'what\'s up']);
    const isPersonalInfo = containsWords(lowerMessage, ['my name', 'who am i', 'my profile', 'about me', 'my info', 'my details', 'profile']);
    const isCourseQuery = containsWords(lowerMessage, ['course', 'subject', 'class', 'semester', 'study', 'studying', 'taking', 'enrolled']);
    const isGradeQuery = containsWords(lowerMessage, ['grade', 'mark', 'score', 'result', 'performance', 'gpa', 'exam result', 'how am i doing', 'progress']);
    const isEventQuery = containsWords(lowerMessage, ['event', 'schedule', 'deadline', 'upcoming', 'today', 'tomorrow', 'this week', 'when', 'due', 'exam']);
    const isAnnouncementQuery = containsWords(lowerMessage, ['announcement', 'news', 'notification', 'update', 'notice', 'important']);
    const isNoteQuery = containsWords(lowerMessage, ['note', 'notes', 'search', 'find', 'look for', 'looking for']);
    const isGeneralQuestion = containsWords(lowerMessage, ['what', 'how', 'why', 'when', 'where', 'can you', 'help', '?']);
    
    // Greetings - more flexible matching
    if (isGreeting || lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage === 'hey') {
      const displayName = getDisplayName();
      const greetings = [
        `Hello ${displayName}! Great to see you here. I'm ready to help with your academic needs!`,
        `Hi there ${displayName}! How can I assist you with your BITS Pilani studies today?`,
        `Hey ${displayName}! I'm here to help with courses, grades, notes, schedules - anything you need!`,
        `Good to see you ${displayName}! What would you like to know about your academic progress?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Personal information and profile
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

    // Course-related queries
    if (isCourseQuery) {
      if (lowerMessage.includes('ongoing') || lowerMessage.includes('current')) {
        const ongoingCourses = courses.filter(c => c.status === 'ongoing');
        if (ongoingCourses.length === 0) {
          return "Hmm, looks like you don't have any ongoing courses right now. 🤔\n\nWant me to check your upcoming courses for next semester instead?";
        }
        
        if (ongoingCourses.length === 1) {
          const course = ongoingCourses[0];
          return `You're currently taking **${course.title}** (${course.code}).

Your progress is at ${course.progress || 0}%. ${course.progress >= 80 ? 'Great work! 🎉' : course.progress >= 60 ? 'You\'re doing well! 👍' : 'Keep it up! 💪'}

Need any specific help with this course?`;
        }
        
        const avgProgress = Math.round(ongoingCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / ongoingCourses.length);
        let response = `You're currently taking ${ongoingCourses.length} courses with an average progress of ${avgProgress}%.

**Your current courses:**
`;
        ongoingCourses.forEach((course, index) => {
          response += `${index + 1}. ${course.title} (${course.progress || 0}%)\n`;
        });
        
        response += "\nWant details about any specific course?";
        return response;
      }
      
      if (lowerMessage.includes('completed') || lowerMessage.includes('finished')) {
        const completedCourses = courses.filter(c => c.status === 'completed');
        if (completedCourses.length === 0) {
          return "You haven't completed any courses yet. But you're making great progress on your current ones! 💪";
        }
        
        const gradesWithValues = completedCourses.filter(c => c.grades.finalGrade && c.grades.finalGrade !== 'N/A');
        let response = `You've completed ${completedCourses.length} course${completedCourses.length > 1 ? 's' : ''}! 🎉

`;
        
        if (gradesWithValues.length > 0) {
          const goodGrades = gradesWithValues.filter(c => ['A', 'A-', 'B', 'B+'].includes(c.grades.finalGrade || '')).length;
          if (goodGrades > 0) {
            response += `Great job! You've earned ${goodGrades} excellent grade${goodGrades > 1 ? 's' : ''}. `;
          }
        }
        
        response += "\nWould you like to see your grades or get details about any specific completed course?";
        return response;
      }

      if (lowerMessage.includes('upcoming') || lowerMessage.includes('next')) {
        const upcomingCourses = courses.filter(c => c.status === 'upcoming');
        if (upcomingCourses.length === 0) {
          return "No upcoming courses scheduled yet. You're focusing on your current semester - that's smart! 📚";
        }
        
        const nextSemesterCourses = upcomingCourses.filter(c => c.semester === Math.min(...upcomingCourses.map(course => course.semester)));
        
        let response = `You have ${upcomingCourses.length} courses planned for future semesters.

**Next semester, you'll be taking:**
`;
        nextSemesterCourses.slice(0, 4).forEach((course, index) => {
          response += `${index + 1}. ${course.title}\n`;
        });
        
        if (nextSemesterCourses.length > 4) {
          response += `...and ${nextSemesterCourses.length - 4} more courses.\n`;
        }
        
        response += "\nExcited about any particular course?";
        return response;
      }

      // General course query
      const ongoing = courses.filter(c => c.status === 'ongoing').length;
      const completed = courses.filter(c => c.status === 'completed').length;
      const upcoming = courses.filter(c => c.status === 'upcoming').length;
      
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

    // Grades and marks queries
    if (isGradeQuery) {
      const completedCourses = courses.filter(c => c.status === 'completed' && c.grades.finalGrade && c.grades.finalGrade !== 'N/A');
      
      if (completedCourses.length === 0) {
        return "You don't have any final grades yet - you're still working on your current courses! 💪\n\nOnce you complete your ongoing courses, I'll be able to show you your results. Keep up the great work!";
      }

      const excellentGrades = completedCourses.filter(c => ['A', 'A+', 'A-'].includes(c.grades.finalGrade || '')).length;
      const goodGrades = completedCourses.filter(c => ['B+', 'B', 'B-'].includes(c.grades.finalGrade || '')).length;
      
      let response = "";
      
      if (excellentGrades > 0) {
        response += `Excellent work! 🌟 You've earned ${excellentGrades} A-grade${excellentGrades > 1 ? 's' : ''} so far.

`;
      } else if (goodGrades > 0) {
        response += `Great progress! 👍 You're doing well with ${goodGrades} B-grade${goodGrades > 1 ? 's' : ''}.

`;
      } else {
        response += `You've completed ${completedCourses.length} course${completedCourses.length > 1 ? 's' : ''}! 📚

`;
      }
      
      const coursesWithMarks = completedCourses.filter(c => c.grades.total !== null);
      if (coursesWithMarks.length > 0) {
        const average = coursesWithMarks.reduce((sum, c) => sum + (c.grades.total || 0), 0) / coursesWithMarks.length;
        response += `Your overall average is ${average.toFixed(1)}%`;
        
        if (average >= 80) {
          response += " - Outstanding performance! 🎉";
        } else if (average >= 70) {
          response += " - Great work! 👏";
        } else if (average >= 60) {
          response += " - Good progress! Keep it up! 💫";
        } else {
          response += " - You're building your foundation. Keep learning! 📚";
        }
      }
      
      response += `

You've completed ${completedCourses.length} out of ${courses.length} total courses.

Would you like to see grades for a specific course or need study tips for your current ones?`;

      return response;
    }

    // Events and schedule queries
    if (isEventQuery) {
      
      if (lowerMessage.includes('today')) {
        const todayEvents = events.filter(event => event.date === todayStr);
        if (todayEvents.length === 0) {
          return "You have a free day today! 🎉 No scheduled events. Perfect time to catch up on studies or work on assignments.\n\nWould you like me to show you what's coming up this week instead?";
        }
        
        if (todayEvents.length === 1) {
          const event = todayEvents[0];
          const typeIcon = event.type === 'exam' ? '📝' : event.type === 'assignment' ? '📋' : event.type === 'deadline' ? '⏳' : event.type === 'holiday' ? '🎉' : '📅';
          return `You have one event today:

${typeIcon} **${event.title}** at ${event.time}${event.location ? `\n📍 ${event.location}` : ''}${event.course ? `\n📚 ${event.course}` : ''}

Need any details about this event?`;
        }
        
        let response = `You have ${todayEvents.length} events today:

`;
        todayEvents.slice(0, 3).forEach((event, index) => {
          const typeIcon = event.type === 'exam' ? '📝' : event.type === 'assignment' ? '📋' : event.type === 'deadline' ? '⏳' : event.type === 'holiday' ? '🎉' : '📅';
          response += `${index + 1}. ${typeIcon} ${event.title} at ${event.time}\n`;
        });
        
        if (todayEvents.length > 3) {
          response += `...and ${todayEvents.length - 3} more.

`;
        }
        response += "\nWould you like details about any specific event?";
        return response;
      }

      // General event query
      const upcomingCount = events.filter(event => new Date(event.date) >= today).length;
      
      if (upcomingCount === 0) {
        return "You don't have any upcoming events! 🎉\n\nPretty quiet schedule ahead. Want me to help you plan some study sessions or check what's coming up next month?";
      }
      
      return `I can help you with your schedule! You have ${upcomingCount} upcoming events.

What specifically would you like to know about?

🗓️ **Today's events**
📅 **This week's schedule**
📝 **Upcoming exams**
📋 **Assignment deadlines**

Just ask me about any of these!`;
    }

    // Announcements queries
    if (isAnnouncementQuery) {
      if (announcements.length === 0) {
        return "All quiet on the announcements front! 📢\n\nNo new announcements right now. I'll let you know as soon as something important comes up!";
      }

      const unreadCount = announcements.filter(a => !a.read).length;
      const latestAnnouncement = announcements[0];
      
      let response = "";
      if (unreadCount > 0) {
        response += `You have ${unreadCount} unread announcement${unreadCount > 1 ? 's' : ''}! `;
      }
      
      response += `

**Latest update:** ${latestAnnouncement.title}
📅 ${latestAnnouncement.time}

`;
      
      if (latestAnnouncement.priority === 'high') {
        response += "🔴 This is marked as important!\n\n";
      }
      
      response += "Would you like me to read the full announcement or show you all unread ones?";
      
      return response;
    }

    // Notes and search queries
    if (isNoteQuery) {
      const searchTerms = lowerMessage.replace(/note|notes|search|find|in|my|for|about/g, '').trim();
      
      if (searchTerms && notes.length > 0) {
        const matchingNotes = notes.filter(note => 
          note.title.toLowerCase().includes(searchTerms) ||
          note.content.toLowerCase().includes(searchTerms) ||
          note.tags.toLowerCase().includes(searchTerms) ||
          note.course.toLowerCase().includes(searchTerms)
        );

        if (matchingNotes.length === 0) {
          return `I couldn't find any notes about "${searchTerms}". 🔍

Try searching for:
• Course names (like "Database" or "Programming")
• Topics (like "algorithms" or "testing")
• Tags (like "lecture" or "assignment")

What else can I help you find?`;
        }

        if (matchingNotes.length === 1) {
          const note = matchingNotes[0];
          const favoriteIcon = note.favorite ? '⭐ ' : '';
          return `Found your note about "${searchTerms}"! 📝

${favoriteIcon}**${note.title}**
📚 From: ${note.course}
🏷️ Tagged as: ${note.tags}

Would you like me to open this note for you?`;
        }
        
        let response = `Great! I found ${matchingNotes.length} notes about "${searchTerms}":

`;
        matchingNotes.slice(0, 4).forEach((note, index) => {
          const favoriteIcon = note.favorite ? '⭐ ' : '';
          response += `${index + 1}. ${favoriteIcon}${note.title}\n   📚 ${note.course}\n`;
        });
        
        if (matchingNotes.length > 4) {
          response += `\n...and ${matchingNotes.length - 4} more notes.`;
        }
        
        response += "\n\nWhich note would you like to open?";
        return response;
      } else if (searchTerms) {
        return `Let me help you search for "${searchTerms}"! 🔍

I can search through:
📝 Your study notes
📚 Course materials
📋 Assignment details
📅 Upcoming events

What type of content are you looking for specifically?`;
      }

      if (notes.length > 0) {
        const favoriteCount = notes.filter(n => n.favorite).length;
        
        let response = `You have ${notes.length} note${notes.length > 1 ? 's' : ''} in your collection! 📚

`;
        
        if (favoriteCount > 0) {
          response += `⭐ ${favoriteCount} favorite${favoriteCount > 1 ? 's' : ''}\n`;
        }
        
        response += "**Your recent notes:**\n";
        notes.slice(0, 3).forEach((note, index) => {
          const favoriteIcon = note.favorite ? '⭐ ' : '';
          response += `${index + 1}. ${favoriteIcon}${note.title}\n`;
        });
        
        response += `\nWant me to help you find something specific? Just tell me what you're looking for!`;
        return response;
      }

      return `You haven't created any notes yet, but I can help you get started! 📝

You can create notes for:
• Lecture summaries
• Assignment details
• Study materials
• Important reminders

Want some tips on effective note-taking?`;
    }

    // Enhanced general question handling
    if (isGeneralQuestion) {
      if (containsWords(lowerMessage, ['help', 'can you help', 'what can you do', 'how can you help'])) {
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

      if (containsWords(lowerMessage, ['what', 'how many', 'tell me'])) {
        return `I'd be happy to tell you about your academic information! 📖

What specifically would you like to know about?

🎯 **Quick Questions I Can Answer:**
• "What courses am I taking?"
• "What's my current progress?"
• "What's happening today?"
• "What grades do I have?"
• "Any announcements?"
• "Find my notes about..."

Or ask me anything else about your studies - I'm here to help!`;
      }
    }

    // More specific fallback based on question type
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

    // Try to be more intelligent about unmatched queries
    const displayName = getDisplayName();

    // Default response
    const helpfulResponses = [
      "I'm here to help! 😊 What would you like to know about your studies?\n\nI can help with:\n📅 Your schedule and deadlines\n📚 Course information and progress\n📝 Finding your notes\n📢 Latest announcements\n🎯 Study tips and advice\n\nJust ask me anything!",
      "Hi there! I'm your study buddy. 🤖✨\n\nTry asking me things like:\n• \"What's due this week?\"\n• \"Show my current courses\"\n• \"Any new announcements?\"\n• \"Find my database notes\"\n• \"What exams are coming up?\"\n\nWhat can I help you with today?",
      "I'd love to help you stay organized! 📖\n\nPopular questions I get:\n🗓️ \"What do I have today?\"\n📊 \"How are my grades?\"\n🔍 \"Find notes about...\"\n📢 \"Any important updates?\"\n💡 \"Give me study tips\"\n\nWhat's on your mind?",
      "Ready to assist! 🎓 I know all about your academic life.\n\nI can help you:\n✅ Stay on top of deadlines\n📈 Track your progress\n🔎 Find study materials\n📱 Get important updates\n💪 Study more effectively\n\nWhat would you like to explore?"
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
          <div
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
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div
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
        </div>
      </div>
    </>
  );
}
