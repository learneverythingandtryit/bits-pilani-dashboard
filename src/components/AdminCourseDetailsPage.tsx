import { useState, useEffect } from "react";
import { ArrowLeft, Download, Upload, Calendar, Clock, Users, Star, BookOpen, FileText, Video, Plus, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Course {
  id: string;
  title: string;
  code: string;
  semester: number;
  status: "ongoing" | "completed" | "upcoming";
  progress?: number;
  instructor?: string;
  schedule?: string;
  credits?: number;
  grades?: {
    assignmentQuiz: number | null;
    midSemester: number | null;
    comprehensive: number | null;
    total: number | null;
    finalGrade: string | null;
  };
}

interface AdminCourseDetailsPageProps {
  course: Course;
  onBack: () => void;
}

export function AdminCourseDetailsPage({ course, onBack }: AdminCourseDetailsPageProps) {
  const [activeTab, setActiveTab] = useState("quizzes");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"paper" | "ppt" | "quiz" | null>(null);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [viewResultsDialogOpen, setViewResultsDialogOpen] = useState(false);
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  
  // Staff state
  const [staff, setStaff] = useState<any[]>([]);
  const [currentInstructor, setCurrentInstructor] = useState(course.instructor || "TBA");
  
  // File upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Quiz state - simplified to just link
  const [quizTitle, setQuizTitle] = useState("");
  const [quizLink, setQuizLink] = useState("");
  const [quizStartDate, setQuizStartDate] = useState("");
  const [quizEndDate, setQuizEndDate] = useState("");
  
  // Start with EMPTY data - admin must upload everything
  const [questionPapers, setQuestionPapers] = useState<any[]>([]);
  
  const [sessions, setSessions] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: `Session ${i + 1}`,
      topic: `Chapter ${i + 1} Topics`,
      date: `Week ${i + 1}`,
      pptUploaded: false, // Nothing uploaded by default
      pptUrl: null,
      uploadedBy: null
    }))
  );
  
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "upcoming": return "bg-orange-500 text-white";
      case "ongoing": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !uploadTitle) {
      alert("Please provide a title and select a file");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('courseId', course.id);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);
      formData.append('type', uploadType || 'paper');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/upload-course-material`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: formData
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (uploadType === "paper") {
          const newPaper = {
            id: questionPapers.length + 1,
            title: uploadTitle,
            year: new Date().getFullYear().toString(),
            semester: course.semester.toString(),
            uploadedBy: "admin",
            uploadedAt: new Date().toISOString().split('T')[0],
            fileUrl: data.fileUrl || "#"
          };
          setQuestionPapers([...questionPapers, newPaper]);
        } else if (uploadType === "ppt") {
          // Update the specific session with PPT
          setSessions(prev => prev.map(s => 
            s.title === uploadTitle ? { ...s, pptUploaded: true, pptUrl: data.fileUrl || "#", uploadedBy: "admin" } : s
          ));
        }
        
        setIsUploading(false);
        setUploadDialogOpen(false);
        setUploadFile(null);
        setUploadTitle("");
        setUploadDescription("");
        
        // Refresh materials from backend immediately
        await fetchMaterials();
        
        console.log(`✅ Admin uploaded material - students will see it within 10 seconds via auto-sync`);
        alert("✅ File uploaded successfully! Students will see it automatically within 10 seconds.");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
      alert("❌ Upload failed. Please try again.");
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizTitle || !quizLink || !quizStartDate || !quizEndDate) {
      alert("Please fill in all required fields including quiz link");
      return;
    }
    
    // Validate URL
    try {
      new URL(quizLink);
    } catch {
      alert("Please enter a valid URL for the quiz link");
      return;
    }
    
    try {
      // Save quiz to backend - simplified with just link
      const quizData = {
        courseId: course.id,
        courseName: course.title,
        title: quizTitle,
        link: quizLink,
        startDate: quizStartDate,
        endDate: quizEndDate,
        maxMarks: 5,
        status: "Available",
        semester: course.semester
      };
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/create-quiz`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(quizData)
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        const newQuiz = {
          id: data.quiz.id,
          title: quizTitle,
          link: quizLink,
          startDate: quizStartDate,
          endDate: quizEndDate,
          maxMarks: 5,
          status: "Available",
          submissions: 0
        };
        
        setQuizzes([...quizzes, newQuiz]);
        setQuizDialogOpen(false);
        setQuizTitle("");
        setQuizLink("");
        setQuizStartDate("");
        setQuizEndDate("");
        
        console.log(`✅ Admin created quiz - students will see it within 10 seconds via auto-sync`);
        alert("✅ Quiz created successfully! Students will see it automatically within 10 seconds.");
      } else {
        throw new Error("Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("❌ Failed to create quiz. Please try again.");
    }
  };

  const handleDeletePaper = (id: number) => {
    if (confirm("Are you sure you want to delete this question paper?")) {
      setQuestionPapers(questionPapers.filter(p => p.id !== id));
    }
  };

  const handleDeleteQuiz = (id: number) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      setQuizzes(quizzes.filter(q => q.id !== id));
    }
  };

  const fetchEnrolledStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/courses/${course.id}/students`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setEnrolledStudents(data.students || []);
      } else {
        console.error("Failed to fetch enrolled students");
        setEnrolledStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setEnrolledStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleViewStudents = () => {
    setShowStudentsDialog(true);
    fetchEnrolledStudents();
  };

  const filteredStudents = enrolledStudents.filter(student => 
    student.name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.id?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  // Fetch staff list
  const fetchStaff = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/staff`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const data = await response.json();
      if (data.staff) {
        setStaff(data.staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // Update instructor
  const handleInstructorChange = async (newInstructor: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/courses/${course.id}/instructor`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ instructor: newInstructor })
        }
      );

      const data = await response.json();
      if (data.success) {
        setCurrentInstructor(newInstructor);
        console.log(`✅ Instructor updated to: ${newInstructor}`);
      } else {
        alert(data.error || 'Failed to update instructor');
      }
    } catch (error) {
      console.error('Error updating instructor:', error);
      alert('Failed to update instructor');
    }
  };

  // Fetch materials and quizzes when component mounts
  useEffect(() => {
    fetchMaterials();
    fetchQuizzes();
    fetchEnrolledStudents();
    fetchStaff();
  }, [course.id]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/course-quizzes/${course.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        const transformedQuizzes = data.quizzes.map((q: any) => ({
          id: q.id,
          title: q.title,
          link: q.link,
          startDate: q.startDate,
          endDate: q.endDate,
          maxMarks: q.maxMarks || 5,
          status: "Available",
          submissions: 0
        }));
        
        setQuizzes(transformedQuizzes);
        console.log(`✅ Admin: Loaded ${transformedQuizzes.length} quizzes`);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/course-materials/${course.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Separate materials by type
        const papers = data.materials.filter((m: any) => m.type === 'paper');
        const ppts = data.materials.filter((m: any) => m.type === 'ppt');
        
        setQuestionPapers(papers.map((p: any) => ({
          id: p.id,
          title: p.title,
          year: new Date(p.uploadedAt).getFullYear().toString(),
          semester: course.semester.toString(),
          uploadedAt: new Date(p.uploadedAt).toISOString().split('T')[0],
          fileUrl: p.fileUrl
        })));
        
        // Update sessions with uploaded PPTs
        setSessions(prev => prev.map(s => {
          const sessionPPT = ppts.find((p: any) => p.title === s.title);
          if (sessionPPT) {
            return {
              ...s,
              pptUploaded: true,
              pptUrl: sessionPPT.fileUrl,
              uploadedBy: 'admin'
            };
          }
          return s;
        }));
        
        console.log(`✅ Admin: Loaded ${papers.length} papers, ${ppts.length} PPTs`);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  return (
    <div className="min-h-screen bg-university-light">
      {/* Header */}
      <div className="bg-white border-b border-university-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4" style={{ backgroundColor: 'var(--university-header-bg)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="gap-1 sm:gap-2 bg-white/20 text-white hover:bg-white/30 hover:text-white transition-all duration-200 active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Back to Courses
            </Button>
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <h1 className="text-lg sm:text-xl font-semibold text-white truncate">{course.title}</h1>
              <p className="text-sm text-white/80 truncate">{course.code} • Semester {course.semester}</p>
            </div>
            <Badge className={`${getStatusColor(course.status)} px-2 sm:px-4 py-1 sm:py-2 text-xs shrink-0`}>
              Admin View
            </Badge>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card 
            className="bg-white border-university cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-university-primary"
            onClick={handleViewStudents}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-university-secondary">Total Students</p>
                  <p className="text-2xl font-bold text-university-primary">
                    {enrolledStudents.length > 0 ? enrolledStudents.length : 5}
                  </p>
                  <p className="text-xs text-university-secondary mt-1">Click to view list</p>
                </div>
                <Users className="w-8 h-8 text-university-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-university">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-university-secondary">Materials Uploaded</p>
                  <p className="text-2xl font-bold text-university-primary">{questionPapers.length + sessions.filter(s => s.pptUploaded).length}</p>
                </div>
                <FileText className="w-8 h-8 text-university-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-university">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-university-secondary">Active Quizzes</p>
                  <p className="text-2xl font-bold text-university-primary">{quizzes.filter(q => q.status === "Published").length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-university-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-university-primary rounded-lg md:rounded-xl w-full p-1">
            <TabsTrigger value="quizzes" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 flex-1 font-medium">Quizzes</TabsTrigger>
            <TabsTrigger value="papers" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-2 md:px-4 py-2 md:py-2.5 flex-1 font-medium">Question Papers</TabsTrigger>
            <TabsTrigger value="sessions" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 flex-1 font-medium">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Overview tab content removed */}
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="space-y-6">
              <Card className="bg-white border-university">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-university-primary">Quiz Management</CardTitle>
                    <Button 
                      onClick={() => setQuizDialogOpen(true)}
                      className="bg-university-primary hover:bg-university-primary/90 text-white gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Quiz
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quizzes.length === 0 ? (
                      <div className="text-center py-12 text-university-secondary">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No quizzes created yet. Create your first quiz!</p>
                      </div>
                    ) : (
                      quizzes.map((quiz) => (
                        <Card key={quiz.id} className="bg-university-light border-university">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg text-university-primary">{quiz.title}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-university-primary text-white">
                                  {quiz.status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setViewResultsDialogOpen(true)}
                                  className="gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  Results
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                  <span className="text-university-secondary text-sm">Start Date:</span>
                                  <p className="text-university-primary font-medium">{quiz.startDate}</p>
                                </div>
                                <div>
                                  <span className="text-university-secondary text-sm">End Date:</span>
                                  <p className="text-university-primary font-medium">{quiz.endDate}</p>
                                </div>
                                <div>
                                  <span className="text-university-secondary text-sm">Max Marks:</span>
                                  <p className="text-university-primary font-medium">{quiz.maxMarks}</p>
                                </div>
                              </div>
                              {quiz.link && (
                                <div className="pt-2 border-t border-university-border">
                                  <span className="text-university-secondary text-sm">Quiz Link:</span>
                                  <p className="text-university-primary text-sm break-all mt-1">
                                    <a href={quiz.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {quiz.link}
                                    </a>
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="papers">
            <Card className="bg-white border-university">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-university-primary">Question Papers</CardTitle>
                  <Button 
                    onClick={() => {
                      setUploadType("paper");
                      setUploadDialogOpen(true);
                    }}
                    className="bg-university-primary hover:bg-university-primary/90 text-white gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Paper
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questionPapers.map((paper) => (
                    <div key={paper.id} className="flex items-center justify-between p-4 border border-university-border rounded-lg bg-white">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-university-primary p-2 rounded-lg">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-university-primary">{paper.title}</p>
                          <p className="text-sm text-university-secondary">
                            Year: {paper.year} | Uploaded: {paper.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-university-primary text-university-primary"
                          onClick={() => window.open(paper.fileUrl, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeletePaper(paper.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="bg-white border-university">
              <CardHeader>
                <CardTitle className="text-university-primary">Session PPTs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border border-university-border rounded-lg bg-white">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${session.pptUploaded ? 'bg-university-primary' : 'bg-gray-300'}`}>
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-university-primary">{session.title}</p>
                          <p className="text-sm text-university-secondary">{session.topic} • {session.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.pptUploaded ? (
                          <>
                            <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                const updated = sessions.map(s => 
                                  s.id === session.id ? { ...s, pptUploaded: false, pptUrl: null } : s
                                );
                                setSessions(updated);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setUploadType("ppt");
                              setUploadTitle(session.title);
                              setUploadDialogOpen(true);
                            }}
                            className="bg-university-primary hover:bg-university-primary/90 text-white gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Upload PPT
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload {uploadType === "paper" ? "Question Paper" : "Session PPT"}</DialogTitle>
            <DialogDescription>
              Upload files that students can download
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="upload-title">Title *</Label>
              <Input
                id="upload-title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter file title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="upload-description">Description (Optional)</Label>
              <Textarea
                id="upload-description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Add a description"
                rows={3}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="upload-file">File *</Label>
              <Input
                id="upload-file"
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              <p className="text-xs text-university-secondary mt-1">
                Accepted formats: PDF, PPT, PPTX, DOC, DOCX (Max 50MB)
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  setUploadFile(null);
                  setUploadTitle("");
                  setUploadDescription("");
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFileUpload}
                disabled={isUploading || !uploadFile || !uploadTitle}
                className="bg-university-primary hover:bg-university-primary/90 text-white"
              >
                {isUploading ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Quiz Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Create a quiz for students to take
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="quiz-title">Quiz Title *</Label>
                <Input
                  id="quiz-title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g., QUIZ 3 - Machine Learning"
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="quiz-link">Quiz Link (Google Forms/Quiz) *</Label>
                <Input
                  id="quiz-link"
                  type="url"
                  value={quizLink}
                  onChange={(e) => setQuizLink(e.target.value)}
                  placeholder="https://forms.google.com/..."
                  className="mt-1"
                />
                <p className="text-xs text-university-secondary mt-1">
                  Paste your Google Forms quiz link or any external quiz URL
                </p>
              </div>
              
              <div>
                <Label htmlFor="quiz-start">Start Date *</Label>
                <Input
                  id="quiz-start"
                  type="date"
                  value={quizStartDate}
                  onChange={(e) => setQuizStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="quiz-end">End Date *</Label>
                <Input
                  id="quiz-end"
                  type="date"
                  value={quizEndDate}
                  onChange={(e) => setQuizEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-university-border">
              <p className="text-sm text-university-secondary mb-2">
                ℹ️ Students will see a "Take Quiz" button that opens your quiz link in a new tab
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setQuizDialogOpen(false);
                  setQuizTitle("");
                  setQuizLink("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateQuiz}
                disabled={!quizTitle || !quizLink || !quizStartDate || !quizEndDate}
                className="bg-university-primary hover:bg-university-primary/90 text-white"
              >
                Create Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Results Dialog */}
      <Dialog open={viewResultsDialogOpen} onOpenChange={setViewResultsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quiz Results & Submissions</DialogTitle>
            <DialogDescription>
              View student submissions and scores
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-university-secondary">Total Submissions</p>
                  <p className="text-2xl font-bold text-university-primary">45/142</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-university-secondary">Average Score</p>
                  <p className="text-2xl font-bold text-university-primary">4.2/5.0</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-university-secondary">Pass Rate</p>
                  <p className="text-2xl font-bold text-university-primary">92%</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="border border-university-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-university-light">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-university-primary">Student ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-university-primary">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-university-primary">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-university-primary">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-university-border">
                  {Array.from({ length: 10 }, (_, i) => (
                    <tr key={i} className="hover:bg-university-light/50">
                      <td className="px-4 py-3 text-sm text-university-secondary">2021WA150{25 + i}</td>
                      <td className="px-4 py-3 text-sm text-university-primary">Student {i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-university-primary">
                        {(3.5 + Math.random() * 1.5).toFixed(1)}/5.0
                      </td>
                      <td className="px-4 py-3 text-sm text-university-secondary">
                        {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enrolled Students Dialog */}
      <Dialog open={showStudentsDialog} onOpenChange={setShowStudentsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Enrolled Students - {course.title}</DialogTitle>
            <DialogDescription>
              View all students enrolled in this course
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <Input
                placeholder="Search by name, ID, or email..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-university-secondary">Total Enrolled</p>
                  <p className="text-2xl font-bold text-university-primary">{enrolledStudents.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-university-secondary">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {enrolledStudents.filter((s: any) => s.status === 'active').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-university-secondary">Semester</p>
                  <p className="text-2xl font-bold text-university-primary">{course.semester}</p>
                </CardContent>
              </Card>
            </div>

            {/* Student List */}
            {loadingStudents ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-university-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-university-secondary">Loading students...</p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-university-secondary opacity-30" />
                <p className="text-university-secondary">
                  {studentSearchQuery ? "No students match your search" : "No students enrolled yet"}
                </p>
              </div>
            ) : (
              <div className="border border-university-border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-university-light sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-university-primary">Student ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-university-primary">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-university-primary">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-university-primary">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-university-border">
                    {filteredStudents.map((student: any, index: number) => (
                      <tr key={student.id || index} className="hover:bg-university-light/50">
                        <td className="px-4 py-3 text-sm font-medium text-university-secondary">{student.id}</td>
                        <td className="px-4 py-3 text-sm text-university-primary">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-university-secondary">{student.email}</td>
                        <td className="px-4 py-3">
                          <Badge className={student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {student.status || 'Active'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-university-border">
              <p className="text-sm text-university-secondary">
                Showing {filteredStudents.length} of {enrolledStudents.length} students
              </p>
              <Button
                variant="outline"
                onClick={() => setShowStudentsDialog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
