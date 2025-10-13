// src/components/AIAssistant.tsx
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Cpu } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  description?: string;
  course?: string;
  location?: string;
}

interface Course {
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
}

interface UserProfile {
  name: string;
  id: string;
  email: string;
  phone: string;
  course: string;
  semester: string;
  avatar?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  time: string;
  priority: string;
  category: string;
  read: boolean;
}

interface NoteFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  course: string;
  tags: string;
  createdAt: string;
  lastModified: string;
  favorite: boolean;
  files?: NoteFile[];
}

interface LibraryItem {
  id: string;
  title: string;
  type: string;
  course: string;
  fileType: string;
  size: string;
  uploadDate: string;
}

interface AIAssistantProps {
  events?: Event[];
  courses?: Course[];
  userName?: string;
  userProfile?: UserProfile;
  announcements?: Announcement[];
  notes?: Note[];
  libraryItems?: LibraryItem[];
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function AIAssistant({
  events = [],
  courses = [],
  userName = "Student",
  userProfile,
  announcements = [],
  notes = [],
  libraryItems = [],
}: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-1",
      type: "assistant",
      content: `Hello! I'm BITS-Bot, your intelligent academic assistant. How can I help you today?`,
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Compute proper display name
  const getDisplayName = () => {
    if (userProfile?.name && userProfile.name.trim() && userProfile.name !== "Student") {
      return userProfile.name.trim();
    }
    if (userName && userName.trim() && userName !== "Student") {
      return userName.trim();
    }
    return "Student";
  };

  // AI response generator
  const generateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase().trim();
    const todayStr = new Date().toISOString().split("T")[0];
    const displayName = getDisplayName();

    const containsWords = (text: string, words: string[]) =>
      words.some((word) => text.includes(word));

    const isGreeting = containsWords(lowerMessage, [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "greetings",
    ]);

    const isPersonalInfo = containsWords(lowerMessage, [
      "my name",
      "who am i",
      "my profile",
      "about me",
      "my info",
      "my details",
      "profile",
    ]);

    if (isGreeting) {
      const greetings = [
        `Hello ${displayName}! Great to see you. How can I assist you today?`,
        `Hi ${displayName}! Ready to help with your courses, grades, and notes!`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (isPersonalInfo) {
      return `**PROFILE:**

👤 Name: ${userProfile?.name || displayName}
🎓 Course: ${userProfile?.course || "N/A"}
📧 Email: ${userProfile?.email || "N/A"}
📱 Phone: ${userProfile?.phone || "N/A"}
📚 Semester: ${userProfile?.semester || "N/A"}`;
    }

    // Default fallback
    return `I'm here to help you with your courses, grades, events, notes, and announcements! 😊`;
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: generateAIResponse(message),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
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
                      <p className="text-xs sm:text-sm opacity-90 text-[rgba(244,245,248,1)]">
                        AI Assistant
                      </p>
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
                      <p
                        className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                          msg.type === "user" ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {msg.content}
                      </p>
                      <p
                        className={`text-xs mt-1 sm:mt-2 opacity-70 ${
                          msg.type === "user" ? "text-white" : "text-gray-600"
                        }`}
                      >
                        {msg.timestamp}
                      </p>
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
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
