// Events data separated for better performance
export type EventType = "deadline" | "assignment" | "presentation" | "meeting" | "class" | "exam" | "holiday" | "viva" | "lab_assessment";

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventType;
  description: string;
  course?: string;
  location?: string;
}

export const eventsData: Event[] = [
  // September 2025 - Academic activities
  {
    id: "1",
    title: "Database Design Assignment",
    date: "2025-09-05",
    time: "23:59",
    type: "deadline",
    description: "Submit ER diagram and normalized database schema",
    course: "SSWT ZC337",
    location: "Online Submission"
  },
  {
    id: "2",
    title: "Object Oriented Programming Lab",
    date: "2025-09-08",
    time: "14:00",
    type: "class",
    description: "Inheritance and polymorphism practical session",
    course: "SSWT ZC318",
    location: "Computer Lab 2"
  },
  {
    id: "3",
    title: "Software Testing Project Presentation",
    date: "2025-09-12",
    time: "10:00", 
    type: "presentation",
    description: "Present automated testing framework implementation",
    course: "SSWT ZC528",
    location: "Room 301"
  },
  {
    id: "4",
    title: "Study Group - Data Structures",
    date: "2025-09-15",
    time: "16:00",
    type: "meeting", 
    description: "Review trees and graphs before exam",
    course: "SSWT ZC363",
    location: "Library Study Room 3"
  },
  {
    id: "5",
    title: "Computer Networks Lab Assessment",
    date: "2025-09-18",
    time: "11:00",
    type: "lab_assessment",
    description: "Network configuration and troubleshooting practical",
    course: "SSWT ZC467",
    location: "Network Lab"
  },
  {
    id: "6",
    title: "Software Engineering Assignment",
    date: "2025-09-22",
    time: "18:00",
    type: "assignment",
    description: "Agile methodology case study analysis",
    course: "SSWT ZC343",
    location: "Online Submission"
  },
  {
    id: "7",
    title: "Operating Systems Mid-Term Exam",
    date: "2025-09-25",
    time: "09:00",
    type: "exam",
    description: "Process management, memory allocation, and scheduling",
    course: "SSWT ZC364",
    location: "Exam Hall A"
  },
  
  // October 2025 - Including Indian Holidays
  {
    id: "8",
    title: "Gandhi Jayanti",
    date: "2025-10-02",
    time: "00:00",
    type: "holiday",
    description: "National Holiday - Birth anniversary of Mahatma Gandhi",
    location: "National Holiday"
  },
  {
    id: "9",
    title: "Database Systems Viva",
    date: "2025-10-06",
    time: "14:30",
    type: "viva",
    description: "Oral examination on SQL queries and normalization",
    course: "SSWT ZC337",
    location: "Faculty Room 205"
  },
  {
    id: "10",
    title: "Computer Design Project Demo",
    date: "2025-10-10",
    time: "15:00",
    type: "presentation",
    description: "Present CPU architecture simulation project",
    course: "SSWT ZC378",
    location: "Lab 4"
  },
  {
    id: "11",
    title: "Team Meeting - Final Project",
    date: "2025-10-15",
    time: "13:00",
    type: "meeting",
    description: "Discuss integration testing and deployment strategy",
    course: "SSWT ZC528",
    location: "Conference Room B"
  },
  {
    id: "12",
    title: "Dussehra (Vijayadashami)",
    date: "2025-10-22",
    time: "00:00",
    type: "holiday",
    description: "Hindu festival celebrating the victory of good over evil",
    location: "Festival Holiday"
  },
  {
    id: "13",
    title: "Cryptography Lab Practical",
    date: "2025-10-28",
    time: "14:00",
    type: "lab_assessment",
    description: "Implement RSA and AES encryption algorithms",
    course: "SSWT ZC463",
    location: "Security Lab"
  },
  
  // November 2025 - Including Diwali
  {
    id: "14",
    title: "Diwali",
    date: "2025-11-01",
    time: "00:00",
    type: "holiday",
    description: "Festival of Lights - Major Hindu festival",
    location: "Festival Holiday"
  },
  {
    id: "15",
    title: "Research Paper Submission",
    date: "2025-11-05",
    time: "23:59",
    type: "deadline",
    description: "Submit research paper on distributed computing algorithms",
    course: "SSWT ZG526",
    location: "Online Portal"
  },
  {
    id: "16",
    title: "Cloud Computing Workshop",
    date: "2025-11-08",
    time: "10:00",
    type: "class",
    description: "Hands-on session with AWS services and deployment",
    course: "SSWT ZG527",
    location: "Cloud Computing Lab"
  },
  {
    id: "17",
    title: "Data Mining Algorithm Presentation",
    date: "2025-11-12",
    time: "11:30",
    type: "presentation",
    description: "Present implementation of clustering algorithms",
    course: "SSWT ZG425",
    location: "Seminar Hall"
  },
  {
    id: "18",
    title: "Guru Nanak Jayanti",
    date: "2025-11-15",
    time: "00:00",
    type: "holiday",
    description: "Birth anniversary of Guru Nanak - Sikh religious festival",
    location: "Religious Holiday"
  },
  {
    id: "19",
    title: "AI Study Group Session",
    date: "2025-11-20",
    time: "16:00",
    type: "meeting",
    description: "Neural networks and machine learning concepts review",
    course: "SSWT ZG444",
    location: "Study Room 7"
  },
  {
    id: "20",
    title: "Software Architecture Design Review",
    date: "2025-11-25",
    time: "09:30",
    type: "presentation",
    description: "Present microservices architecture design patterns",
    course: "SSWT ZG653",
    location: "Conference Hall"
  },
  
  // December 2025 - End of semester activities
  {
    id: "21",
    title: "Distributed Computing Lab Assessment",
    date: "2025-12-03",
    time: "10:00",
    type: "lab_assessment",
    description: "Practical evaluation on distributed systems implementation",
    course: "SSWT ZG526",
    location: "Advanced Computing Lab"
  },
  {
    id: "22",
    title: "Middleware Technologies Viva",
    date: "2025-12-08",
    time: "15:00",
    type: "viva",
    description: "Oral examination on enterprise application integration",
    course: "SSWT ZG589",
    location: "Faculty Room 301"
  },
  {
    id: "23",
    title: "Final Project Team Meeting",
    date: "2025-12-12",
    time: "14:00",
    type: "meeting",
    description: "Final review and submission preparation",
    course: "All Courses",
    location: "Conference Room A"
  },
  {
    id: "24",
    title: "Comprehensive Exam - Semester 4",
    date: "2025-12-16",
    time: "09:00",
    type: "exam",
    description: "Final comprehensive examination for all semester 4 courses",
    course: "All Courses",
    location: "Main Examination Hall"
  },
  {
    id: "25",
    title: "AI & Machine Learning Presentation",
    date: "2025-12-20",
    time: "11:00",
    type: "presentation",
    description: "Present final AI project and research findings",
    course: "SSWT ZG444",
    location: "Seminar Hall"
  },
  {
    id: "26",
    title: "Christmas",
    date: "2025-12-25",
    time: "00:00",
    type: "holiday",
    description: "Christmas Day - Christian religious festival",
    location: "National Holiday"
  },
  {
    id: "27",
    title: "Final Project Submission Deadline",
    date: "2025-12-30",
    time: "23:59",
    type: "deadline",
    description: "Final project submission with complete documentation and code",
    course: "All Courses",
    location: "Online Submission Portal"
  }
];
