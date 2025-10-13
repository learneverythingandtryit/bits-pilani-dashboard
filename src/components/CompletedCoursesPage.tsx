import { ArrowLeft, Award, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface Course {
  id: string;
  title: string;
  code: string;
  semester: number;
  status: "completed" | "ongoing" | "upcoming";
  grades: {
    assignmentQuiz: number | null;
    midSemester: number | null;
    comprehensive: number | null;
    total: number | null;
    finalGrade: string | null;
  };
  progress?: number;
}

interface CompletedCoursesPageProps {
  courses: Course[];
  onBack: () => void;
}

export function CompletedCoursesPage({ courses, onBack }: CompletedCoursesPageProps) {
  // Filter completed courses and group by semester
  const completedCourses = courses.filter(c => c.status === "completed");
  
  // Calculate overall statistics
  const totalMarks = completedCourses.reduce((sum, course) => sum + (course.grades.total || 0), 0);
  const totalPossibleMarks = completedCourses.length * 100;
  const overallPercentage = totalPossibleMarks > 0 ? (totalMarks / totalPossibleMarks * 100) : 0;
  
  // Calculate GPA
  const gradePoints = {
    'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6, 'C-': 5, 'D': 4, 'F': 0
  };
  const totalGradePoints = completedCourses.reduce((sum, course) => 
    sum + (gradePoints[course.grades.finalGrade as keyof typeof gradePoints] || 0), 0
  );
  const gpa = completedCourses.length > 0 ? (totalGradePoints / completedCourses.length) : 0;
  
  // Group courses by semester
  const coursesBySemester = completedCourses.reduce((groups, course) => {
    const semester = course.semester;
    if (!groups[semester]) {
      groups[semester] = [];
    }
    groups[semester].push(course);
    return groups;
  }, {} as Record<number, Course[]>);
  
  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case 'A':
      case 'A-':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'B':
      case 'B-':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'C':
      case 'C-':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'D':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'F':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-university-primary">Completed Courses</h1>
          <p className="text-muted-foreground">Academic performance overview for completed courses</p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-university-light border-university">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-university-primary p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-university-primary">
                  {completedCourses.length}
                </p>
                <p className="text-sm text-university-secondary">Courses Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-university-light border-university">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-university-primary p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-university-primary">
                  {gpa.toFixed(1)}
                </p>
                <p className="text-sm text-university-secondary">Overall GPA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-university-light border-university">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-university-primary p-2 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-university-primary">
                  {totalMarks}/{totalPossibleMarks}
                </p>
                <p className="text-sm text-university-secondary">Total Marks ({overallPercentage.toFixed(1)}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses by Semester */}
      <div className="space-y-6">
        {Object.keys(coursesBySemester)
          .map(Number)
          .sort((a, b) => a - b)
          .map(semester => {
            const semesterCourses = coursesBySemester[semester];
            const semesterMarks = semesterCourses.reduce((sum, course) => sum + (course.grades.total || 0), 0);
            const semesterPossible = semesterCourses.length * 100;
            const semesterPercentage = semesterPossible > 0 ? (semesterMarks / semesterPossible * 100) : 0;
            
            return (
              <Card key={semester} className="p-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-university-primary">
                        Semester {semester}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {semesterCourses.length} courses • {semesterMarks}/{semesterPossible} marks ({semesterPercentage.toFixed(1)}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-24">
                        <Progress value={semesterPercentage} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {semesterCourses.map((course) => (
                      <div 
                        key={course.id}
                        className="p-4 border border-university-border rounded-lg bg-university-light"
                      >
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-university-primary mb-1">
                              {course.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{course.code}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">A&Q:</span>
                                <p className="font-medium">{course.grades.assignmentQuiz}/25</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Mid:</span>
                                <p className="font-medium">{course.grades.midSemester}/25</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Comp:</span>
                                <p className="font-medium">{course.grades.comprehensive}/50</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-university-border">
                              <div>
                                <span className="text-xs text-muted-foreground">Total:</span>
                                <p className="font-semibold text-university-primary">
                                  {course.grades.total}/100
                                </p>
                              </div>
                              <Badge className={getGradeColor(course.grades.finalGrade)}>
                                {course.grades.finalGrade}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}