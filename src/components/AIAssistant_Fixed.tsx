import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Cpu } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
//import { motion, AnimatePresence } from "motion/react";

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

// Helper function to check if a string contains any keyword
const containsAny = (text: string, keywords: string[]) =>
  keywords.some(k => text.includes(k));

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
  const [messages, setMessages] = useState(() => [
    {
      id: "initial-1",
      type: "assistant",
      content: `Hello! I'm BITS-Bot, your intelligent academic assistant. How can I help you today?`,
      timestamp: "Just now"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine display name
  const displayName =
    userProfile?.name?.trim() && userProfile.name !== "Student"
      ? userProfile.name
      : userName?.trim() && userName !== "Student"
      ? userName
      : "Student";

  // Initialize greeting with display name
  useEffect(() => {
    setMessages([
      {
        id: "initial-1",
        type: "assistant",
        content: `Hello ${displayName}! I'm BITS-Bot, your intelligent academic assistant. How can I help you today?`,
        timestamp: "Just now"
      }
    ]);
  }, [displayName]);

  // Scroll to bottom on new message
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [messages]);

  // AI Response Generator
  const generateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase().trim();
    const todayStr = new Date().toISOString().split("T")[0];

    // Keywords
    const websiteKeywords = [
      // Login
      "log in","login","sign in","signin","password","account","register","forgot password",
      // Courses
      "course","courses","subject","subjects","class","classes","semester","study","studying","enrolled","registration",
      // Grades
      "grade","grades","mark","marks","score","scores","result","results","performance","progress","cgpa","gpa","percentage",
      // Schedule
      "event","events","schedule","deadline","deadlines","today","tomorrow","week","due","calendar","exam","exams","test","tests","quiz","quizzes","assignment","assignments",
      // Notes & Materials
      "note","notes","library","book","books","material","materials","resource","resources","download","upload","file","files","document","documents","pdf","ppt","slide","slides",
      // Communication
      "announcement","announcements","news","notification","notifications","update","updates","notice","notices","message","messages",
      // Profile
      "my name","who am i","my profile","profile","my email","my phone","contact","my info","my details","account details",
      // Navigation
      "dashboard","home","page","tab","menu","navigate","go to","show me","find","search","where is","how do i","how to","what is",
      // BITS specific
      "bits","pilani","wilp","university","campus","instructor","professor","teacher","tutor","faculty",
      // Portal
      "e-learn","elearn","portal","system","platform","website","app","application",
      // Greetings
      "hi","hello","hey","help","assist","what can you","who are you","thanks","thank you"
    ];

    const isWebsiteRelated = containsAny(lowerMessage, websiteKeywords);

    // Out-of-scope check
    if (!isWebsiteRelated) {
      const outOfScopePatterns = [
        /\d+\s*[\+\-\*\/×÷]/, /calculate|solve|equation|formula/,
        /who is (the |a )?(president|prime minister|ceo)/,
        /capital of|country|world|history|geography/,
        /windows|mac|iphone|android|computer|laptop/,
        /install|download|software/,
        /should i|what should|advice|recommend|suggest/,
        /relationship|dating|love|career/,
        /movie|song|music|game|sport/,
        /watch|play|listen/
      ];
      if (outOfScopePatterns.some(p => p.test(lowerMessage)) || lowerMessage.length > 20) {
        return `This question seems outside my scope. I'll forward it to a tutor for help. Meanwhile, I can assist with:
• Course info
• Grades & performance
• Notes & materials
• Calendar events
• Announcements

Would you like to know about any of these?`;
      }
    }

    // Quick helper for categories
    const checkKeywords = (keywords: string[]) => containsAny(lowerMessage, keywords);

    // Greeting
    if (checkKeywords(["hi","hello","hey","morning","afternoon","evening","greetings"])) {
      return `Hello ${displayName}! 👋 Welcome to the BITS Pilani student portal.

I can help you with:
• Course schedules and details
• Checking your grades
• Finding notes and materials
• Viewing upcoming events
• Reading announcements

What would you like to know about today?`;
    }

    // Help
    if (checkKeywords(["help","what can you","how can you","assist"])) {
      return `Of course! I'm here to assist you with the BITS Pilani portal. 🎓

📚 Academic Info: Courses, grades, progress
📅 Schedule & Events: Deadlines, exams
📝 Study Materials: Notes, resources
📢 Updates & News: Announcements
💡 Study Support: Tips, guidance

Ask me things like "What's due today?" or "Show my courses".`;
    }

    // Profile
    if (checkKeywords(["my name","who am i","my profile","about me","profile"])) {
      return `**YOUR PROFILE:**

👤 Name: ${userProfile?.name || displayName}
🎓 Course: ${userProfile?.course || 'Computer Science'}
📧 Email: ${userProfile?.email || 'Not set'}
📱 Phone: ${userProfile?.phone || 'Not set'}
📚 Semester: ${userProfile?.semester || 'Not specified'}

You can update this anytime in your profile.`;
    }

    // Courses
    if (checkKeywords(["course","subject","class","semester","study","studying"])) {
      const ongoing = courses.filter(c => c.status === "ongoing");
      const completed = courses.filter(c => c.status === "completed");
      const upcoming = courses.filter(c => c.status === "upcoming");

      if (lowerMessage.includes("current") || lowerMessage.includes("ongoing")) {
        if (!ongoing.length) return "No ongoing courses right now. 🤔 Want me to check upcoming courses?";
        return `You're currently taking ${ongoing.length} courses:\n` +
               ongoing.map((c,i)=>`${i+1}. ${c.title} (${c.progress || 0}%)`).join("\n") +
               "\n\nWant details about any specific course?";
      }

      return `Course overview:
📚 Currently studying: ${ongoing.length}
✅ Completed: ${completed.length}
⏳ Upcoming: ${upcoming.length}

Ask for current, completed, or upcoming courses.`;
    }

    // Grades
    if (checkKeywords(["grade","mark","score","result","performance","progress"])) {
      const completedCourses = courses.filter(c => c.status === "completed" && c.grades.finalGrade && c.grades.finalGrade !== "N/A");
      if (!completedCourses.length) return "No final grades yet. Keep up the great work! 💪";

      const excellent = completedCourses.filter(c => ["A","A+","A-"].includes(c.grades.finalGrade || "")).length;
      let response = excellent > 0 ? `Excellent! 🌟 ${excellent} A-grade${excellent>1?'s':''} so far.\n\n` : `Completed ${completedCourses.length} courses.\n\n`;
      response += `Total completed: ${completedCourses.length} of ${courses.length}.\nWant grades for a specific course or study tips?`;
      return response;
    }

    // Events
    if (checkKeywords(["event","schedule","deadline","today","tomorrow","week","due"])) {
      const todayEvents = events.filter(e => e.date === todayStr);
      if (lowerMessage.includes("today")) {
        if (!todayEvents.length) return "Free today! 🎉 No events. Want me to show this week's schedule?";
        return `Today's events (${todayEvents.length}):\n` +
               todayEvents.slice(0,3).map((e,i)=>`${i+1}. ${e.type==="exam"?"📝":e.type==="assignment"?"📋":"📅"} ${e.title} at ${e.time}`).join("\n");
      }
      return `You have ${events.filter(e=>new Date(e.date)>=new Date()).length} upcoming events. Ask for today's events, weekly schedule, exams, or assignments.`;
    }

    // Announcements
    if (checkKeywords(["announcement","news","notification","update","notice"])) {
      if (!announcements.length) return "No new announcements right now. 📢";
      const unread = announcements.filter(a=>!a.read).length;
      const latest = announcements[0];
      return `${unread?`You have ${unread} unread announcement(s)!\n\n`:''}Latest: ${latest.title} (${latest.time})\nWant me to show all unread announcements?`;
    }

    // Notes
    if (checkKeywords(["note","notes","search","find"])) {
      if (!notes.length) return `You haven't created notes yet. 📝 I can help you get started.`;
      const favCount = notes.filter(n=>n.favorite).length;
      return `You have ${notes.length} notes${favCount?`, ${favCount} favorite`:""}.\nRecent notes:\n` +
             notes.slice(0,3).map((n,i)=>`${i+1}. ${n.favorite?"⭐ ":""}${n.title}`).join("\n") +
             `\n\nWant me to find something specific?`;
    }

    // Fallback for questions
    if (lowerMessage.includes("?")) {
      return `Great question! 🤔 I can assist you with:

🔍 Search: "Find notes on X", "Show assignments due"
📊 Academic: "Grades", "Course progress"
📅 Schedule: "Today's events", "Next exam"
Please rephrase your question in one of these ways. 😊`;
    }

    // Default helpful responses
    const defaultResponses = [
      `I'd love to help you, ${displayName}! 😊 Ask me about courses, grades, events, notes, or announcements.`,
      `Hi ${displayName}! 🤖 I can help with academic info, schedules, study materials, and updates.`,
      `Ready to assist, ${displayName}! 🎓 Popular requests:
🗓️ "What's happening today?"
📈 "How am I doing in my courses?"
🔍 "Find notes on algorithms"
💡 "Study tips"`
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // Send message handler
  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: generateAIResponse(message),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
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
                        BITS-Bot <Cpu className="w-3 h-3 sm:w-4 sm:h-4" />
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
                {messages.map(msg => {
                  const isUser = msg.type === "user";
                  return (
                    <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] p-2 sm:p-3 rounded-lg ${isUser ? "bg-university-primary text-white" : "bg-white border border-university-border text-gray-800 shadow-sm"}`}>
                        <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${isUser ? "text-white" : "text-gray-800"}`}>{msg.content}</p>
                        <p className={`text-xs mt-1 sm:mt-2 opacity-70 ${isUser ? "text-white" : "text-gray-600"}`}>{msg.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-university-border bg-white">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about courses, grades, events, notes..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && handleSend()}
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
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            className="w-14 h-14 rounded-full bg-university-primary hover:bg-university-secondary text-white shadow-2xl flex items-center justify-center"
            onClick={() => setIsExpanded(prev => !prev)}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </>
  );
}
