import { useState, useEffect } from "react";
import { 
  ArrowLeft, Download, Upload, Users, BookOpen, Video, Plus, Trash2, Eye 
} from "lucide-react";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Course {
  id: string;
  title: string;
  code: string;
  semester: number;
  status: "ongoing" | "completed" | "upcoming";
  progress?: number;
  instructor?: string;
}

interface AdminCourseDetailsPageProps {
  course: Course;
  onBack: () => void;
}

interface Session {
  id: number;
  title: string;
  topic: string;
  date: string;
  pptUploaded: boolean;
  pptUrl: string | null;
  uploadedBy: string | null;
}

interface Paper {
  id: number;
  title: string;
  year: string;
  semester: string;
  uploadedAt: string;
  fileUrl: string;
}

interface Quiz {
  id: number;
  title: string;
  link: string;
  startDate: string;
  endDate: string;
  maxMarks: number;
  status: "Available" | "Published";
  submissions: number;
}

export function AdminCourseDetailsPage({ course, onBack }: AdminCourseDetailsPageProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState("quizzes");

  // Upload Dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"paper" | "ppt" | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Quiz Dialog
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizLink, setQuizLink] = useState("");
  const [quizStartDate, setQuizStartDate] = useState("");
  const [quizEndDate, setQuizEndDate] = useState("");

  // View Results Dialog
  const [viewResultsDialogOpen, setViewResultsDialogOpen] = useState(false);

  // Students Dialog
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Staff
  const [staff, setStaff] = useState<any[]>([]);
  const [currentInstructor, setCurrentInstructor] = useState(course.instructor || "TBA");

  // Materials
  const [questionPapers, setQuestionPapers] = useState<Paper[]>([]);
  const [sessions, setSessions] = useState<Session[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: `Session ${i + 1}`,
      topic: `Chapter ${i + 1} Topics`,
      date: `Week ${i + 1}`,
      pptUploaded: false,
      pptUrl: null,
      uploadedBy: null
    }))
  );
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Utility
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "upcoming": return "bg-orange-500 text-white";
      case "ongoing": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  /** -------------------- API FUNCTIONS -------------------- **/

  const fetchCourseData = async () => {
    try {
      await Promise.all([
        fetchMaterials(),
        fetchQuizzes(),
        fetchEnrolledStudents(),
        fetchStaff()
      ]);
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/course-materials/${course.id}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!res.ok) throw new Error("Failed to fetch materials");
      const data = await res.json();

      // Papers
      const papers = data.materials.filter((m: any) => m.type === 'paper');
      setQuestionPapers(papers.map((p: any, idx: number) => ({
        id: p.id ?? idx + 1,
        title: p.title,
        year: new Date(p.uploadedAt).getFullYear().toString(),
        semester: course.semester.toString(),
        uploadedAt: new Date(p.uploadedAt).toISOString().split("T")[0],
        fileUrl: p.fileUrl
      })));

      // PPTs
      const ppts = data.materials.filter((m: any) => m.type === 'ppt');
      setSessions(prev => prev.map(s => {
        const ppt = ppts.find((p: any) => p.sessionId === s.id || p.title === s.title);
        if (ppt) return { ...s, pptUploaded: true, pptUrl: ppt.fileUrl, uploadedBy: 'admin' };
        return s;
      }));

    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/course-quizzes/${course.id}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      const data = await res.json();
      setQuizzes(data.quizzes.map((q: any) => ({
        id: q.id,
        title: q.title,
        link: q.link,
        startDate: q.startDate,
        endDate: q.endDate,
        maxMarks: q.maxMarks || 5,
        status: "Available",
        submissions: 0
      })));
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const fetchEnrolledStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/courses/${course.id}/students`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setEnrolledStudents(data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setEnrolledStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/staff`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleInstructorChange = async (newInstructor: string) => {
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/courses/${course.id}/instructor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ instructor: newInstructor })
      });
      const data = await res.json();
      if (data.success) setCurrentInstructor(newInstructor);
      else alert(data.error || "Failed to update instructor");
    } catch (error) {
      console.error(error);
      alert("Failed to update instructor");
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !uploadTitle) return alert("Please provide a title and file");

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("courseId", course.id);
      formData.append("title", uploadTitle);
      formData.append("description", uploadDescription);
      formData.append("type", uploadType || "paper");

      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/upload-course-material`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (uploadType === "paper") {
        const newPaper: Paper = {
          id: questionPapers.length + 1,
          title: uploadTitle,
          year: new Date().getFullYear().toString(),
          semester: course.semester.toString(),
          uploadedAt: new Date().toISOString().split("T")[0],
          fileUrl: data.fileUrl || "#"
        };
        setQuestionPapers([...questionPapers, newPaper]);
      } else if (uploadType === "ppt") {
        setSessions(prev => prev.map(s =>
          s.title === uploadTitle ? { ...s, pptUploaded: true, pptUrl: data.fileUrl || "#", uploadedBy: "admin" } : s
        ));
      }

      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      await fetchMaterials();
      alert("✅ File uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizTitle || !quizLink || !quizStartDate || !quizEndDate) return alert("Fill all fields");

    try {
      new URL(quizLink); // Validate URL
    } catch {
      return alert("Invalid URL");
    }

    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/create-quiz`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({
          courseId: course.id,
          title: quizTitle,
          link: quizLink,
          startDate: quizStartDate,
          endDate: quizEndDate
        })
      });
      if (!res.ok) throw new Error("Failed to create quiz");
      const data = await res.json();
      setQuizzes([...quizzes, {
        id: data.quizId || quizzes.length + 1,
        title: quizTitle,
        link: quizLink,
        startDate: quizStartDate,
        endDate: quizEndDate,
        maxMarks: 5,
        status: "Available",
        submissions: 0
      }]);
      setQuizDialogOpen(false);
      setQuizTitle(""); setQuizLink(""); setQuizStartDate(""); setQuizEndDate("");
      alert("✅ Quiz created successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Quiz creation failed");
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  /** -------------------- RENDER COMPONENT -------------------- **/
  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft /> <span>Back</span>
        </Button>
        <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="papers">Question Papers</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        {/* Quizzes */}
        <TabsContent value="quizzes" className="space-y-4">
          <Button onClick={() => setQuizDialogOpen(true)} leftIcon={<Plus />}>Create Quiz</Button>
          {quizzes.length === 0 ? (
            <p>No quizzes available</p>
          ) : (
            quizzes.map(q => (
              <Card key={q.id} className="flex justify-between items-center">
                <div>
                  <CardTitle>{q.title}</CardTitle>
                  <CardContent className="space-x-2 text-sm text-gray-500">
                    <span>{q.startDate} - {q.endDate}</span>
                    <Badge>{q.status}</Badge>
                  </CardContent>
                </div>
                <div className="space-x-2">
                  <Button size="sm" onClick={() => window.open(q.link, "_blank")}><Eye /> View</Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions" className="space-y-4">
          {sessions.map(s => (
            <Card key={s.id} className="flex justify-between items-center">
              <div>
                <CardTitle>{s.title}</CardTitle>
                <CardContent className="text-sm text-gray-500">{s.topic}</CardContent>
              </div>
              <div className="space-x-2">
                <Button size="sm" onClick={() => {
                  setUploadDialogOpen(true);
                  setUploadType("ppt");
                  setUploadTitle(s.title);
                }} disabled={s.pptUploaded}><Upload /> Upload PPT</Button>
                {s.pptUploaded && <Button size="sm" onClick={() => s.pptUrl && window.open(s.pptUrl, "_blank")}><Download /> Download</Button>}
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Papers */}
        <TabsContent value="papers" className="space-y-4">
          <Button onClick={() => { setUploadDialogOpen(true); setUploadType("paper"); }}>Upload Paper</Button>
          {questionPapers.length === 0 ? (
            <p>No question papers available</p>
          ) : questionPapers.map(p => (
            <Card key={p.id} className="flex justify-between items-center">
              <div>
                <CardTitle>{p.title}</CardTitle>
                <CardContent className="text-sm text-gray-500">{p.year} Semester {p.semester}</CardContent>
              </div>
              <Button size="sm" onClick={() => window.open(p.fileUrl, "_blank")}><Download /> Download</Button>
            </Card>
          ))}
        </TabsContent>

        {/* Students */}
        <TabsContent value="students" className="space-y-4">
          <Button onClick={() => setShowStudentsDialog(true)} leftIcon={<Users />}>View Enrolled Students</Button>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {uploadType === "paper" ? "Question Paper" : "PPT"}</DialogTitle>
            <DialogDescription>Upload a new {uploadType}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} />
            <Label>Description</Label>
            <Textarea value={uploadDescription} onChange={e => setUploadDescription(e.target.value)} />
            <Label>File</Label>
            <Input type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
            <Button onClick={handleFileUpload} disabled={isUploading}>{isUploading ? "Uploading..." : "Upload"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
            <Label>Link</Label>
            <Input value={quizLink} onChange={e => setQuizLink(e.target.value)} />
            <Label>Start Date</Label>
            <Input type="date" value={quizStartDate} onChange={e => setQuizStartDate(e.target.value)} />
            <Label>End Date</Label>
            <Input type="date" value={quizEndDate} onChange={e => setQuizEndDate(e.target.value)} />
            <Button onClick={handleCreateQuiz}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Students Dialog */}
      <Dialog open={showStudentsDialog} onOpenChange={setShowStudentsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enrolled Students ({enrolledStudents.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Search by name or roll" value={studentSearchQuery} onChange={e => setStudentSearchQuery(e.target.value)} />
            {loadingStudents ? <p>Loading...</p> :
              enrolledStudents.filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || s.roll.toLowerCase().includes(studentSearchQuery.toLowerCase()))
                .map(s => (
                  <Card key={s.roll} className="flex justify-between items-center">
                    <div>{s.name} ({s.roll})</div>
                    <Badge>{s.status || "Active"}</Badge>
                  </Card>
                ))
            }
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
