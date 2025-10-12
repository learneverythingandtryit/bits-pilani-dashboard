import { useState } from "react";
import { BookOpen, Clock, Users, FileText, Calendar, Star, Filter, Search, ExternalLink, Grid, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { CourseDetailsPage } from "./CourseDetailsPage";
import { CourseCard } from "./CourseCard";
import { cn } from "./ui/utils";

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

interface CoursesPageProps {
  courses: Course[];
  onCourseClick?: (course: Course) => void;
}

export function CoursesPage({ courses, onCourseClick }: CoursesPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetailsPage, setShowDetailsPage] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showSemesterView, setShowSemesterView] = useState(false);
  const [cardViewMode, setCardViewMode] = useState<"progress" | "semesters" | null>(null);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle card-based filtering
    if (cardViewMode === "progress") {
      return matchesSearch; // Show all courses for progress view (will be grouped later)
    }
    
    // Handle regular filtering when no card view is active
    const matchesFilter = filterStatus === "all" || course.status === filterStatus;
    const matchesSemester = selectedSemester === "all" || course.semester.toString() === selectedSemester;
    
    return matchesSearch && matchesFilter && matchesSemester;
  });

  // Get unique semesters for filter dropdown
  const availableSemesters = [...new Set(courses.map(c => c.semester))].sort((a, b) => a - b);

  // Use courses as-is since they now have the proper structure
  const enhancedCourses = courses;

  const handleCourseDetails = (course: Course) => {
    // Call the tracking function if provided
    if (onCourseClick) {
      onCourseClick(course);
    }
    
    setSelectedCourse(course);
    setShowDetailsPage(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 dark:bg-green-600 text-white";
      case "upcoming": return "bg-orange-500 dark:bg-orange-600 text-white";
      case "ongoing": return "bg-blue-500 dark:bg-blue-600 text-white";
      default: return "bg-gray-500 dark:bg-gray-600 text-white";
    }
  };

  if (showDetailsPage && selectedCourse) {
    return (
      <CourseDetailsPage 
        course={selectedCourse} 
        onBack={() => {
          setShowDetailsPage(false);
          setSelectedCourse(null);
        }}
      />
    );
  }

  // Semester view component
  const SemesterView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => {
            setShowSemesterView(false);
            setCardViewMode(null);
          }}
          className="flex items-center gap-2"
        >
          ← Back to Courses
        </Button>
        <h2 className="text-xl font-semibold text-university-primary">Semester-wise Course View</h2>
      </div>
      
      {availableSemesters.map(semester => {
        const semesterCourses = courses.filter(c => c.semester === semester);
        return (
          <Card key={semester} className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-university-primary">Semester {semester}</CardTitle>
              <p className="text-sm text-muted-foreground">{semesterCourses.length} courses</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesterCourses.map((course) => (
                  <div 
                    key={course.id}
                    className="p-4 border border-university-border rounded-lg cursor-pointer hover:bg-university-light transition-colors"
                    onClick={() => handleCourseDetails(course)}
                  >
                    <h4 className="font-medium text-university-primary mb-1">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{course.code}</p>
                    <Badge className={getStatusColor(course.status)}>
                      {course.status === "completed" ? "Completed" : 
                       course.status === "ongoing" ? "Ongoing" : 
                       course.status === "upcoming" ? "Upcoming" : course.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Progress view component
  const ProgressView = () => {
    const completedCourses = courses.filter(c => c.status === "completed");
    const ongoingCourses = courses.filter(c => c.status === "ongoing");
    const upcomingCourses = courses.filter(c => c.status === "upcoming");

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => {
              setCardViewMode(null);
              setFilterStatus("all");
            }}
            className="flex items-center gap-2"
          >
            ← Back to All Courses
          </Button>
          <h2 className="text-xl font-semibold text-university-primary">Courses by Progress Status</h2>
        </div>

        {/* Completed Courses */}
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-green-600 dark:text-green-400 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Completed Courses ({completedCourses.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Courses you have successfully completed</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedCourses.map((course) => (
                <div 
                  key={course.id}
                  className="p-4 border border-green-200 dark:border-green-800 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  onClick={() => handleCourseDetails(course)}
                >
                  <h4 className="font-medium text-university-primary mb-1">{course.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{course.code} • Semester {course.semester}</p>
                  {course.grades.finalGrade && (
                    <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                      Grade: {course.grades.finalGrade}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ongoing Courses */}
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Ongoing Courses ({ongoingCourses.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Courses currently in progress</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ongoingCourses.map((course) => (
                <div 
                  key={course.id}
                  className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  onClick={() => handleCourseDetails(course)}
                >
                  <h4 className="font-medium text-university-primary mb-1">{course.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{course.code} • Semester {course.semester}</p>
                  {course.progress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Courses */}
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Upcoming Courses ({upcomingCourses.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Courses scheduled for future semesters</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingCourses.map((course) => (
                <div 
                  key={course.id}
                  className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  onClick={() => handleCourseDetails(course)}
                >
                  <h4 className="font-medium text-university-primary mb-1">{course.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{course.code} • Semester {course.semester}</p>
                  <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400">
                    Upcoming
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Show semester view if requested
  if (showSemesterView && cardViewMode === "semesters") {
    return (
      <div className="space-y-6">
        <SemesterView />
      </div>
    );
  }

  // Show progress view if requested
  if (cardViewMode === "progress") {
    return (
      <div className="space-y-6">
        <ProgressView />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[rgba(0,0,0,0)]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            {cardViewMode && cardViewMode !== "semesters" && cardViewMode !== "progress" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCardViewMode(null);
                  setSelectedSemester("all");
                  setFilterStatus("all");
                }}
                className="flex items-center gap-2"
              >
                ← Back to All
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-university-primary">My Courses</h1>
              <p className="text-muted-foreground mt-1">Manage and track your academic courses</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64 no-underline text-[rgba(42,53,78,1)]"
            />
          </div>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm bg-input text-foreground min-w-0"
          >
            <option value="all">All Semesters</option>
            {availableSemesters.map(sem => (
              <option key={sem} value={sem.toString()}>Semester {sem}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-lg"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-lg"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      {/* Degree Completion Progress */}
      <div className="flex justify-center mb-8">
        <Card className="bg-university-light border-university shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-xl font-semibold text-university-primary mb-2">
                  M.Tech in Software System
                </h3>
                <p className="text-sm text-university-secondary">
                  {courses.filter(c => c.status === 'completed').length} of {courses.length} courses completed
                </p>
              </div>

              {/* Progress Section */}
              <div className="space-y-3">
                {/* Percentage Text */}
                <div className="text-center">
                  <span className="text-base font-semibold text-university-primary">
                    {Math.round((courses.filter(c => c.status === 'completed').length / courses.length) * 100)}% Completed
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full h-5 dark:bg-gray-700 rounded-full overflow-hidden bg-[rgba(229,231,235,0.9)]">
                    <div 
                      className="h-full bg-university-primary rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(courses.filter(c => c.status === 'completed').length / courses.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Badge */}
                <div className="flex justify-center mt-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-2 rounded-full">
                    <span className="text-sm font-semibold text-[rgba(36,84,141,1)]">
                      {(() => {
                        const completedCourses = courses.filter(c => c.status === 'completed').length;
                        const totalCourses = courses.length;
                        const percentage = Math.round((completedCourses / totalCourses) * 100);
                        
                        if (percentage === 0) return "Getting Started 🚀";
                        if (percentage <= 25) return "Just Beginning 📚";
                        if (percentage <= 50) return "Halfway There 🎉";
                        if (percentage <= 75) return "Three Quarters 💪";
                        if (percentage < 100) return "Almost Done 🎯";
                        return "Completed! 🎓";
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList className="bg-university-primary rounded-lg md:rounded-xl w-full p-1">
          <TabsTrigger value="all" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 flex-1 font-medium">All Courses</TabsTrigger>
          <TabsTrigger value="ongoing" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 flex-1 font-medium">Ongoing</TabsTrigger>
          <TabsTrigger value="completed" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 flex-1 font-medium">Completed</TabsTrigger>
          <TabsTrigger value="upcoming" className="text-white data-[state=active]:bg-white data-[state=active]:text-black rounded-md md:rounded-xl text-sm md:text-base px-3 md:px-4 py-2 md:py-2.5 flex-1 font-medium">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="mt-6">
          <div className={cn(
            "gap-6",
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "space-y-4"
          )}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                viewMode={viewMode}
                onCourseClick={handleCourseDetails}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Course Details Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-university-primary">
              {selectedCourse?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedCourse?.code} - Semester {selectedCourse?.semester}
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Course Code</span>
                  <p className="text-university-primary font-medium">{selectedCourse.code}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Semester:</span>
                  <p className="text-university-primary font-medium">{selectedCourse.semester}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(selectedCourse.status)}>
                    {selectedCourse.status === "completed" ? "Completed" : 
                     selectedCourse.status === "ongoing" ? "Ongoing" : 
                     selectedCourse.status === "upcoming" ? "Upcoming" : selectedCourse.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Credits</span>
                  <p className="text-university-primary font-medium">3.0</p>
                </div>
              </div>
              
              {selectedCourse.status === "completed" && selectedCourse.grades.finalGrade && (
                <div>
                  <h4 className="font-medium text-university-primary mb-3">Academic Performance</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Assignment & Quiz</span>
                        <p className="text-card-foreground font-medium">{selectedCourse.grades.assignmentQuiz}/25</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mid Semester</span>
                        <p className="text-card-foreground font-medium">{selectedCourse.grades.midSemester}/25</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Comprehensive</span>
                        <p className="text-card-foreground font-medium">{selectedCourse.grades.comprehensive}/50</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Marks</span>
                        <p className="text-university-primary font-semibold">{selectedCourse.grades.total}/100</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Final Grade</span>
                        <div className="mt-1">
                          <Badge className={`font-semibold ${
                            selectedCourse.grades.finalGrade === 'A' || selectedCourse.grades.finalGrade === 'A-' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                            selectedCourse.grades.finalGrade === 'B' || selectedCourse.grades.finalGrade === 'B-' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                            selectedCourse.grades.finalGrade === 'C' || selectedCourse.grades.finalGrade === 'C-' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                            'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                          }`}>
                            {selectedCourse.grades.finalGrade}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedCourse.status === "ongoing" && (
                <div>
                  <h4 className="font-medium text-university-primary mb-3">Current Progress</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="space-y-3">
                      {selectedCourse.progress && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Course Progress</span>
                            <span className="text-university-primary font-medium">{selectedCourse.progress}%</span>
                          </div>
                          <Progress value={selectedCourse.progress} className="h-2" />
                        </>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Grades will be available after mid-semester and final examinations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedCourse.status === "upcoming" && (
                <div>
                  <h4 className="font-medium text-university-primary mb-3">Course Information</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      This course is scheduled for Semester {selectedCourse.semester}. 
                      Course materials and registration details will be available closer to the semester start date.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}