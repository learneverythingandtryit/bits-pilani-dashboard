import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Megaphone, Plus, Edit3, Trash2, LogOut, Users, Bell, TrendingUp,
  UserPlus, Shield, GraduationCap, BookOpen, ClipboardList, Settings,
  Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download,
  Calendar, Clock, MapPin, Ticket
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { coursesData } from '../data/coursesData';
import { AdminCourseDetailsPage } from './AdminCourseDetailsPage';
import { AdminTicketsPage } from './AdminTicketsPage';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  createdBy: string;
  time: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "deadline" | "assignment" | "presentation" | "meeting" | "class" | "exam" | "holiday" | "viva" | "lab_assessment";
  description: string;
  course?: string;
  location?: string;
  createdBy?: string;
  createdAt?: string;
}

interface Student {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  semester: string;
}

interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Staff {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  createdAt: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  adminUsername: string;
}

export function AdminDashboard({ onLogout, adminUsername }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [courses, setCourses] = useState<any[]>(coursesData);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEditInstructorDialogOpen, setIsEditInstructorDialogOpen] = useState(false);
  
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editingCourseInstructor, setEditingCourseInstructor] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Academic",
    priority: "medium" as 'high' | 'medium' | 'low'
  });

  const [studentFormData, setStudentFormData] = useState({
    id: "",
    name: "",
    username: "",
    password: "student123",
    phone: "",
    course: "B.Tech Computer Science",
    semester: "4th Semester"
  });

  const [adminFormData, setAdminFormData] = useState({
    username: "",
    password: "",
    name: ""
  });

  const [staffFormData, setStaffFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: ""
  });

  const [eventFormData, setEventFormData] = useState({
    title: "",
    date: "",
    time: "",
    type: "class" as Event["type"],
    description: "",
    course: "",
    location: ""
  });

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: Array<{ row: number; name: string; error: string }>;
    isProcessing: boolean;
  }>({
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
    isProcessing: false
  });

  // Fetch all data
  const fetchData = async () => {
    await Promise.all([
      fetchAnnouncements(),
      fetchStudents(),
      fetchAdmins(),
      fetchStaff(),
      fetchCourses()
    ]);
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/announcements`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const data = await response.json();
      if (data.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/students`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const data = await response.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/admins`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const data = await response.json();
      if (data.admins) {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/events`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
        console.log(`Loaded ${data.events.length} events from backend`);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/courses`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.courses && data.courses.length > 0) {
          // Merge backend courses with hardcoded courses
          const backendCourseIds = new Set(data.courses.map((c: any) => c.id));
          const hardcodedCoursesFiltered = coursesData.filter((c: any) => !backendCourseIds.has(c.id));
          const allCourses = [...data.courses, ...hardcodedCoursesFiltered];
          
          setCourses(allCourses);
          console.log(`✅ Admin loaded ${allCourses.length} courses (${data.courses.length} from backend, ${hardcodedCoursesFiltered.length} hardcoded)`);
        } else {
          console.log('Backend empty, using hardcoded courses for admin');
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchEvents();
  }, []);

  // Announcement handlers
  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/announcements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ ...formData, createdBy: adminUsername })
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchAnnouncements();
        setIsCreateDialogOpen(false);
        setFormData({ title: "", content: "", category: "Academic", priority: "medium" });
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/announcements/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        await fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  // Event handlers
  const handleCreateEvent = async () => {
    if (!eventFormData.title || !eventFormData.date || !eventFormData.time) {
      alert('Please fill in all required fields (Title, Date, Time)');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...eventFormData,
            createdBy: adminUsername
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Event created:', data.event);
        
        // Also create an announcement for the event
        const eventDate = new Date(eventFormData.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/announcements`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              title: `New Event: ${eventFormData.title}`,
              content: `${eventFormData.title} scheduled for ${formattedDate} at ${eventFormData.time}${eventFormData.location ? ' - ' + eventFormData.location : ''}. ${eventFormData.description || ''}`,
              category: eventFormData.type === 'exam' || eventFormData.type === 'viva' || eventFormData.type === 'lab_assessment' ? 'Academic' : 
                       eventFormData.type === 'assignment' || eventFormData.type === 'deadline' ? 'Academic' :
                       eventFormData.type === 'class' ? 'Academic' : 'Events',
              priority: eventFormData.type === 'exam' || eventFormData.type === 'deadline' ? 'high' : 'medium',
              createdBy: adminUsername
            })
          }
        );
        
        await fetchEvents();
        await fetchAnnouncements();
        
        setEventFormData({
          title: "",
          date: "",
          time: "",
          type: "class",
          description: "",
          course: "",
          location: ""
        });
        setIsEventDialogOpen(false);
        alert('Event created successfully and all students will be notified!');
      } else {
        const error = await response.json();
        alert(`Failed to create event: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also remove the associated announcement.')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/events/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        await fetchEvents();
        await fetchAnnouncements();
        console.log('✅ Event deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Student handlers
  const handleCreateStudent = async () => {
    if (!studentFormData.id || !studentFormData.name || !studentFormData.username) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/students`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...studentFormData,
            email: studentFormData.username
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchStudents();
        setIsStudentDialogOpen(false);
        setStudentFormData({
          id: "",
          name: "",
          username: "",
          password: "student123",
          phone: "",
          course: "B.Tech Computer Science",
          semester: "4th Semester"
        });
      } else {
        alert(data.error || 'Failed to create student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Failed to create student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/students/${editingStudent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(studentFormData)
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchStudents();
        setEditingStudent(null);
        setIsStudentDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/students/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        await fetchStudents();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  // Bulk Import Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      setImportFile(file);
    } else {
      alert('Please upload a valid Excel file (.xlsx, .xls) or CSV file (.csv)');
    }
  };

  const parseExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          
          // Dynamically import xlsx library
          const XLSX = await import('xlsx');
          
          let workbook;
          if (file.name.endsWith('.csv')) {
            // Parse CSV
            const text = new TextDecoder().decode(data as ArrayBuffer);
            workbook = XLSX.read(text, { type: 'string' });
          } else {
            // Parse Excel
            workbook = XLSX.read(data, { type: 'array' });
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImportStudents = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setImportProgress({
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
      isProcessing: true
    });

    try {
      // Parse the Excel/CSV file
      const data = await parseExcelFile(importFile);
      
      if (data.length === 0) {
        alert('The file is empty or has no valid data');
        setImportProgress(prev => ({ ...prev, isProcessing: false }));
        return;
      }

      setImportProgress(prev => ({ ...prev, total: data.length }));

      // Process students in bulk
      const studentsToCreate = data.map((row: any, index: number) => {
        // Support various column name formats
        const getName = () => row.Name || row.name || row.NAME || '';
        const getId = () => row.ID || row.Id || row.id || row['Student ID'] || row['Student Id'] || row['student_id'] || '';
        const getEmail = () => row.Email || row.email || row.EMAIL || row.Username || row.username || '';
        const getPhone = () => row.Phone || row.phone || row.PHONE || row['Phone Number'] || row['phone_number'] || '';
        const getCourse = () => row.Course || row.course || row.COURSE || row.Program || row.program || 'B.Tech Computer Science';
        const getSemester = () => row.Semester || row.semester || row.SEMESTER || '4th Semester';
        const getPassword = () => row.Password || row.password || row.PASSWORD || 'student123';

        return {
          row: index + 2, // Excel row number (1-indexed + header)
          student: {
            id: String(getId()).trim(),
            name: String(getName()).trim(),
            username: String(getEmail()).trim(),
            email: String(getEmail()).trim(),
            phone: String(getPhone()).trim(),
            course: String(getCourse()).trim(),
            semester: String(getSemester()).trim(),
            password: String(getPassword()).trim()
          }
        };
      });

      // Validate all students first
      const errors: Array<{ row: number; name: string; error: string }> = [];
      const validStudents: any[] = [];

      studentsToCreate.forEach(({ row, student }) => {
        if (!student.id) {
          errors.push({ row, name: student.name || 'Unknown', error: 'Missing Student ID' });
        } else if (!student.name) {
          errors.push({ row, name: student.id, error: 'Missing Name' });
        } else if (!student.username || !student.email) {
          errors.push({ row, name: student.name, error: 'Missing Email/Username' });
        } else {
          validStudents.push({ row, student });
        }
      });

      if (validStudents.length === 0) {
        setImportProgress({
          total: data.length,
          success: 0,
          failed: data.length,
          errors,
          isProcessing: false
        });
        return;
      }

      // Send bulk create request to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/students/bulk-create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            students: validStudents.map(v => v.student)
          })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setImportProgress({
          total: data.length,
          success: result.created || validStudents.length,
          failed: errors.length + (result.errors?.length || 0),
          errors: [...errors, ...(result.errors || [])],
          isProcessing: false
        });

        // Refresh the students list
        await fetchStudents();

        // Show success message
        if (errors.length === 0 && (!result.errors || result.errors.length === 0)) {
          setTimeout(() => {
            setIsImportDialogOpen(false);
            setImportFile(null);
            setImportProgress({
              total: 0,
              success: 0,
              failed: 0,
              errors: [],
              isProcessing: false
            });
          }, 3000);
        }
      } else {
        alert(result.error || 'Failed to import students');
        setImportProgress(prev => ({ ...prev, isProcessing: false }));
      }
    } catch (error) {
      console.error('Error importing students:', error);
      alert('Failed to import students. Please check the file format.');
      setImportProgress(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const template = `Name,ID,Email,Phone,Course,Semester,Password
John Doe,2021WA15030,2021WA15030@pilani.bits-pilani.ac.in,+91 9876543210,B.Tech Computer Science,4th Semester,student123
Jane Smith,2021WA15031,2021WA15031@pilani.bits-pilani.ac.in,+91 9876543211,B.Tech Electronics,6th Semester,student123
`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Admin handlers
  const handleCreateAdmin = async () => {
    if (!adminFormData.username || !adminFormData.password) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/admins`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(adminFormData)
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchAdmins();
        setIsAdminDialogOpen(false);
        setAdminFormData({ username: "", password: "", name: "" });
      } else {
        alert(data.error || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Failed to create admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async (username: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/admins/${username}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchAdmins();
      } else {
        alert(data.error || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  // Staff handlers
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

  const handleCreateStaff = async () => {
    if (!staffFormData.username || !staffFormData.name || !staffFormData.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/staff`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(staffFormData)
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchStaff();
        setIsStaffDialogOpen(false);
        setStaffFormData({ username: "", name: "", email: "", phone: "", department: "", designation: "" });
        setEditingStaff(null);
      } else {
        alert(data.error || 'Failed to create staff member');
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      alert('Failed to create staff member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setStaffFormData({
      username: staffMember.username,
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      department: staffMember.department,
      designation: staffMember.designation
    });
    setIsStaffDialogOpen(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !staffFormData.name || !staffFormData.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/staff/${editingStaff.username}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(staffFormData)
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchStaff();
        setIsStaffDialogOpen(false);
        setStaffFormData({ username: "", name: "", email: "", phone: "", department: "", designation: "" });
        setEditingStaff(null);
      } else {
        alert(data.error || 'Failed to update staff member');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Failed to update staff member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (username: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/staff/${username}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchStaff();
      } else {
        alert(data.error || 'Failed to delete staff member');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  // Course instructor handlers
  const handleEditInstructor = (course: any) => {
    setEditingCourseInstructor(course);
    setIsEditInstructorDialogOpen(true);
  };

  const handleUpdateInstructor = async (newInstructor: string) => {
    if (!editingCourseInstructor || !newInstructor.trim()) {
      alert('Please enter an instructor name');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/courses/${editingCourseInstructor.id}/instructor`,
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
        await fetchCourses();
        setIsEditInstructorDialogOpen(false);
        setEditingCourseInstructor(null);
      } else {
        alert(data.error || 'Failed to update instructor');
      }
    } catch (error) {
      console.error('Error updating instructor:', error);
      alert('Failed to update instructor');
    } finally {
      setIsLoading(false);
    }
  };

  // If viewing course details, show AdminCourseDetailsPage
  if (showCourseDetails && selectedCourse) {
    return (
      <AdminCourseDetailsPage
        course={selectedCourse}
        onBack={() => {
          setShowCourseDetails(false);
          setSelectedCourse(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-red-100">BITS Pilani - System Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{adminUsername}</p>
                <p className="text-xs text-red-100">Administrator</p>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Announcements
              </CardTitle>
              <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{announcements.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total active</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Students
              </CardTitle>
              <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <GraduationCap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{students.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enrolled</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Courses
              </CardTitle>
              <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{courses.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Admins
              </CardTitle>
              <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{admins.length + 1}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Events
              </CardTitle>
              <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{events.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scheduled</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-2 shadow-sm border border-gray-200 dark:border-slate-700">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 bg-transparent p-0">
              <TabsTrigger 
                value="announcements"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-[rgb(25,35,94)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Megaphone className="w-4 h-4" />
                <span className="hidden sm:inline">Announcements</span>
                <span className="sm:hidden">Announce</span>
              </TabsTrigger>
              <TabsTrigger 
                value="courses"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-[rgb(25,35,94)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <BookOpen className="w-4 h-4" />
                <span>Courses</span>
              </TabsTrigger>
              <TabsTrigger 
                value="events"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-[rgb(25,35,94)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Calendar className="w-4 h-4" />
                <span>Events</span>
              </TabsTrigger>
              <TabsTrigger 
                value="students"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-[rgb(25,35,94)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Users className="w-4 h-4" />
                <span>Students</span>
              </TabsTrigger>
              <TabsTrigger 
                value="staff"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-[rgb(25,35,94)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Staff</span>
              </TabsTrigger>
              <TabsTrigger 
                value="admins"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-[rgb(25,35,94)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Shield className="w-4 h-4" />
                <span>Admins</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tickets"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-[rgb(25,35,94)] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Ticket className="w-4 h-4" />
                <span>Tickets</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="mt-0">
            <Card className="border border-gray-200 dark:border-slate-700 shadow-md">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">Manage Announcements</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create and manage announcements for students</p>
                  </div>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-[rgb(25,35,94)] hover:bg-[rgb(20,28,75)] text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Announcement
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gray-50 dark:bg-slate-900/50">
                <div className="space-y-3">
                  {announcements.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                        <Megaphone className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">No announcements yet</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create your first announcement to get started!</p>
                    </div>
                  ) : (
                    announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg hover:border-[rgb(25,35,94)] dark:hover:border-[rgb(25,35,94)] transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{announcement.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{announcement.content}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-0">
                                {announcement.category}
                              </Badge>
                              <Badge className={announcement.priority === 'high' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-0' 
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-0'}>
                                {announcement.priority} priority
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">by {announcement.createdBy}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">• {announcement.time}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-0">
            <Card className="border border-gray-200 dark:border-slate-700 shadow-md">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">Manage Courses</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{courses.length} total courses • Students see these exact courses in their portal</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gray-50 dark:bg-slate-900/50">
                {courses.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                      <BookOpen className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">No courses available yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Group courses by semester */}
                    {[1, 2, 3, 4, 5, 6].map(semester => {
                      const semesterCourses = courses.filter(c => c.semester === semester);
                      if (semesterCourses.length === 0) return null;
                      
                      return (
                        <div key={semester} className="space-y-4">
                          <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-slate-700">
                            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                              <GraduationCap className="w-5 h-5 text-[rgb(25,35,94)] dark:text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Semester {semester}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{semesterCourses.length} {semesterCourses.length === 1 ? 'course' : 'courses'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {semesterCourses.map(course => (
                              <div
                                key={course.id}
                                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg hover:border-[rgb(25,35,94)] dark:hover:border-[rgb(25,35,94)] transition-all duration-200"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base text-gray-900 dark:text-white mb-1 truncate">{course.title}</h4>
                                  </div>
                                  <Badge className={
                                    course.status === 'completed' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-0' :
                                    course.status === 'ongoing' 
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-0' :
                                    'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-0'
                                  }>
                                    {course.status}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                      <span className="truncate">
                                        {course.status === 'upcoming' || course.instructor === 'To be assigned' 
                                          ? 'TBA' 
                                          : (course.instructor || 'TBA')}
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-[rgb(25,35,94)] hover:bg-gray-100 dark:hover:bg-slate-700"
                                      onClick={() => handleEditInstructor(course)}
                                      title="Edit instructor"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {course.status === 'ongoing' && course.progress && (
                                  <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                      <span className="font-semibold text-[rgb(25,35,94)] dark:text-gray-300">{course.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-[rgb(25,35,94)] rounded-full transition-all duration-500"
                                        style={{ width: `${course.progress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-sm border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setShowCourseDetails(true);
                                  }}
                                >
                                  Manage Course
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-0">
            <Card className="border border-gray-200 dark:border-slate-700 shadow-md">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">Manage Events</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Schedule and manage academic events for students</p>
                  </div>
                  <Button
                    onClick={() => setIsEventDialogOpen(true)}
                    className="bg-[rgb(25,35,94)] hover:bg-[rgb(20,28,75)] text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gray-50 dark:bg-slate-900/50">
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                        <Calendar className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">No events scheduled yet</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create your first event for students!</p>
                    </div>
                  ) : (
                    events.map((event) => {
                      const eventDate = new Date(event.date);
                      const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      
                      const getEventTypeBadge = (type: string) => {
                        const badges = {
                          deadline: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
                          assignment: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
                          presentation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
                          meeting: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                          class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
                          exam: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
                          holiday: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
                          viva: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
                          lab_assessment: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
                        };
                        return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
                      };
                      
                      return (
                        <div
                          key={event.id}
                          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg hover:border-[rgb(25,35,94)] dark:hover:border-[rgb(25,35,94)] transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{event.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{event.description}</p>
                              <div className="flex items-center gap-4 flex-wrap text-sm mb-3">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                  <Calendar className="w-4 h-4 text-[rgb(25,35,94)] dark:text-gray-400" />
                                  <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                  <Clock className="w-4 h-4 text-[rgb(25,35,94)] dark:text-gray-400" />
                                  <span>{event.time}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <MapPin className="w-4 h-4 text-[rgb(25,35,94)] dark:text-gray-400" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`${getEventTypeBadge(event.type)} border-0`}>
                                  {event.type.replace('_', ' ')}
                                </Badge>
                                {event.course && (
                                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-0">{event.course}</Badge>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">by {event.createdBy || 'admin'}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="mt-0">
            <Card className="border border-gray-200 dark:border-slate-700 shadow-md">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">Manage Students</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add, edit, and manage student accounts</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsImportDialogOpen(true)}
                      variant="outline"
                      className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingStudent(null);
                        setStudentFormData({
                          id: "",
                          name: "",
                          username: "",
                          password: "student123",
                          phone: "",
                          course: "B.Tech Computer Science",
                          semester: "4th Semester"
                        });
                        setIsStudentDialogOpen(true);
                      }}
                      className="bg-[rgb(25,35,94)] hover:bg-[rgb(20,28,75)] text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Student
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gray-50 dark:bg-slate-900/50">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-slate-900/50">
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Student ID</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Course</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Semester</th>
                          <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{student.id}</td>
                            <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{student.name}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{student.username}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{student.course}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{student.semester}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                                  onClick={() => {
                                    setEditingStudent(student);
                                    setStudentFormData({
                                      id: student.id,
                                      name: student.name,
                                      username: student.username,
                                      password: student.password,
                                      phone: student.phone,
                                      course: student.course,
                                      semester: student.semester
                                    });
                                    setIsStudentDialogOpen(true);
                                  }}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => handleDeleteStudent(student.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="mt-0">
            <Card className="border border-gray-200 dark:border-slate-700 shadow-md">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">Manage Staff</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{staff.length} staff members • Assign to courses as instructors</p>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingStaff(null);
                      setStaffFormData({ username: "", name: "", email: "", phone: "", department: "", designation: "" });
                      setIsStaffDialogOpen(true);
                    }}
                    className="bg-[rgb(25,35,94)] hover:bg-[rgb(20,28,75)] text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gray-50 dark:bg-slate-900/50">
                {staff.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                      <GraduationCap className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">No staff members added yet</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add staff members to assign them as course instructors</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {staff.map((member) => (
                      <div 
                        key={member.id} 
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg hover:border-[rgb(25,35,94)] dark:hover:border-[rgb(25,35,94)] transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg flex-shrink-0">
                              <GraduationCap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base text-gray-900 dark:text-white truncate">{member.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{member.designation || 'Staff Member'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-[rgb(25,35,94)] hover:bg-gray-100 dark:hover:bg-slate-700"
                              onClick={() => handleEditStaff(member)}
                              title="Edit staff"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleDeleteStaff(member.username)}
                              title="Delete staff"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{member.username}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{member.department || 'No department'}</span>
                          </div>
                          {member.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <span className="text-xs truncate">{member.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="mt-0">
            <Card className="border border-gray-200 dark:border-slate-700 shadow-md">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">Manage Administrators</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Control admin access and permissions</p>
                  </div>
                  <Button
                    onClick={() => setIsAdminDialogOpen(true)}
                    className="bg-[rgb(25,35,94)] hover:bg-[rgb(20,28,75)] text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-gray-50 dark:bg-slate-900/50">
                <div className="space-y-3">
                  {/* Default Admin */}
                  <div className="bg-white dark:bg-slate-800 border-2 border-[rgb(25,35,94)] dark:border-[rgb(25,35,94)] rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                          <Shield className="w-5 h-5 text-[rgb(25,35,94)] dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white">admin</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Default Administrator (Cannot be deleted)</p>
                        </div>
                      </div>
                      <Badge className="bg-[rgb(25,35,94)] text-white dark:bg-slate-700 dark:text-gray-300 border-0 px-3 py-1">
                        Super Admin
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Additional Admins */}
                  {admins.map((admin) => (
                    <div 
                      key={admin.id} 
                      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg hover:border-[rgb(25,35,94)] dark:hover:border-[rgb(25,35,94)] transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{admin.username}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{admin.name || 'Administrator'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Created: {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteAdmin(admin.username)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {admins.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 mt-3">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                        <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">No additional administrators</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add new admin accounts to delegate responsibilities</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="mt-0">
            <AdminTicketsPage adminUsername={adminUsername} courses={courses} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Announcement Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>Create an announcement visible to all students</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter announcement title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="create-content">Content</Label>
              <Textarea
                id="create-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter announcement content"
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="create-category" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="IT Services">IT Services</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Hostel">Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="create-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                >
                  <SelectTrigger id="create-priority" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAnnouncement}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Creating..." : "Create Announcement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            <DialogDescription>
              {editingStudent ? 'Update student information' : 'Create a new student account'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-id">Student ID *</Label>
                <Input
                  id="student-id"
                  value={studentFormData.id}
                  onChange={(e) => setStudentFormData({ ...studentFormData, id: e.target.value })}
                  placeholder="2021WA15030"
                  className="mt-1"
                  disabled={!!editingStudent}
                />
              </div>
              <div>
                <Label htmlFor="student-name">Name *</Label>
                <Input
                  id="student-name"
                  value={studentFormData.name}
                  onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                  placeholder="Student Name"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="student-email">Email (Login Username) *</Label>
              <Input
                id="student-email"
                value={studentFormData.username}
                onChange={(e) => setStudentFormData({ ...studentFormData, username: e.target.value })}
                placeholder="2021WA15030@pilani.bits-pilani.ac.in"
                className="mt-1"
                disabled={!!editingStudent}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-password">Password *</Label>
                <Input
                  id="student-password"
                  value={studentFormData.password}
                  onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                  placeholder="student123"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="student-phone">Phone</Label>
                <Input
                  id="student-phone"
                  value={studentFormData.phone}
                  onChange={(e) => setStudentFormData({ ...studentFormData, phone: e.target.value })}
                  placeholder="+91 0000000000"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-course">Course</Label>
                <Input
                  id="student-course"
                  value={studentFormData.course}
                  onChange={(e) => setStudentFormData({ ...studentFormData, course: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="student-semester">Semester</Label>
                <Input
                  id="student-semester"
                  value={studentFormData.semester}
                  onChange={(e) => setStudentFormData({ ...studentFormData, semester: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsStudentDialogOpen(false);
                  setEditingStudent(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={editingStudent ? handleUpdateStudent : handleCreateStudent}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Saving..." : (editingStudent ? "Update Student" : "Create Student")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Create a new event that will be visible to all students in their calendar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Event Title *</Label>
              <Input
                id="event-title"
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                placeholder="Mid-Semester Examination"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-date">Date *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={eventFormData.date}
                  onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="event-time">Time *</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={eventFormData.time}
                  onChange={(e) => setEventFormData({ ...eventFormData, time: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event-type">Event Type *</Label>
              <Select
                value={eventFormData.type}
                onValueChange={(value) => setEventFormData({ ...eventFormData, type: value as Event["type"] })}
              >
                <SelectTrigger id="event-type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="viva">Viva</SelectItem>
                  <SelectItem value="lab_assessment">Lab Assessment</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="event-course">Course (Optional)</Label>
              <Input
                id="event-course"
                value={eventFormData.course}
                onChange={(e) => setEventFormData({ ...eventFormData, course: e.target.value })}
                placeholder="SSWT ZC467 - Software Testing"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="event-location">Location (Optional)</Label>
              <Input
                id="event-location"
                value={eventFormData.location}
                onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                placeholder="Lab 3, Main Building"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="event-description">Description (Optional)</Label>
              <Textarea
                id="event-description"
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                placeholder="Provide details about the event..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEventDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Creating..." : "Create Event & Notify Students"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Dialog */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Administrator</DialogTitle>
            <DialogDescription>Create a new admin account with full system access</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-username">Username *</Label>
              <Input
                id="admin-username"
                value={adminFormData.username}
                onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                placeholder="admin_username"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="admin-password">Password *</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminFormData.password}
                onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                placeholder="Enter secure password"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="admin-name">Display Name</Label>
              <Input
                id="admin-name"
                value={adminFormData.name}
                onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                placeholder="Administrator Name"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAdminDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAdmin}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Creating..." : "Create Admin"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Staff Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Update staff member information' : 'Add a new staff member to assign as course instructor'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staff-username">Username *</Label>
                <Input
                  id="staff-username"
                  value={staffFormData.username}
                  onChange={(e) => setStaffFormData({ ...staffFormData, username: e.target.value })}
                  placeholder="staff_username"
                  className="mt-1"
                  disabled={!!editingStaff}
                />
              </div>
              <div>
                <Label htmlFor="staff-name">Full Name *</Label>
                <Input
                  id="staff-name"
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  placeholder="Dr. John Smith"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staff-email">Email *</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  placeholder="john.smith@pilani.bits-pilani.ac.in"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="staff-phone">Phone</Label>
                <Input
                  id="staff-phone"
                  value={staffFormData.phone}
                  onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staff-department">Department</Label>
                <Input
                  id="staff-department"
                  value={staffFormData.department}
                  onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                  placeholder="Computer Science"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="staff-designation">Designation</Label>
                <Input
                  id="staff-designation"
                  value={staffFormData.designation}
                  onChange={(e) => setStaffFormData({ ...staffFormData, designation: e.target.value })}
                  placeholder="Associate Professor"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsStaffDialogOpen(false);
                  setEditingStaff(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={editingStaff ? handleUpdateStaff : handleCreateStaff}
                disabled={isLoading}
                className="bg-[rgb(25,35,94)] hover:bg-[rgb(20,28,75)]"
              >
                {isLoading ? 'Saving...' : (editingStaff ? 'Update Staff' : 'Add Staff')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Instructor Dialog */}
      <Dialog open={isEditInstructorDialogOpen} onOpenChange={setIsEditInstructorDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Instructor</DialogTitle>
            <DialogDescription>
              Assign an instructor to {editingCourseInstructor?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="instructor-name">Instructor Name *</Label>
              <Input
                id="instructor-name"
                defaultValue={editingCourseInstructor?.instructor || ''}
                placeholder="Enter instructor name or select from staff"
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateInstructor((e.target as HTMLInputElement).value);
                  }
                }}
              />
            </div>

            {staff.length > 0 && (
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">Or select from staff:</Label>
                <div className="mt-2 max-h-48 overflow-y-auto space-y-2 border border-gray-200 dark:border-slate-700 rounded-lg p-2">
                  {staff.map((member) => (
                    <Button
                      key={member.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        const input = document.getElementById('instructor-name') as HTMLInputElement;
                        if (input) input.value = member.name;
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{member.name}</div>
                        <div className="text-xs text-gray-500 truncate">{member.designation || 'Staff'} - {member.department || 'No dept'}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditInstructorDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const input = document.getElementById('instructor-name') as HTMLInputElement;
                  if (input) handleUpdateInstructor(input.value);
                }}
                disabled={isLoading}
                className="bg-[rgb(25,35,94)] hover:bg-[rgb(20,28,75)]"
              >
                {isLoading ? 'Updating...' : 'Update Instructor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Students Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Students from Excel/CSV</DialogTitle>
            <DialogDescription>
              Upload an Excel (.xlsx, .xls) or CSV file with student data to create multiple students at once
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Download Template */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Need a template?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Download our sample template to see the required format
                  </p>
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    size="sm"
                    className="mt-2 border-blue-600 text-blue-600 hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </div>

            {/* Required Format Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Name</strong> - Full name of the student (required)</li>
                <li>• <strong>ID</strong> - Student ID (e.g., 2021WA15030) (required)</li>
                <li>• <strong>Email</strong> - Email address/username (required)</li>
                <li>• <strong>Phone</strong> - Phone number (optional)</li>
                <li>• <strong>Course</strong> - Course name (default: B.Tech Computer Science)</li>
                <li>• <strong>Semester</strong> - Current semester (default: 4th Semester)</li>
                <li>• <strong>Password</strong> - Login password (default: student123)</li>
              </ul>
            </div>

            {/* File Upload Area */}
            {!importProgress.isProcessing && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {importFile ? (
                  <div className="space-y-3">
                    <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto" />
                    <div>
                      <p className="font-medium text-gray-900">{importFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(importFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setImportFile(null)}
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={handleImportStudents}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isLoading ? 'Importing...' : 'Import Students'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-700 font-medium">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Supports .xlsx, .xls, and .csv files
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Progress Display */}
            {importProgress.isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-700 font-medium">Processing students...</p>
                </div>
              </div>
            )}

            {/* Results Display */}
            {!importProgress.isProcessing && importProgress.total > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{importProgress.total}</p>
                    <p className="text-sm text-gray-600">Total Rows</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-900">{importProgress.success}</p>
                    <p className="text-sm text-green-700">Successful</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-900">{importProgress.failed}</p>
                    <p className="text-sm text-red-700">Failed</p>
                  </div>
                </div>

                {/* Error Details */}
                {importProgress.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900">Errors Found:</h4>
                        <div className="mt-2 space-y-2">
                          {importProgress.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-800 bg-white rounded p-2">
                              <p className="font-medium">Row {error.row}: {error.name}</p>
                              <p className="text-red-600">{error.error}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {importProgress.failed === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Import Completed Successfully!</p>
                        <p className="text-sm text-green-700 mt-1">
                          All {importProgress.success} students have been created.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!importProgress.isProcessing && importProgress.total > 0 && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsImportDialogOpen(false);
                    setImportFile(null);
                    setImportProgress({
                      total: 0,
                      success: 0,
                      failed: 0,
                      errors: [],
                      isProcessing: false
                    });
                  }}
                >
                  Close
                </Button>
                {importProgress.failed > 0 && (
                  <Button
                    onClick={() => {
                      setImportFile(null);
                      setImportProgress({
                        total: 0,
                        success: 0,
                        failed: 0,
                        errors: [],
                        isProcessing: false
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
