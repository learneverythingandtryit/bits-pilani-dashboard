import { Card } from "./ui/card";
import { TrendingUp, BookOpen, Calendar, Award } from "lucide-react";

interface Course {
  id: string;
  title: string;
  code: string;
  semester: number;
  status: "completed" | "ongoing" | "upcoming";
  grades?: {
    assignmentQuiz: number | null;
    midSemester: number | null;
    comprehensive: number | null;
    total: number | null;
    finalGrade: string | null;
  };
  progress?: number;
}

interface DashboardStatsProps {
  courses: Course[];
  onCompletedCoursesClick?: () => void;
  onCoursesTabClick?: () => void;
  onCurrentSemesterClick?: () => void;
}

export function DashboardStats({ courses, onCompletedCoursesClick, onCoursesTabClick, onCurrentSemesterClick }: DashboardStatsProps) {
  // Calculate real statistics from course data
  const completedCourses = courses.filter(c => c.status === "completed");
  const ongoingCourses = courses.filter(c => c.status === "ongoing");
  const upcomingCourses = courses.filter(c => c.status === "upcoming");
  
  // Calculate GPA from completed courses
  const completedGrades = completedCourses.filter(c => c.grades?.total !== null);
  const totalPoints = completedGrades.reduce((sum, course) => {
    const grade = course.grades?.finalGrade;
    const gradePoints = {
      'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6, 'C-': 5, 'D': 4, 'F': 0
    };
    return sum + (gradePoints[grade as keyof typeof gradePoints] || 0);
  }, 0);
  const gpa = completedGrades.length > 0 ? (totalPoints / completedGrades.length).toFixed(1) : "0.0";
  
  // Calculate current semester progress
  const currentSemesterProgress = ongoingCourses.length > 0 
    ? Math.round(ongoingCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / ongoingCourses.length)
    : 0;
  
  const stats = [
    {
      id: 1,
      title: "Overall GPA",
      value: gpa,
      change: `${completedCourses.length} completed courses`,
      changeType: parseFloat(gpa) >= 7.5 ? "positive" : parseFloat(gpa) >= 6.0 ? "neutral" : "negative",
      icon: TrendingUp,
      color: "bg-university-primary/5",
      bgColor: "bg-university-primary"
    },
    {
      id: 2,
      title: "Completed Courses",
      value: completedCourses.length.toString(),
      change: `${ongoingCourses.length} in progress`,
      changeType: "neutral",
      icon: BookOpen,
      color: "bg-green-500/5",
      bgColor: "bg-green-500"
    },
    {
      id: 3,
      title: "Progress",
      value: `${currentSemesterProgress}%`,
      change: `Semester ${Math.max(...ongoingCourses.map(c => c.semester), 0)} ongoing`,
      changeType: currentSemesterProgress >= 70 ? "positive" : "neutral",
      icon: Calendar,
      color: "bg-blue-500/5",
      bgColor: "bg-blue-500"
    }
  ];

  return null;
}