import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Plus, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
//import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface AIAssistantProps {
  events?: Array<{ id: string; title: string; date: string; time: string; type: string; description?: string; course?: string; location?: string }>;
  courses?: Array<{ id: string; title: string; code: string; semester: number; status: "ongoing" | "completed" | "upcoming"; progress?: number; grades: { assignmentQuiz: number | null; midSemester: number | null; comprehensive: number | null; total: number | null; finalGrade: string | null } }>;
  userName?: string;
  userProfile?: { name: string; id: string; email: string; phone: string; course: string; semester: string; avatar?: string };
  announcements?: Array<{ id: string; title: string; content: string; time: string; priority: string; category: string; read: boolean }>;
  notes?: Array<{ id: string; title: string; content: string; course: string; tags: string; createdAt: string; lastModified: string; favorite: boolean; attachments?: Array<{ id: string; name: string; type: string; size: number; url: string; uploadDate: string }> }>;
  libraryItems?: Array<{ id: string; title: string; type: string; course: string; fileType: string; size: string; uploadDate: string }>;
}

export function AIAssistant({ events = [], courses = [], userName = "Student", userProfile, announcements = [], notes = [], libraryItems = [] }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(() => [{
    id: "initial-1",
    type: "assistant",
    content: `Hi ${userProfile?.name || userName}! 👋 How can I help you today?`,
    timestamp: "Just now"
  }]);
  
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCourse, setTicketCourse] = useState("");
  const [ticketCategory, setTicketCategory] = useState("general");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const findCourse = (msg: string) => {
    const lower = msg.toLowerCase();
    for (const course of courses) {
      const title = course.title.toLowerCase();
      const code = course.code.toLowerCase();
      if (lower.includes(title) || lower.includes(code) || title.split(' ').some(w => w.length > 4 && lower.includes(w))) return course;
    }
    return null;
  };

  const isOutOfScope = (msg: string) => {
    const lower = msg.toLowerCase();
    return /\d+\s*[\+\-\*\/×÷]/.test(lower) || /who is|capital of|world history|windows|mac|iphone|android|movie|song|music|game/.test(lower);
  };

  const createTicket = async (issue: string, course?: any) => {
    try {
      const info = await import('../utils/supabase/info');
      const ticketData = {
        studentId: userProfile?.id || 'unknown',
        studentName: userProfile?.name || userName || 'Student',
        studentEmail: userProfile?.email || 'unknown@email.com',
        courseId: course?.id,
        courseName: course?.title,
        subject: course ? `Issue with ${course.title}` : 'General Support Request',
        description: issue,
        category: /grade|mark/.test(issue.toLowerCase()) ? 'grades' : /content|material|slide/.test(issue.toLowerCase()) ? 'content' : /technical|not working|error/.test(issue.toLowerCase()) ? 'technical' : 'general',
        priority: 'medium'
      };

      const res = await fetch(`https://${info.projectId}.supabase.co/functions/v1/make-server-917daa5d/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${info.publicAnonKey}` },
        body: JSON.stringify(ticketData)
      });
      if (res.ok) return (await res.json()).ticket;
    } catch (e) { console.error('Ticket creation failed:', e); }
    return null;
  };

  const handleTicketSubmit = async () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;
    setIsSubmittingTicket(true);
    try {
      const selectedCourse = ticketCourse ? courses.find(c => c.id === ticketCourse) : undefined;
      const ticket = await createTicket(ticketDescription, selectedCourse);
      if (ticket) {
        setMessages(prev => [...prev, { id: Date.now().toString(), type: "assistant", content: `✅ Ticket #${ticket.id} created successfully!\nSubject: ${ticketSubject}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setTicketSubject(""); setTicketDescription(""); setTicketCourse(""); setTicketCategory("general"); setTicketPriority("medium");
        setShowTicketForm(false);
      } else throw new Error("Ticket failed");
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: "assistant", content: "❌ Failed to create ticket. Try again.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally { setIsSubmittingTicket(false); }
  };

  const generateResponse = async (userMessage: string) => {
    const lower = userMessage.toLowerCase().trim();
    const name = userProfile?.name || userName;

    if (isOutOfScope(lower)) return "I'll forward this to a tutor. Meanwhile, I can help with courses, grades, schedule, or notes.";
    if (/thank|thanks/.test(lower)) return `You're welcome, ${name}! 😊`;
    if (/^(hi|hello|hey)/.test(lower)) return `Hello! What would you like to know?`;
    if (/help|what can/.test(lower)) return "I can help with grades, courses, schedule, notes, and announcements. What do you need?";

    const course = findCourse(userMessage);
    const isSupportIssue = /not updated|not showing|wrong|incorrect|missing|validate|check with staff|issue|problem|error/.test(lower);

    if (isSupportIssue) {
      const ticket = await createTicket(userMessage, course);
      return ticket ? `Created support ticket (#${ticket.id})${course ? ` for ${course.title}` : ""}. Staff will review it soon.` : "I'll forward this to staff. They'll respond soon.";
    }

    if (/grade|mark|score|result/.test(lower) && course) {
      if (course.status === 'completed' && course.grades.finalGrade) return `${course.title}: Grade ${course.grades.finalGrade} (${course.grades.total}/100)`;
      if (course.status === 'ongoing') return `${course.title} is ongoing. Progress: ${course.progress}%`;
      return `${course.title} starts in Semester ${course.semester}.`;
    }

    if (/today|tomorrow|week|due|deadline/.test(lower)) {
      const today = new Date().toISOString().split('T')[0];
      let filtered = [];
      if (lower.includes('today')) filtered = events.filter(e => e.date === today);
      if (lower.includes('week')) { const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7); filtered = events.filter(e => new Date(e.date) <= weekEnd); }
      return filtered.length ? filtered.slice(0,3).map((e,i)=>`${i+1}. ${e.title}${e.time?` at ${e.time}`:""}`).join('\n') : "No events found!";
    }

    if (/current|enrolled|taking|my course/.test(lower)) {
      const ongoing = courses.filter(c => c.status === 'ongoing');
      return ongoing.length ? ongoing.slice(0,4).map((c,i)=>`${i+1}. ${c.title}`).join('\n') : "No ongoing courses.";
    }

    if (/about|details|info/.test(lower) && course) return `${course.title} (${course.code}) - Status: ${course.status}`;

    if (/note|material|find|search/.test(lower)) {
      if (course) { const courseNotes = notes.filter(n=>n.course.toLowerCase().includes(course.title.toLowerCase())); return courseNotes.length ? courseNotes.slice(0,3).map((n,i)=>`${i+1}. ${n.title}`).join('\n') : `No notes for ${course.title}`; }
      return notes.length ? notes.slice(0,3).map((n,i)=>`${i+1}. ${n.title}`).join('\n') : "No notes yet.";
    }

    if (/announcement|news|update|notice/.test(lower)) {
      const unread = announcements.filter(a=>!a.read).length;
      return announcements.length ? `${unread} unread announcements:\n` + announcements.slice(0,2).map((a,i)=>`${i+1}. ${a.title}`).join('\n') : "No new announcements.";
    }

    return "Could you be more specific? Try asking about grades, schedule, courses, or notes.";
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg = { id: Date.now().toString(), type: "user", content: message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]); setMessage("");
    const botMsg = { id: (Date.now()+1).toString(), type: "assistant", content: await generateResponse(userMsg.content), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, botMsg]);
  };

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{opacity:0,scale:0.8,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.8,y:20}} transition={{duration:0.2}} className="fixed bottom-24 right-6 z-40">
            <Card className="w-80 sm:w-96 h-[500px] sm:h-[550px] flex flex-col shadow-2xl border-university-border bg-white">
              {/* Header */}
              <div className="p-3 sm:p-4 rounded-t-lg bg-[rgb(25,35,94)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center relative bg-white/15">
                    <Bot className="w-5 h-5 text-white" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">BITS Assistant</h3>
                    <p className="text-xs text-white opacity-90">Always here to help</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={()=>setIsExpanded(false)} className="text-white hover:bg-white/20 w-8 h-8 rounded-lg"><X className="w-4 h-4"/></Button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                {messages.map(msg=>(
                  <div key={msg.id} className={`flex ${msg.type==="user"?"justify-end":"justify-start"}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg ${msg.type==="user"?"bg-[rgb(25,35,94)] text-white":"bg-white border border-gray-200 shadow-sm text-gray-800"}`}>
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      <p className="text-xs mt-1 text-gray-500">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                <Button onClick={()=>setShowTicketForm(true)} variant="outline" className="w-full rounded-lg text-sm border-[rgb(25,35,94)] text-[rgb(25,35,94)] hover:bg-[rgb(25,35,94)] hover:text-white transition-colors">
                  <Plus className="w-4 h-4 mr-2"/>Create Support Ticket
                </Button>
                <div className="flex gap-2">
                  <Input placeholder="Ask me anything..." value={message} onChange={e=>setMessage(e.target.value)} onKeyPress={e=>e.key==="Enter"&&handleSend()} className="flex-1 rounded-lg text-sm border-gray-300 focus:border-[rgb(25,35,94)] focus:ring-[rgb(25,35,94)]"/>
                  <Button onClick={handleSend} disabled={!message.trim()} className="px-3 rounded-lg text-white bg-[rgb(25,35,94)] hover:bg-[rgb(20,28,75)]"><Send className="w-4 h-4"/></Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div whileHover={{scale:1.05}} whileTap={{scale:0.95}}>
          <Button onClick={()=>setIsExpanded(!isExpanded)} className="w-14 h-14 rounded-full shadow-lg relative text-white bg-[rgb(25,35,94)] hover:bg-[rgb(20,28,75)]">
            {isExpanded?<X className="w-6 h-6"/>:<><Bot className="w-6 h-6"/><div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border-2 border-white"></div><Badge className="absolute -top-0.5 -right-0.5 w-5 h-5 p-0 text-xs text-white flex items-center justify-center rounded-full bg-green-500">AI</Badge></>}
          </Button>
        </motion.div>
      </div>

      {/* Ticket Dialog */}
      <Dialog open={showTicketForm} onOpenChange={setShowTicketForm}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-university-primary"><AlertCircle className="w-5 h-5"/>Create Support Ticket</DialogTitle>
            <DialogDescription>Submit a support request. You'll be notified when they respond.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="ticket-subject">Subject <span className="text-red-500">*</span></Label><Input id="ticket-subject" placeholder="Brief description" value={ticketSubject} onChange={e=>setTicketSubject(e.target.value)}/></div>
            <div className="space-y-2"><Label htmlFor="ticket-course">Related Course (Optional)</Label><Select value={ticketCourse} onValueChange={setTicketCourse}><SelectTrigger><SelectValue placeholder="Select a course"/></SelectTrigger><SelectContent><SelectItem value="none">No specific course</SelectItem>{courses.map(c=><SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="ticket-category">Category</Label><Select value={ticketCategory} onValueChange={setTicketCategory}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="grades">Grades/Marks</SelectItem><SelectItem value="content">Course Content</SelectItem><SelectItem value="technical">Technical Issue</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="ticket-priority">Priority</Label><Select value={ticketPriority} onValueChange={setTicketPriority}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="ticket-description">Description <span className="text-red-500">*</span></Label><Textarea id="ticket-description" placeholder="Describe your issue" value={ticketDescription} onChange={e=>setTicketDescription(e.target.value)} className="h-24"/></div>
            <Button onClick={handleTicketSubmit} disabled={isSubmittingTicket} className="w-full bg-[rgb(25,35,94)] text-white hover:bg-[rgb(20,28,75)]">{isSubmittingTicket?'Submitting...':'Submit Ticket'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
