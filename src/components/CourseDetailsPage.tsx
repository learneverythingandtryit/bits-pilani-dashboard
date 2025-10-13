import { useState, useEffect } from "react";
import { ArrowLeft, Download, Upload, Calendar, Clock, Users, Star, BookOpen, FileText, Video, RefreshCw } from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./ui/sonner";

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

interface CourseDetailsPageProps {
  course: Course;
  onBack: () => void;
}

export function CourseDetailsPage({ course, onBack }: CourseDetailsPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  // Fetch materials from backend
  const [questionPapers, setQuestionPapers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Fetch all materials when component mounts and set up auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchMaterials();
    fetchQuizzes();

    // Auto-refresh every 10 seconds to sync with admin uploads
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing materials and quizzes...');
      fetchMaterials();
      fetchQuizzes();
      setLastRefreshTime(Date.now());
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(refreshInterval);
  }, [course.id]);

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
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
        
        setQuestionPapers(papers);
        
        // Create session list with uploaded PPTs
        const sessionList = Array.from({ length: 12 }, (_, i) => {
          const sessionPPT = ppts.find((p: any) => p.title.includes(`Session ${i + 1}`));
          return {
            id: i + 1,
            title: `Session ${i + 1}`,
            topic: `Chapter ${i + 1} Topics`,
            date: `Week ${i + 1}`,
            pptUploaded: !!sessionPPT,
            pptUrl: sessionPPT?.fileUrl || null,
            pptData: sessionPPT || null
          };
        });
        
        setSessions(sessionList);
        
        // Check if materials changed and show toast notification
        const hasNewPapers = papers.length > questionPapers.length;
        const hasNewPPTs = ppts.length > sessions.filter(s => s.pptUploaded).length;
        
        if ((hasNewPapers || hasNewPPTs) && questionPapers.length > 0) {
          const newCount = (hasNewPapers ? papers.length - questionPapers.length : 0) + 
                          (hasNewPPTs ? ppts.length - sessions.filter(s => s.pptUploaded).length : 0);
          console.log(`🆕 New materials detected! ${papers.length} papers, ${ppts.length} PPTs`);
          toast.success(`${newCount} new material${newCount > 1 ? 's' : ''} uploaded!`, {
            description: 'New content is now available for download.',
            duration: 5000
          });
        } else {
          console.log(`✅ Student: Loaded ${papers.length} papers, ${ppts.length} PPTs`);
        }
      } else {
        console.error('Failed to fetch materials: HTTP', response.status);
        toast.error('Failed to load materials', {
          description: 'Please try refreshing the page.',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Connection error', {
        description: 'Could not sync with server. Retrying...',
        duration: 3000
      });
    } finally {
      setLoadingMaterials(false);
    }
  };

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
        
        // Transform backend quizzes to display format
        const transformedQuizzes = data.quizzes.map((q: any) => {
          const now = new Date();
          const start = new Date(q.startDate);
          const end = new Date(q.endDate);
          
          let status = "Not Available";
          if (now >= start && now <= end) {
            status = "Available";
          } else if (now > end) {
            status = "Completed";
          } else {
            status = "Upcoming";
          }
          
          return {
            id: q.id,
            title: q.title,
            link: q.link, // Google Forms link from admin
            startDate: new Date(q.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
            endDate: new Date(q.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
            maxMarks: q.maxMarks || 5,
            status: status,
            score: null // TODO: fetch from submissions if needed
          };
        });
        
        // Check for new quizzes and notify
        const hasNewQuizzes = transformedQuizzes.length > quizzes.length;
        if (hasNewQuizzes && quizzes.length > 0) {
          const newCount = transformedQuizzes.length - quizzes.length;
          console.log(`🆕 ${newCount} new quiz${newCount > 1 ? 'zes' : ''} added!`);
          toast.info(`${newCount} new quiz${newCount > 1 ? 'zes' : ''} available!`, {
            description: 'Check the Quizzes tab to take them.',
            duration: 5000
          });
        }
        
        setQuizzes(transformedQuizzes);
        console.log(`✅ Student: Loaded ${transformedQuizzes.length} quizzes from backend`);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes([]); // Empty on error
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "upcoming": return "bg-orange-500 text-white";
      case "ongoing": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A-') return 'bg-green-100 text-green-800';
    if (grade === 'B' || grade === 'B-') return 'bg-blue-100 text-blue-800';
    if (grade === 'C' || grade === 'C-') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // ONLY use backend quiz data - NO FALLBACK
  const getQuizData = () => {
    return quizzes; // Only return what admin uploaded - NO HARDCODED DATA
  };



  const courseAverage = course.status === "completed" && course.grades.total 
    ? Math.round((course.grades.total / 100) * 100) 
    : course.progress || 0;

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
              className="gap-1 sm:gap-2 bg-white/20 dark:bg-university-primary text-white dark:text-white hover:bg-white/30 dark:hover:bg-university-primary/90 hover:text-white dark:hover:text-white transition-all duration-200 active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Back to Courses</span>
              <span className="xs:hidden">Back</span>
            </Button>
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <h1 className="text-lg sm:text-xl font-semibold text-white dark:text-university-primary truncate">{course.title}</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-white/80 dark:text-university-primary/80 truncate">{course.code} • Semester {course.semester}</p>
                {loadingMaterials && (
                  <span className="text-xs text-white/60 flex items-center gap-1">
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></span>
                    Syncing...
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  fetchMaterials();
                  fetchQuizzes();
                  setLastRefreshTime(Date.now());
                }}
                disabled={loadingMaterials}
                className="text-white hover:bg-white/20 gap-1"
                title="Refresh materials"
              >
                <RefreshCw className={`w-3 h-3 ${loadingMaterials ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-xs">Sync</span>
              </Button>
              <Badge className={`${getStatusColor(course.status)} px-2 sm:px-4 py-1 sm:py-2 text-xs`}>
                {course.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">


        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-university-primary rounded-lg md:rounded-xl w-full p-1">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 flex-1 font-medium">Overview</TabsTrigger>
            <TabsTrigger value="quizzes" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 flex-1 font-medium">Quizzes</TabsTrigger>
            <TabsTrigger value="papers" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-2 md:px-4 py-2 md:py-2.5 flex-1 font-medium">Question Papers</TabsTrigger>
            <TabsTrigger value="sessions" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 flex-1 font-medium">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {course.status === "completed" && course.grades.finalGrade && (
                <Card className="bg-university-light border-university">
                  <CardHeader>
                    <CardTitle className="text-university-primary">Academic Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <span className="text-university-secondary text-sm">Assignment/Quiz:</span>
                        <p className="text-university-primary font-semibold text-lg">{course.grades.assignmentQuiz}/25</p>
                      </div>
                      <div>
                        <span className="text-university-secondary text-sm">Mid Semester:</span>
                        <p className="text-university-primary font-semibold text-lg">{course.grades.midSemester}/25</p>
                      </div>
                      <div>
                        <span className="text-university-secondary text-sm">Comprehensive:</span>
                        <p className="text-university-primary font-semibold text-lg">{course.grades.comprehensive}/50</p>
                      </div>
                      <div>
                        <span className="text-university-secondary text-sm">Total Marks:</span>
                        <p className="text-university-primary font-semibold text-lg">{course.grades.total}/100</p>
                      </div>
                      <div>
                        <span className="text-university-secondary text-sm">Final Grade: </span>
                        <span className="text-university-primary font-semibold text-lg">
                          {course.grades.finalGrade}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {course.status === "ongoing" && (
                <Card className="bg-university-light border-university">
                  <CardHeader>
                    <CardTitle className="text-university-primary">Current Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-university-secondary">Course Progress:</span>
                        <span className="text-university-primary font-semibold">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress || 0} className="h-3" />
                      <p className="text-sm text-university-secondary">
                        Grades will be available after completion of assessments.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {course.status === "upcoming" && (
                <Card className="bg-university-light border-university">
                  <CardHeader>
                    <CardTitle className="text-university-primary">Course Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-university-secondary">
                      This course is scheduled for Semester {course.semester}. 
                      Course materials and assessments will be available when the semester begins.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="space-y-6">
              {getQuizData().length === 0 ? (
                <Card className="bg-university-light border-university">
                  <CardContent className="py-12">
                    <div className="text-center text-university-secondary">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No quizzes uploaded yet.</p>
                      <p className="text-xs mt-1">Your instructor will upload quizzes here when available.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                getQuizData().map((quiz) => (
                  <Card key={quiz.id} className="bg-university-light border-university">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-university-primary">{quiz.title}</CardTitle>
                        <Badge className={
                          quiz.status === "Completed" ? "bg-green-500 text-white" :
                          quiz.status === "Available" ? "bg-university-primary text-white" :
                          quiz.status === "Upcoming" ? "bg-orange-500 text-white" :
                          "bg-gray-500 text-white"
                        }>
                          {quiz.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <p className="text-university-primary font-medium">{quiz.maxMarks} marks</p>
                          </div>
                        </div>
                        
                        {quiz.status === "Available" && (
                          <div className="pt-4 border-t border-university-border">
                            <Button 
                              className="bg-university-primary hover:bg-university-primary/90 text-white gap-2 w-full sm:w-auto"
                              onClick={() => {
                                window.open(quiz.link, "_blank");
                              }}
                            >
                              <FileText className="w-4 h-4" />
                              Take Quiz (Opens in New Tab)
                            </Button>
                          </div>
                        )}
                        
                        {quiz.status === "Upcoming" && (
                          <div className="pt-4 border-t border-university-border">
                            <p className="text-sm text-university-secondary">
                              This quiz will be available from {quiz.startDate}
                            </p>
                          </div>
                        )}
                        
                        {quiz.status === "Completed" && (
                          <div className="pt-4 border-t border-university-border">
                            <p className="text-sm text-university-secondary">
                              This quiz has ended. Contact your instructor for any queries.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="papers">
            <Card className="bg-university-light border-university">
              <CardHeader>
                <CardTitle className="text-university-primary">Previous Question Papers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questionPapers.length === 0 ? (
                    <div className="text-center py-12 text-university-secondary">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No question papers uploaded yet.</p>
                      <p className="text-xs mt-1">Check back later for updates from your instructor.</p>
                    </div>
                  ) : (
                    questionPapers.map((paper) => (
                      <div key={paper.id} className="flex items-center justify-between p-4 border border-university-border rounded-lg bg-[rgba(255,255,255,0)]">
                        <div className="flex items-center gap-3">
                          <div className="bg-university-primary p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-university-primary">{paper.title}</p>
                            <p className="text-sm text-university-secondary">Year: {paper.year} | Semester: {paper.semester}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-university-primary text-university-primary hover:bg-university-primary hover:text-white"
                          onClick={() => window.open(paper.fileUrl, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="bg-university-light border-university">
              <CardHeader>
                <CardTitle className="text-university-primary">Session Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border border-university-border rounded-lg bg-[rgba(255,249,249,0)]">
                      <div className="flex items-center gap-3">
                        <div className="bg-university-primary p-2 rounded-lg">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-university-primary">{session.title}: {session.topic}</p>
                          <p className="text-sm text-university-secondary">{session.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.pptUploaded ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 border-university-primary text-university-primary hover:bg-university-primary hover:text-white"
                            onClick={() => window.open(session.pptUrl, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                            Download PPT
                          </Button>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600">Not Uploaded</Badge>
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
      <Toaster />
    </div>
  );
}