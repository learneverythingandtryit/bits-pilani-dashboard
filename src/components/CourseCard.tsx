import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Clock, Users, BookOpen, Play } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    code: string;
    semester: number;
    progress?: number;
    status: "ongoing" | "completed" | "upcoming";
    grades: {
      assignmentQuiz: number | null;
      midSemester: number | null;
      comprehensive: number | null;
      total: number | null;
      finalGrade: string | null;
    };
  };
  viewMode: "grid" | "list";
  onCourseClick?: (course: CourseCardProps['course']) => void;
}

export function CourseCard({ course, viewMode, onCourseClick }: CourseCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "upcoming": return "bg-orange-500 text-white";
      case "ongoing": return "bg-blue-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  // Course image mapping - each course gets a unique, high-quality image
  const getCourseImage = (courseTitle: string, courseCode: string) => {
    const title = courseTitle.toLowerCase();
    const code = courseCode.toLowerCase();
    
    // Exact course matching for unique images
    
    // SEMESTER 1
    if (title.includes('computer programming')) {
      return "https://images.unsplash.com/photo-1568716353609-12ddc5c67f04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGNvZGUlMjBlZGl0b3IlMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NTc2OTg3MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('digital electronics') && title.includes('micropro')) {
      return "https://images.unsplash.com/photo-1651964178942-ccecb82a18be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXJjdWl0JTIwYm9hcmQlMjBtaWNyb3Byb2Nlc3NvciUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzU3Njk4NzM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('discrete struc')) {
      return "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMGVxdWF0aW9ucyUyMGJsYWNrYm9hcmR8ZW58MXx8fHwxNzU3NjQyNzkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('linear algebra')) {
      return "https://images.unsplash.com/photo-1754304342349-ac409efb67c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9iYWJpbGl0eSUyMHN0YXRpc3RpY3MlMjBncmFwaHMlMjBjaGFydHN8ZW58MXx8fHwxNzU3Njk4NzU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    
    // SEMESTER 2
    if (title.includes('computer sys') && title.includes('architecture')) {
      return "https://images.unsplash.com/photo-1739168283356-d1b9bd1c0954?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGFyY2hpdGVjdHVyZSUyMGNwdSUyMGRlc2lnbnxlbnwxfHx8fDE3NTc2OTg3NDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('data structures') && title.includes('algorithms')) {
      return "https://images.unsplash.com/photo-1664854953181-b12e6dda8b7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc3RydWN0dXJlcyUyMHZpc3VhbGl6YXRpb258ZW58MXx8fHwxNzU3Njk4NzM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('object oriented programming')) {
      return "https://images.unsplash.com/photo-1727522974735-44251dfe61b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVTUwlMjBjbGFzcyUyMGRpYWdyYW0lMjBkZXNpZ258ZW58MXx8fHwxNzU3Njk4NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('systems programming')) {
      return "https://images.unsplash.com/photo-1701099153587-6f28b448ff0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXJtaW5hbCUyMGNvbW1hbmQlMjBsaW5lJTIwaW50ZXJmYWNlfGVufDF8fHx8MTc1NzY5ODc0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    
    // SEMESTER 3
    if (title.includes('database systems')) {
      return "https://images.unsplash.com/photo-1568232424884-6705801ff136?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcWwlMjBkYXRhYmFzZSUyMHRhYmxlJTIwcXVlcnl8ZW58MXx8fHwxNzU3Njk4NzUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('operating systems')) {
      return "https://images.unsplash.com/photo-1553427054-3cf4c0712aa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVyYXRpbmclMjBzeXN0ZW0lMjBsaW51eCUyMHRlcm1pbmFsfGVufDF8fHx8MTc1NzY5ODc1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('probability') && title.includes('statistics')) {
      return "https://images.unsplash.com/photo-1754304342560-4391cb2656bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMHN0YXRpc3RpY3MlMjBhbGdvcml0aG1zfGVufDF8fHx8MTc1NzY5ODU2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('software engineering')) {
      return "https://images.unsplash.com/photo-1573165706511-3ffde6ef1fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGVuZ2luZWVyaW5nJTIwdGVhbSUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzU3NjkzNDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    
    // SEMESTER 4 (Current/Ongoing)
    if (title.includes('computer design')) {
      return "https://images.unsplash.com/photo-1666037783574-18c608f9940f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGNoaXAlMjBtb3RoZXJib2FyZCUyMG1hY3JvfGVufDF8fHx8MTc1NzY5ODc2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('computer networks')) {
      return "https://images.unsplash.com/photo-1582648872106-71a64a70af6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWJlciUyMG9wdGljJTIwbmV0d29yayUyMGNhYmxlc3xlbnwxfHx8fDE3NTc2OTg3Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('object oriented analysis')) {
      return "https://images.unsplash.com/photo-1727522974735-44251dfe61b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVTUwlMjBjbGFzcyUyMGRpYWdyYW0lMjBkZXNpZ258ZW58MXx8fHwxNzU3Njk4NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('software testing')) {
      return "https://images.unsplash.com/photo-1568716353609-12ddc5c67f04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMHRlc3RpbmclMjBidWclMjBmaXhpbmclMjBjb2RlfGVufDF8fHx8MTc1NzY5ODc3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    
    // SEMESTER 5 (Upcoming)
    if (title.includes('cloud computing')) {
      return "https://images.unsplash.com/photo-1667264501379-c1537934c7ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbG91ZCUyMHNlcnZlciUyMGRhdGFjZW50ZXIlMjByYWNrc3xlbnwxfHx8fDE3NTc2OTg3Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('data mining')) {
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwbWluaW5nJTIwYW5hbHl0aWNzJTIwdmlzdWFsaXphdGlvbnxlbnwxfHx8fDE3NTc2OTg3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('distributed computing')) {
      return "https://images.unsplash.com/photo-1664526936810-ec0856d31b92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXN0cmlidXRlZCUyMGNvbXB1dGluZyUyMG5ldHdvcmslMjBub2Rlc3xlbnwxfHx8fDE3NTc2OTg3ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('middleware')) {
      return "https://images.unsplash.com/photo-1636586108931-a8b9b8796ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWRkbGV3YXJlJTIwQVBJJTIwaW50ZWdyYXRpb24lMjBjb2RlfGVufDF8fHx8MTc1NzY5ODc4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    
    // SEMESTER 6 (Upcoming)
    if (title.includes('artificial intelligence')) {
      return "https://images.unsplash.com/photo-1645839078449-124db8a049fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3NTc2MTU3ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('cryptography')) {
      return "https://images.unsplash.com/photo-1477039181047-efb4357d01bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9ncmFwaHklMjBlbmNyeXB0aW9uJTIwc2VjdXJpdHklMjBsb2NrfGVufDF8fHx8MTc1NzY5ODc5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('distributed data systems')) {
      return "https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhYmFzZSUyMHN5c3RlbXMlMjBhcmNoaXRlY3R1cmUlMjBzY2hlbWF8ZW58MXx8fHwxNzU3Njk4Nzk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    if (title.includes('software architectures')) {
      return "https://images.unsplash.com/photo-1619252696121-d4675b59423a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGFyY2hpdGVjdHVyZSUyMGRlc2lnbiUyMHBhdHRlcm5zfGVufDF8fHx8MTc1NzY5ODc5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    
    // Fallback - should not be reached with exact matching above
    return "https://images.unsplash.com/photo-1579403124614-197f69d8187b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGVuZ2luZWVyaW5nJTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzU3Njk4NTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
  };

  const courseImage = getCourseImage(course.title, course.code);

  if (viewMode === "list") {
    return (
      <Card className="p-4 sm:p-6 professional-card cursor-pointer hover:shadow-lg transition-all" onClick={() => onCourseClick?.(course)}>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
            <ImageWithFallback 
              src={courseImage} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-university-primary truncate text-sm sm:text-base">{course.title}</h3>
                <p className="text-university-secondary text-sm">{course.code} • Semester {course.semester}</p>
              </div>
              <Badge className={`${getStatusColor(course.status)} rounded-full px-3 py-1`}>
                {course.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {course.status === "ongoing" && course.progress && (
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-university-secondary">Progress</span>
                    <span className="text-university-primary font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}
              
              {course.status === "completed" && course.grades.finalGrade && (
                <div className="flex items-center gap-2">
                  <span className="text-university-secondary text-sm">Grade:</span>
                  <Badge className={
                    course.grades.finalGrade === 'A' || course.grades.finalGrade === 'A-' ? 'bg-green-100 text-green-800' :
                    course.grades.finalGrade === 'B' || course.grades.finalGrade === 'B-' ? 'bg-blue-100 text-blue-800' :
                    course.grades.finalGrade === 'C' || course.grades.finalGrade === 'C-' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {course.grades.finalGrade}
                  </Badge>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCourseClick?.(course);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group professional-card cursor-pointer hover:shadow-lg transition-all w-full flex flex-col h-full" onClick={() => onCourseClick?.(course)}>
      <div className="h-32 sm:h-40 rounded-t-lg overflow-hidden relative">
        <ImageWithFallback 
          src={courseImage} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        <Badge className={`absolute top-2 right-2 ${getStatusColor(course.status)} rounded-full px-2 py-1 text-xs`}>
          {course.status}
        </Badge>
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Title section with fixed height */}
        <div className="mb-3 sm:mb-4">
          <h3 className="font-semibold text-university-primary mb-1 text-sm sm:text-base leading-normal min-h-[2.5rem] flex items-start">{course.title}</h3>
          <p className="text-university-secondary text-xs sm:text-sm">{course.code} • Semester {course.semester}</p>
        </div>
        
        {/* Status-specific content section with consistent height */}
        <div className="mb-4 h-12 flex items-center">
          {course.status === "ongoing" && course.progress ? (
            <div className="w-full">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-university-secondary">Progress</span>
                <span className="text-university-primary font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          ) : course.status === "completed" && course.grades.finalGrade ? (
            <div className="w-full flex items-center justify-between">
              <span className="text-university-secondary text-sm">Final Grade:</span>
              <Badge className={
                course.grades.finalGrade === 'A' || course.grades.finalGrade === 'A-' ? 'bg-green-100 text-green-800' :
                course.grades.finalGrade === 'B' || course.grades.finalGrade === 'B-' ? 'bg-blue-100 text-blue-800' :
                course.grades.finalGrade === 'C' || course.grades.finalGrade === 'C-' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }>
                {course.grades.finalGrade}
              </Badge>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <span className="text-university-secondary text-sm">
                {course.status === "upcoming" ? "Starts in Semester " + course.semester : "Course Information"}
              </span>
            </div>
          )}
        </div>
        
        {/* Buttons section - pushed to bottom */}
        <div className="flex gap-2 mt-auto">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs h-8"
            onClick={(e) => {
              e.stopPropagation();
              onCourseClick?.(course);
            }}
          >
            <BookOpen className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Details</span>
            <span className="sm:hidden">View</span>
          </Button>
          {course.status === "ongoing" && (
            <Button 
              size="sm" 
              className="flex-1 text-xs h-8"
              onClick={(e) => {
                e.stopPropagation();
                onCourseClick?.(course);
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              Continue
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}