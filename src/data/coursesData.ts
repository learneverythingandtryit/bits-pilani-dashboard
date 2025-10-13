// Course data separated for better performance
export const coursesData = [
  // Semester 1 - Completed
  {
    id: "sem1-1",
    title: "Computer Programming",
    code: "SSWT ZC163",
    semester: 1,
    instructor: "Dr. Rajesh Kumar",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 11.45,
      midSemester: 18.00,
      comprehensive: 43.00,
      total: 72.45,
      finalGrade: "B"
    }
  },
  {
    id: "sem1-2",
    title: "Digital Electronics & Microprocessor",
    code: "SSWT ZC263",
    semester: 1,
    instructor: "Dr. Priya Sharma",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 6.00,
      midSemester: 15.50,
      comprehensive: 31.00,
      total: 52.50,
      finalGrade: "B"
    }
  },
  {
    id: "sem1-3",
    title: "Discrete Structures for Computer Science",
    code: "SSWT ZC224",
    semester: 1,
    instructor: "Dr. Ananya Reddy",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 12.75,
      midSemester: 20.50,
      comprehensive: 36.50,
      total: 69.75,
      finalGrade: "B-"
    }
  },
  {
    id: "sem1-4",
    title: "Linear Algebra & Optimization",
    code: "SSWT ZC234",
    semester: 1,
    instructor: "Dr. Vikram Singh",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 10.25,
      midSemester: 17.50,
      comprehensive: 17.50,
      total: 45.25,
      finalGrade: "C"
    }
  },

  // Semester 2 - Completed
  {
    id: "sem2-1",
    title: "Computer Systems & Architecture",
    code: "SSWT ZC353",
    semester: 2,
    instructor: "Dr. Suresh Patel",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 8.00,
      midSemester: 12.00,
      comprehensive: 27.00,
      total: 47.00,
      finalGrade: "B"
    }
  },
  {
    id: "sem2-2",
    title: "Data Structures & Algorithms",
    code: "SSWT ZC363",
    semester: 2,
    instructor: "Dr. Kavita Desai",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 16.00,
      midSemester: 17.50,
      comprehensive: 26.00,
      total: 59.50,
      finalGrade: "B"
    }
  },
  {
    id: "sem2-3",
    title: "Object Oriented Programming in Design",
    code: "SSWT ZC318",
    semester: 2,
    instructor: "Dr. Ramesh Iyer",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 14.25,
      midSemester: 23.00,
      comprehensive: 26.00,
      total: 63.25,
      finalGrade: "C"
    }
  },
  {
    id: "sem2-4",
    title: "Systems Programming",
    code: "SSWT ZC327",
    semester: 2,
    instructor: "Dr. Meera Nair",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 14.25,
      midSemester: 24.00,
      comprehensive: 38.50,
      total: 76.75,
      finalGrade: "A"
    }
  },

  // Semester 3 - Completed
  {
    id: "sem3-1",
    title: "Database Systems & Application",
    code: "SSWT ZC337",
    semester: 3,
    instructor: "Dr. Arun Khanna",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 12.25,
      midSemester: 16.50,
      comprehensive: 19.50,
      total: 48.25,
      finalGrade: "B-"
    }
  },
  {
    id: "sem3-2",
    title: "Operating Systems",
    code: "SSWT ZC364",
    semester: 3,
    instructor: "Dr. Sneha Gupta",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 14.75,
      midSemester: 13.00,
      comprehensive: 16.00,
      total: 43.75,
      finalGrade: "B"
    }
  },
  {
    id: "sem3-3",
    title: "Probability and Statistics",
    code: "SSWT ZC111",
    semester: 3,
    instructor: "Dr. Meera Nair",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 13.25,
      midSemester: 18.50,
      comprehensive: 24.00,
      total: 55.75,
      finalGrade: "B"
    }
  },
  {
    id: "sem3-4",
    title: "Software Engineering",
    code: "SSWT ZC343",
    semester: 3,
    instructor: "Dr. Ramesh Iyer",
    status: "completed" as const,
    grades: {
      assignmentQuiz: 15.50,
      midSemester: 21.00,
      comprehensive: 32.00,
      total: 68.50,
      finalGrade: "A-"
    }
  },

  // Semester 4 - Current (Ongoing)
  {
    id: "sem4-1",
    title: "Computer Design",
    code: "SSWT ZC378",
    semester: 4,
    instructor: "Dr. Rajesh Kumar",
    status: "ongoing" as const,
    progress: 70,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },
  {
    id: "sem4-2",
    title: "Computer Networks",
    code: "SSWT ZC467",
    semester: 4,
    instructor: "Dr. Suresh Patel",
    status: "ongoing" as const,
    progress: 75,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },
  {
    id: "sem4-3",
    title: "Object Oriented Analysis & Design",
    code: "SSWT ZC514",
    semester: 4,
    instructor: "Dr. Kavita Desai",
    status: "ongoing" as const,
    progress: 65,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },
  {
    id: "sem4-4",
    title: "Software Testing",
    code: "SSWT ZC528",
    semester: 4,
    instructor: "Dr. Ananya Reddy",
    status: "ongoing" as const,
    progress: 80,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },

  // Semester 5 - Upcoming
  {
    id: "sem5-1",
    title: "Cloud Computing",
    code: "SSWT ZG527",
    semester: 5,
    instructor: "TBA",
    status: "upcoming" as const,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },
  {
    id: "sem5-2",
    title: "Data Mining",
    code: "SSWT ZG425",
    semester: 5,
    instructor: "TBA",
    status: "upcoming" as const,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },
  {
    id: "sem5-3",
    title: "Distributed Computing",
    code: "SSWT ZG526",
    semester: 5,
    instructor: "TBA",
    status: "upcoming" as const,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },
  {
    id: "sem5-4",
    title: "Middleware Technologies",
    code: "SSWT ZG589",
    semester: 5,
    instructor: "TBA",
    status: "upcoming" as const,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },

  // Semester 6 - Upcoming
  {
    id: "sem6-1",
    title: "Artificial Intelligence",
    code: "SSWT ZG444",
    semester: 6,
    instructor: "TBA",
    status: "upcoming" as const,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },
  {
    id: "sem6-2",
    title: "Cryptography",
    code: "SSWT ZC463",
    semester: 6,
    instructor: "TBA",
    status: "upcoming" as const,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },
  {
    id: "sem6-3",
    title: "Distributed Data Systems",
    code: "SSWT ZG554",
    semester: 6,
    instructor: "TBA",
    status: "upcoming" as const,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  },
  {
    id: "sem6-4",
    title: "Software Architectures",
    code: "SSWT ZG653",
    semester: 6,
    instructor: "TBA",
    status: "upcoming" as const,
    grades: {
      assignmentQuiz: null,
      midSemester: null,
      comprehensive: null,
      total: null,
      finalGrade: null
    }
  }
];