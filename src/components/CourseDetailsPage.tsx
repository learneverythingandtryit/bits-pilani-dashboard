import { useState } from "react";
import { ArrowLeft, Download, Upload, Calendar, Clock, Users, Star, BookOpen, FileText, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

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

  // Sample quiz data based on course status
  const getQuizData = () => {
    if (course.status === "completed") {
      return [
        {
          id: 1,
          title: "QUIZ 1",
          startDate: "8 July 2022",
          endDate: "20 July 2022",
          timeLimit: "45 Minutes",
          questions: 20,
          maxMarks: 5,
          status: "Completed",
          score: 4.5,
          extended: "25th July 2022"
        },
        {
          id: 2,
          title: "QUIZ 2", 
          startDate: "15 August 2022",
          endDate: "27 August 2022",
          timeLimit: "45 Minutes",
          questions: 20,
          maxMarks: 5,
          status: "Completed",
          score: 4.0
        },
        {
          id: 3,
          title: "QUIZ 3",
          startDate: "10 September 2022", 
          endDate: "22 September 2022",
          timeLimit: "45 Minutes",
          questions: 20,
          maxMarks: 5,
          status: "Completed",
          score: 3.5
        }
      ];
    } else if (course.status === "ongoing") {
      return [
        {
          id: 1,
          title: "QUIZ 1",
          startDate: "8 July 2024",
          endDate: "20 July 2024", 
          timeLimit: "45 Minutes",
          questions: 20,
          maxMarks: 5,
          status: "Completed",
          score: 4.5,
          extended: "25th July 2024"
        },
        {
          id: 2,
          title: "QUIZ 2",
          startDate: "15 August 2024",
          endDate: "27 August 2024",
          timeLimit: "45 Minutes", 
          questions: 20,
          maxMarks: 5,
          status: "Available",
          score: null
        },
        {
          id: 3,
          title: "QUIZ 3",
          startDate: "10 September 2024",
          endDate: "22 September 2024",
          timeLimit: "45 Minutes",
          questions: 20,
          maxMarks: 5,
          status: "Upcoming",
          score: null
        }
      ];
    } else {
      return [
        {
          id: 1,
          title: "QUIZ 1",
          startDate: "TBD",
          endDate: "TBD",
          timeLimit: "45 Minutes",
          questions: 20,
          maxMarks: 5,
          status: "Not Available",
          score: null
        },
        {
          id: 2,
          title: "QUIZ 2", 
          startDate: "TBD",
          endDate: "TBD",
          timeLimit: "45 Minutes",
          questions: 20,
          maxMarks: 5,
          status: "Not Available",
          score: null
        },
        {
          id: 3,
          title: "QUIZ 3",
          startDate: "TBD", 
          endDate: "TBD",
          timeLimit: "45 Minutes",
          questions: 20,
          maxMarks: 5,
          status: "Not Available",
          score: null
        }
      ];
    }
  };

  const questionPapers = [
    { id: 1, title: "Mid-Semester Exam 2023", year: "2023", semester: "II", downloadUrl: "#" },
    { id: 2, title: "Comprehensive Exam 2023", year: "2023", semester: "II", downloadUrl: "#" },
    { id: 3, title: "Mid-Semester Exam 2022", year: "2022", semester: "II", downloadUrl: "#" },
    { id: 4, title: "Comprehensive Exam 2022", year: "2022", semester: "II", downloadUrl: "#" },
    { id: 5, title: "Mid-Semester Exam 2021", year: "2021", semester: "II", downloadUrl: "#" }
  ];

  const sessions = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Session ${i + 1}`,
    topic: `Chapter ${i + 1} Topics`,
    date: `Week ${i + 1}`,
    pptUploaded: i < 8, // First 8 sessions have PPT uploaded
    pptUrl: i < 8 ? "#" : null
  }));

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
              <p className="text-sm text-white/80 dark:text-university-primary/80 truncate">{course.code} • Semester {course.semester}</p>
            </div>
            <Badge className={`${getStatusColor(course.status)} px-2 sm:px-4 py-1 sm:py-2 text-xs shrink-0`}>
              {course.status}
            </Badge>
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
              {getQuizData().map((quiz) => (
                <Card key={quiz.id} className="bg-university-light border-university">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-university-primary">{quiz.title}</CardTitle>
                      <Badge className={
                        quiz.status === "Completed" ? "bg-university-primary text-white" :
                        quiz.status === "Available" ? "bg-university-primary text-white" :
                        quiz.status === "Upcoming" ? "bg-university-secondary text-white" :
                        "bg-university-accent text-white"
                      }>
                        {quiz.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-university-secondary text-sm">Starts:</span>
                          <p className="text-university-primary font-medium">{quiz.startDate}</p>
                        </div>
                        <div>
                          <span className="text-university-secondary text-sm">Ends:</span>
                          <p className="text-university-primary font-medium">{quiz.endDate}</p>
                        </div>
                        <div>
                          <span className="text-university-secondary text-sm">TIME LIMIT:</span>
                          <p className="text-university-primary font-medium">{quiz.timeLimit}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-university-secondary text-sm">No. of questions:</span>
                          <p className="text-university-primary font-medium">{quiz.questions}</p>
                        </div>
                        <div>
                          <span className="text-university-secondary text-sm">Max marks:</span>
                          <p className="text-university-primary font-medium">{quiz.maxMarks}</p>
                        </div>
                        {quiz.score !== null && (
                          <div>
                            <span className="text-university-secondary text-sm">Your Score:</span>
                            <p className="text-university-primary font-semibold">{quiz.score}/{quiz.maxMarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {quiz.extended && (
                      <div className="mt-4 p-3 bg-university-light border border-university rounded-lg">
                        <p className="text-university-primary font-medium">{quiz.title} extended till {quiz.extended}</p>
                      </div>
                    )}
                    
                    <div className="mt-6 p-4 bg-university-light border border-university rounded-lg">
                      <h4 className="font-medium text-university-primary mb-2">Note:</h4>
                      <ul className="text-university-secondary text-sm space-y-1">
                        <li>• Please note that only one attempt is allowed and you need to submit before it expires.</li>
                        <li>• Power outage, internet connectivity should not be the reasons for any auto submissions.</li>
                        <li>• Last day/minute attempts may lead to technical issues with the portal due to heavy load. Hence all are advised to attempt well in advance.</li>
                        <li>• Ensure, everything is perfect while attempting the quiz. Makeups are not provided whatever may be the reason.</li>
                      </ul>
                    </div>
                    
                    {quiz.status === "Available" && (
                      <div className="mt-4">
                        <Button className="bg-university-primary hover:bg-university-primary/90 text-white">
                          Start Quiz
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="papers">
            <Card className="bg-university-light border-university">
              <CardHeader>
                <CardTitle className="text-university-primary">Previous Question Papers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questionPapers.map((paper) => (
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
                      <Button variant="outline" size="sm" className="gap-2 border-university-primary text-university-primary hover:bg-university-primary hover:text-white">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  ))}
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
                          <Button variant="outline" size="sm" className="gap-2 border-university-primary text-university-primary hover:bg-university-primary hover:text-white">
                            <Download className="w-4 h-4" />
                            Download PPT
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input 
                              type="file" 
                              accept=".ppt,.pptx,.pdf"
                              className="w-32 text-xs border-university-border"
                              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            />
                            <Button size="sm" className="gap-2 bg-university-primary hover:bg-university-primary/90 text-white">
                              <Upload className="w-4 h-4" />
                              Upload
                            </Button>
                          </div>
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
    </div>
  );
}