// Course and Quiz management endpoints for admin
import * as kv from './kv_store.tsx';

export interface Course {
  id: string;
  title: string;
  code: string;
  semester: number;
  credits: number;
  instructor: string;
  schedule: string;
  description: string;
  progress: number;
  status: 'ongoing' | 'completed' | 'upcoming';
  tags: string[];
  thumbnail?: string;
  createdAt: string;
  createdBy: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  semester: number;
  questions: QuizQuestion[];
  duration: number; // minutes
  totalMarks: number;
  passingMarks: number;
  dueDate: string;
  createdAt: string;
  createdBy: string;
  isPublished: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: number[];
  score: number;
  totalMarks: number;
  submittedAt: string;
  timeTaken: number; // minutes
}

// Initialize default student credentials
export async function initializeStudents() {
  try {
    // FORCE UPDATE - Always update to ensure latest credentials
    const existingStudents = await kv.get('student-credentials');
    const shouldUpdate = !existingStudents || (existingStudents && existingStudents[0]?.username?.includes('student1@bits.ac.in'));
    
    if (shouldUpdate) {
      const students = [
        {
          id: '2021WA15025',
          username: '2021WA15025@pilani.bits-pilani.ac.in',
          password: 'student123',
          name: 'HARI HARA SUDHAN',
          email: '2021WA15025@pilani.bits-pilani.ac.in',
          phone: '+91 9876543210',
          course: 'B.Tech Computer Science',
          semester: '4th Semester',
          avatar: null
        },
        {
          id: '2021WA15026',
          username: '2021WA15026@pilani.bits-pilani.ac.in',
          password: 'student123',
          name: 'PRIYA SHARMA',
          email: '2021WA15026@pilani.bits-pilani.ac.in',
          phone: '+91 9876543211',
          course: 'B.Tech Computer Science',
          semester: '4th Semester',
          avatar: null
        },
        {
          id: '2021WA15027',
          username: '2021WA15027@pilani.bits-pilani.ac.in',
          password: 'student123',
          name: 'RAJESH KUMAR',
          email: '2021WA15027@pilani.bits-pilani.ac.in',
          phone: '+91 9876543212',
          course: 'B.Tech Computer Science',
          semester: '4th Semester',
          avatar: null
        },
        {
          id: '2021WA15028',
          username: '2021WA15028@pilani.bits-pilani.ac.in',
          password: 'student123',
          name: 'ANANYA REDDY',
          email: '2021WA15028@pilani.bits-pilani.ac.in',
          phone: '+91 9876543213',
          course: 'B.Tech Computer Science',
          semester: '4th Semester',
          avatar: null
        },
        {
          id: '2021WA15029',
          username: '2021WA15029@pilani.bits-pilani.ac.in',
          password: 'student123',
          name: 'VIKRAM SINGH',
          email: '2021WA15029@pilani.bits-pilani.ac.in',
          phone: '+91 9876543214',
          course: 'B.Tech Computer Science',
          semester: '4th Semester',
          avatar: null
        }
      ];
      
      await kv.set('student-credentials', students);
      console.log('Student credentials initialized/updated with institutional emails');
    }
  } catch (error) {
    console.error('Error initializing students:', error);
  }
}

// Initialize default courses
export async function initializeCourses() {
  try {
    const existingCourses = await kv.getByPrefix('course-');
    
    // Only initialize if no courses exist
    if (!existingCourses || existingCourses.length === 0) {
      const defaultCourses: Course[] = [
        // Semester 1 - Completed
        {
          id: 'course-sem1-1',
          title: 'Computer Programming',
          code: 'SSWT ZC163',
          semester: 1,
          credits: 4,
          instructor: 'Dr. Rajesh Kumar',
          schedule: 'Mon, Wed, Fri 10:00 AM',
          description: 'Introduction to programming concepts using C/C++',
          progress: 100,
          status: 'completed',
          tags: ['programming', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem1-2',
          title: 'Digital Electronics & Microprocessor',
          code: 'SSWT ZC263',
          semester: 1,
          credits: 4,
          instructor: 'Dr. Priya Sharma',
          schedule: 'Tue, Thu 2:00 PM',
          description: 'Fundamentals of digital electronics and microprocessor architecture',
          progress: 100,
          status: 'completed',
          tags: ['electronics', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem1-3',
          title: 'Discrete Structures for Computer Science',
          code: 'SSWT ZC224',
          semester: 1,
          credits: 3,
          instructor: 'Dr. Ananya Reddy',
          schedule: 'Mon, Wed 11:30 AM',
          description: 'Mathematical foundations including logic, sets, relations, and graph theory',
          progress: 100,
          status: 'completed',
          tags: ['mathematics', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem1-4',
          title: 'Linear Algebra & Optimization',
          code: 'SSWT ZC234',
          semester: 1,
          credits: 3,
          instructor: 'Dr. Vikram Singh',
          schedule: 'Tue, Thu 9:00 AM',
          description: 'Vectors, matrices, linear transformations, and optimization techniques',
          progress: 100,
          status: 'completed',
          tags: ['mathematics', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        
        // Semester 2 - Completed
        {
          id: 'course-sem2-1',
          title: 'Computer Systems & Architecture',
          code: 'SSWT ZC353',
          semester: 2,
          credits: 4,
          instructor: 'Dr. Suresh Patel',
          schedule: 'Mon, Wed, Fri 1:00 PM',
          description: 'Computer organization, assembly language, and system architecture',
          progress: 100,
          status: 'completed',
          tags: ['architecture', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem2-2',
          title: 'Data Structures & Algorithms',
          code: 'SSWT ZC363',
          semester: 2,
          credits: 4,
          instructor: 'Dr. Kavita Desai',
          schedule: 'Tue, Thu 10:30 AM',
          description: 'Advanced data structures and algorithmic problem solving',
          progress: 100,
          status: 'completed',
          tags: ['algorithms', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem2-3',
          title: 'Object Oriented Programming in Design',
          code: 'SSWT ZC318',
          semester: 2,
          credits: 3,
          instructor: 'Dr. Ramesh Iyer',
          schedule: 'Mon, Wed 3:30 PM',
          description: 'OOP principles using Java with design patterns',
          progress: 100,
          status: 'completed',
          tags: ['programming', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem2-4',
          title: 'Probability & Statistics',
          code: 'SSWT ZC225',
          semester: 2,
          credits: 3,
          instructor: 'Dr. Meera Nair',
          schedule: 'Tue, Thu 4:00 PM',
          description: 'Statistical methods and probability theory for computer science',
          progress: 100,
          status: 'completed',
          tags: ['mathematics', 'statistics'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        
        // Semester 3 - Completed
        {
          id: 'course-sem3-1',
          title: 'Database Systems',
          code: 'SSWT ZC464',
          semester: 3,
          credits: 4,
          instructor: 'Dr. Arun Khanna',
          schedule: 'Mon, Wed, Fri 9:30 AM',
          description: 'Relational databases, SQL, normalization, and transaction management',
          progress: 100,
          status: 'completed',
          tags: ['database', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem3-2',
          title: 'Operating Systems',
          code: 'SSWT ZC454',
          semester: 3,
          credits: 4,
          instructor: 'Dr. Sneha Gupta',
          schedule: 'Tue, Thu 11:00 AM',
          description: 'Process management, memory management, file systems, and concurrency',
          progress: 100,
          status: 'completed',
          tags: ['systems', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem3-3',
          title: 'Computer Networks',
          code: 'SSWT ZC419',
          semester: 3,
          credits: 3,
          instructor: 'Dr. Rajesh Kumar',
          schedule: 'Mon, Wed 2:00 PM',
          description: 'Network protocols, TCP/IP, routing, and network security',
          progress: 100,
          status: 'completed',
          tags: ['networking', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem3-4',
          title: 'Theory of Computation',
          code: 'SSWT ZC326',
          semester: 3,
          credits: 3,
          instructor: 'Dr. Meera Nair',
          schedule: 'Tue, Thu 3:00 PM',
          description: 'Automata theory, formal languages, and computational complexity',
          progress: 100,
          status: 'completed',
          tags: ['theory', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        
        // Semester 4 - Ongoing
        {
          id: 'course-sem4-1',
          title: 'Software Engineering',
          code: 'CS F213',
          semester: 4,
          credits: 4,
          instructor: 'Dr. Ramesh Iyer',
          schedule: 'Mon, Wed, Fri 10:00 AM',
          description: 'Software development lifecycle, design patterns, and agile methodologies',
          progress: 65,
          status: 'ongoing',
          tags: ['software', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem4-2',
          title: 'Machine Learning',
          code: 'CS F342',
          semester: 4,
          credits: 4,
          instructor: 'Dr. Suresh Patel',
          schedule: 'Tue, Thu 2:00 PM',
          description: 'Supervised and unsupervised learning algorithms with practical applications',
          progress: 58,
          status: 'ongoing',
          tags: ['ai', 'elective'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem4-3',
          title: 'Web Development',
          code: 'CS F218',
          semester: 4,
          credits: 3,
          instructor: 'Dr. Kavita Desai',
          schedule: 'Mon, Wed 3:30 PM',
          description: 'Full-stack web development using modern frameworks and technologies',
          progress: 72,
          status: 'ongoing',
          tags: ['web', 'elective'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem4-4',
          title: 'Compiler Design',
          code: 'CS F363',
          semester: 4,
          credits: 3,
          instructor: 'Dr. Ananya Reddy',
          schedule: 'Tue, Thu 4:30 PM',
          description: 'Lexical analysis, parsing, code generation, and optimization',
          progress: 45,
          status: 'ongoing',
          tags: ['compilers', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        
        // Semester 5 - Upcoming
        {
          id: 'course-sem5-1',
          title: 'Artificial Intelligence',
          code: 'CS F407',
          semester: 5,
          credits: 4,
          instructor: 'To be assigned',
          schedule: 'Mon, Wed, Fri 9:00 AM',
          description: 'Search algorithms, knowledge representation, and intelligent agents',
          progress: 0,
          status: 'upcoming',
          tags: ['ai', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem5-2',
          title: 'Cryptography & Network Security',
          code: 'CS F408',
          semester: 5,
          credits: 4,
          instructor: 'To be assigned',
          schedule: 'Tue, Thu 11:00 AM',
          description: 'Encryption algorithms, authentication, and secure communication protocols',
          progress: 0,
          status: 'upcoming',
          tags: ['security', 'elective'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem5-3',
          title: 'Cloud Computing',
          code: 'CS F469',
          semester: 5,
          credits: 3,
          instructor: 'To be assigned',
          schedule: 'Mon, Wed 1:30 PM',
          description: 'Cloud architectures, virtualization, and distributed computing',
          progress: 0,
          status: 'upcoming',
          tags: ['cloud', 'elective'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem5-4',
          title: 'Mobile Application Development',
          code: 'CS F429',
          semester: 5,
          credits: 3,
          instructor: 'To be assigned',
          schedule: 'Tue, Thu 3:00 PM',
          description: 'iOS and Android app development with modern frameworks',
          progress: 0,
          status: 'upcoming',
          tags: ['mobile', 'elective'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        
        // Semester 6 - Upcoming
        {
          id: 'course-sem6-1',
          title: 'Distributed Systems',
          code: 'CS F471',
          semester: 6,
          credits: 4,
          instructor: 'To be assigned',
          schedule: 'Mon, Wed, Fri 10:30 AM',
          description: 'Distributed algorithms, consensus protocols, and fault tolerance',
          progress: 0,
          status: 'upcoming',
          tags: ['distributed', 'core'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem6-2',
          title: 'Big Data Analytics',
          code: 'CS F415',
          semester: 6,
          credits: 4,
          instructor: 'To be assigned',
          schedule: 'Tue, Thu 1:00 PM',
          description: 'Hadoop, Spark, data mining, and large-scale data processing',
          progress: 0,
          status: 'upcoming',
          tags: ['data', 'elective'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem6-3',
          title: 'Blockchain Technology',
          code: 'CS F446',
          semester: 6,
          credits: 3,
          instructor: 'To be assigned',
          schedule: 'Mon, Wed 4:00 PM',
          description: 'Distributed ledgers, smart contracts, and cryptocurrency',
          progress: 0,
          status: 'upcoming',
          tags: ['blockchain', 'elective'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'course-sem6-4',
          title: 'Computer Graphics',
          code: 'CS F433',
          semester: 6,
          credits: 3,
          instructor: 'To be assigned',
          schedule: 'Tue, Thu 5:00 PM',
          description: '2D/3D graphics, rendering, and visualization techniques',
          progress: 0,
          status: 'upcoming',
          tags: ['graphics', 'elective'],
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        }
      ];
      
      // Save all courses to KV store
      for (const course of defaultCourses) {
        await kv.set(course.id, course);
      }
      
      console.log(`✅ Initialized ${defaultCourses.length} default courses`);
    } else {
      console.log(`Courses already exist (${existingCourses.length} courses found), skipping initialization`);
    }
  } catch (error) {
    console.error('Error initializing courses:', error);
  }
}

// Create new student (Admin only)
export async function createStudent(studentData: any) {
  try {
    const students = await kv.get('student-credentials') || [];
    
    // Check if student already exists
    const exists = students.some((s: any) => 
      s.username === studentData.username || s.id === studentData.id
    );
    
    if (exists) {
      return { success: false, error: 'Student with this email or ID already exists' };
    }
    
    const newStudent = {
      id: studentData.id,
      username: studentData.username,
      password: studentData.password || 'student123',
      name: studentData.name,
      email: studentData.email || studentData.username,
      phone: studentData.phone || '+91 0000000000',
      course: studentData.course || 'B.Tech Computer Science',
      semester: studentData.semester || '4th Semester',
      avatar: null
    };
    
    const updatedStudents = [...students, newStudent];
    await kv.set('student-credentials', updatedStudents);
    
    return { success: true, data: newStudent };
  } catch (error) {
    console.error('Error creating student:', error);
    return { success: false, error: 'Failed to create student' };
  }
}

// Update student (Admin only)
export async function updateStudent(studentId: string, updates: any) {
  try {
    const students = await kv.get('student-credentials') || [];
    const index = students.findIndex((s: any) => s.id === studentId);
    
    if (index === -1) {
      return { success: false, error: 'Student not found' };
    }
    
    students[index] = { ...students[index], ...updates };
    await kv.set('student-credentials', students);
    
    return { success: true, data: students[index] };
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, error: 'Failed to update student' };
  }
}

// Delete student (Admin only)
export async function deleteStudent(studentId: string) {
  try {
    const students = await kv.get('student-credentials') || [];
    const filteredStudents = students.filter((s: any) => s.id !== studentId);
    
    await kv.set('student-credentials', filteredStudents);
    return { success: true };
  } catch (error) {
    console.error('Error deleting student:', error);
    return { success: false, error: 'Failed to delete student' };
  }
}

// Get all admins
export async function getAdmins() {
  try {
    const admins = await kv.get('admin-accounts') || [];
    return admins;
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
}

// Create new admin (Super Admin only)
export async function createAdmin(adminData: any) {
  try {
    const admins = await kv.get('admin-accounts') || [];
    
    // Check if admin already exists
    const exists = admins.some((a: any) => a.username === adminData.username);
    if (exists) {
      return { success: false, error: 'Admin with this username already exists' };
    }
    
    const newAdmin = {
      id: `admin-${Date.now()}`,
      username: adminData.username,
      password: adminData.password,
      name: adminData.name || adminData.username,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    
    const updatedAdmins = [...admins, newAdmin];
    await kv.set('admin-accounts', updatedAdmins);
    
    return { success: true, data: newAdmin };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, error: 'Failed to create admin' };
  }
}

// Update admin credentials
export async function updateAdmin(username: string, updates: any) {
  try {
    const admins = await kv.get('admin-accounts') || [];
    const index = admins.findIndex((a: any) => a.username === username);
    
    if (index === -1) {
      return { success: false, error: 'Admin not found' };
    }
    
    admins[index] = { ...admins[index], ...updates };
    await kv.set('admin-accounts', admins);
    
    return { success: true, data: admins[index] };
  } catch (error) {
    console.error('Error updating admin:', error);
    return { success: false, error: 'Failed to update admin' };
  }
}

// Delete admin
export async function deleteAdmin(username: string) {
  try {
    // Prevent deleting default admin
    if (username === 'admin') {
      return { success: false, error: 'Cannot delete default admin account' };
    }
    
    const admins = await kv.get('admin-accounts') || [];
    const filteredAdmins = admins.filter((a: any) => a.username !== username);
    
    await kv.set('admin-accounts', filteredAdmins);
    return { success: true };
  } catch (error) {
    console.error('Error deleting admin:', error);
    return { success: false, error: 'Failed to delete admin' };
  }
}

// ===== STAFF MANAGEMENT FUNCTIONS =====

// Initialize default staff members
export async function initializeStaff() {
  try {
    const existingStaff = await kv.get('staff-members');
    
    // Only initialize if no staff exists
    if (!existingStaff || existingStaff.length === 0) {
      const defaultStaff = [
        {
          id: 'staff-1',
          username: 'rajesh.kumar',
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@pilani.bits-pilani.ac.in',
          phone: '+91 9876501001',
          department: 'Computer Science & Engineering',
          designation: 'Professor',
          createdAt: new Date().toISOString()
        },
        {
          id: 'staff-2',
          username: 'priya.sharma',
          name: 'Dr. Priya Sharma',
          email: 'priya.sharma@pilani.bits-pilani.ac.in',
          phone: '+91 9876501002',
          department: 'Electronics & Communication',
          designation: 'Associate Professor',
          createdAt: new Date().toISOString()
        },
        {
          id: 'staff-3',
          username: 'ananya.reddy',
          name: 'Dr. Ananya Reddy',
          email: 'ananya.reddy@pilani.bits-pilani.ac.in',
          phone: '+91 9876501003',
          department: 'Computer Science & Engineering',
          designation: 'Assistant Professor',
          createdAt: new Date().toISOString()
        },
        {
          id: 'staff-4',
          username: 'vikram.singh',
          name: 'Dr. Vikram Singh',
          email: 'vikram.singh@pilani.bits-pilani.ac.in',
          phone: '+91 9876501004',
          department: 'Mathematics',
          designation: 'Professor',
          createdAt: new Date().toISOString()
        },
        {
          id: 'staff-5',
          username: 'suresh.patel',
          name: 'Dr. Suresh Patel',
          email: 'suresh.patel@pilani.bits-pilani.ac.in',
          phone: '+91 9876501005',
          department: 'Computer Science & Engineering',
          designation: 'Associate Professor',
          createdAt: new Date().toISOString()
        },
        {
          id: 'staff-6',
          username: 'kavita.desai',
          name: 'Dr. Kavita Desai',
          email: 'kavita.desai@pilani.bits-pilani.ac.in',
          phone: '+91 9876501006',
          department: 'Computer Science & Engineering',
          designation: 'Professor',
          createdAt: new Date().toISOString()
        },
        {
          id: 'staff-7',
          username: 'ramesh.iyer',
          name: 'Dr. Ramesh Iyer',
          email: 'ramesh.iyer@pilani.bits-pilani.ac.in',
          phone: '+91 9876501007',
          department: 'Computer Science & Engineering',
          designation: 'Assistant Professor',
          createdAt: new Date().toISOString()
        },
        {
          id: 'staff-8',
          username: 'meera.nair',
          name: 'Dr. Meera Nair',
          email: 'meera.nair@pilani.bits-pilani.ac.in',
          phone: '+91 9876501008',
          department: 'Mathematics',
          designation: 'Associate Professor',
          createdAt: new Date().toISOString()
        },
        {
          id: 'staff-9',
          username: 'arun.khanna',
          name: 'Dr. Arun Khanna',
          email: 'arun.khanna@pilani.bits-pilani.ac.in',
          phone: '+91 9876501009',
          department: 'Computer Science & Engineering',
          designation: 'Professor',
          createdAt: new Date().toISOString()
        },
        {
          id: 'staff-10',
          username: 'sneha.gupta',
          name: 'Dr. Sneha Gupta',
          email: 'sneha.gupta@pilani.bits-pilani.ac.in',
          phone: '+91 9876501010',
          department: 'Computer Science & Engineering',
          designation: 'Associate Professor',
          createdAt: new Date().toISOString()
        }
      ];
      
      await kv.set('staff-members', defaultStaff);
      console.log(`✅ Initialized ${defaultStaff.length} staff members`);
    } else {
      console.log(`Staff already exists (${existingStaff.length} members found), skipping initialization`);
    }
  } catch (error) {
    console.error('Error initializing staff:', error);
  }
}

// Get all staff
export async function getAllStaff() {
  try {
    const staff = await kv.get('staff-members') || [];
    return staff;
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
}

// Create staff member
export async function createStaff(staffData: any) {
  try {
    const staff = await kv.get('staff-members') || [];
    
    // Check if username already exists
    const existingStaff = staff.find((s: any) => s.username === staffData.username);
    if (existingStaff) {
      return { success: false, error: 'Username already exists' };
    }
    
    const newStaff = {
      id: `staff-${Date.now()}`,
      username: staffData.username,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone || '',
      department: staffData.department || '',
      designation: staffData.designation || '',
      createdAt: new Date().toISOString()
    };
    
    staff.push(newStaff);
    await kv.set('staff-members', staff);
    
    return { success: true, staff: newStaff };
  } catch (error) {
    console.error('Error creating staff:', error);
    return { success: false, error: 'Failed to create staff member' };
  }
}

// Update staff member
export async function updateStaff(username: string, updates: any) {
  try {
    const staff = await kv.get('staff-members') || [];
    const index = staff.findIndex((s: any) => s.username === username);
    
    if (index === -1) {
      return { success: false, error: 'Staff member not found' };
    }
    
    staff[index] = { ...staff[index], ...updates };
    await kv.set('staff-members', staff);
    
    return { success: true, staff: staff[index] };
  } catch (error) {
    console.error('Error updating staff:', error);
    return { success: false, error: 'Failed to update staff member' };
  }
}

// Delete staff member
export async function deleteStaff(username: string) {
  try {
    const staff = await kv.get('staff-members') || [];
    const filteredStaff = staff.filter((s: any) => s.username !== username);
    
    await kv.set('staff-members', filteredStaff);
    return { success: true };
  } catch (error) {
    console.error('Error deleting staff:', error);
    return { success: false, error: 'Failed to delete staff member' };
  }
}

// Update course instructor
export async function updateCourseInstructor(courseId: string, instructor: string) {
  try {
    const course = await kv.get(courseId);
    
    if (!course) {
      return { success: false, error: 'Course not found' };
    }
    
    course.instructor = instructor;
    await kv.set(courseId, course);
    
    return { success: true, course };
  } catch (error) {
    console.error('Error updating course instructor:', error);
    return { success: false, error: 'Failed to update course instructor' };
  }
}

// Verify student credentials
export async function verifyStudent(username: string, password: string) {
  try {
    const students = await kv.get('student-credentials');
    if (students && Array.isArray(students)) {
      const student = students.find((s: any) => 
        s.username === username && s.password === password
      );
      if (student) {
        return { success: true, student };
      }
    }
    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    console.error('Error verifying student:', error);
    return { success: false, error: 'Verification failed' };
  }
}

// Get all courses
export async function getCourses() {
  try {
    const courses = await kv.getByPrefix('course-');
    return courses.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

// Create course (Admin only)
export async function createCourse(course: Omit<Course, 'id' | 'createdAt'>) {
  try {
    const id = `course-${Date.now()}`;
    const newCourse: Course = {
      ...course,
      id,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, newCourse);
    return { success: true, data: newCourse };
  } catch (error) {
    console.error('Error creating course:', error);
    return { success: false, error: 'Failed to create course' };
  }
}

// Update course (Admin only)
export async function updateCourse(id: string, updates: Partial<Course>) {
  try {
    const existing = await kv.get(id);
    if (!existing) {
      return { success: false, error: 'Course not found' };
    }
    
    const updated = { ...existing, ...updates };
    await kv.set(id, updated);
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating course:', error);
    return { success: false, error: 'Failed to update course' };
  }
}

// Delete course (Admin only)
export async function deleteCourse(id: string) {
  try {
    await kv.del(id);
    // Also delete associated quizzes
    const quizzes = await kv.getByPrefix('quiz-');
    const courseQuizzes = quizzes.filter((q: any) => q.courseId === id);
    for (const quiz of courseQuizzes) {
      await kv.del(quiz.id);
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting course:', error);
    return { success: false, error: 'Failed to delete course' };
  }
}

// Get all quizzes
export async function getQuizzes() {
  try {
    const quizzes = await kv.getByPrefix('quiz-');
    return quizzes.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
}

// Create quiz (Admin only)
export async function createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>) {
  try {
    const id = `quiz-${Date.now()}`;
    const newQuiz: Quiz = {
      ...quiz,
      id,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, newQuiz);
    return { success: true, data: newQuiz };
  } catch (error) {
    console.error('Error creating quiz:', error);
    return { success: false, error: 'Failed to create quiz' };
  }
}

// Update quiz (Admin only)
export async function updateQuiz(id: string, updates: Partial<Quiz>) {
  try {
    const existing = await kv.get(id);
    if (!existing) {
      return { success: false, error: 'Quiz not found' };
    }
    
    const updated = { ...existing, ...updates };
    await kv.set(id, updated);
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating quiz:', error);
    return { success: false, error: 'Failed to update quiz' };
  }
}

// Delete quiz (Admin only)
export async function deleteQuiz(id: string) {
  try {
    await kv.del(id);
    // Also delete associated submissions
    const submissions = await kv.getByPrefix('submission-');
    const quizSubmissions = submissions.filter((s: any) => s.quizId === id);
    for (const submission of quizSubmissions) {
      await kv.del(submission.id);
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return { success: false, error: 'Failed to delete quiz' };
  }
}

// Submit quiz (Student)
export async function submitQuiz(submission: Omit<QuizSubmission, 'id' | 'submittedAt'>) {
  try {
    const id = `submission-${submission.quizId}-${submission.studentId}-${Date.now()}`;
    const newSubmission: QuizSubmission = {
      ...submission,
      id,
      submittedAt: new Date().toISOString()
    };
    
    await kv.set(id, newSubmission);
    return { success: true, data: newSubmission };
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return { success: false, error: 'Failed to submit quiz' };
  }
}

// Get quiz submissions
export async function getQuizSubmissions(quizId?: string, studentId?: string) {
  try {
    const submissions = await kv.getByPrefix('submission-');
    let filtered = submissions;
    
    if (quizId) {
      filtered = filtered.filter((s: any) => s.quizId === quizId);
    }
    
    if (studentId) {
      filtered = filtered.filter((s: any) => s.studentId === studentId);
    }
    
    return filtered.sort((a: any, b: any) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
}

// Get all students
export async function getStudents() {
  try {
    const students = await kv.get('student-credentials');
    return students || [];
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}
