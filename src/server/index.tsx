import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import * as announcements from "./announcements.tsx";
import * as courses from "./courses.tsx";
import * as events from "./events.tsx";
import * as tickets from "./tickets.tsx";

const app = new Hono();

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize storage bucket on startup
const bucketName = 'make-917daa5d-files';

async function initializeBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain', 'text/markdown'
        ],
        fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
  }
}

// Initialize bucket on startup
initializeBucket();

// Initialize admin credentials
announcements.initializeAdmin();

// Initialize student credentials
courses.initializeStudents();

// Initialize staff members
courses.initializeStaff();

// Initialize courses
courses.initializeCourses();

// Initialize events storage
events.initializeEvents();

// Health check endpoint
app.get("/make-server-917daa5d/health", (c) => {
  return c.json({ status: "ok" });
});

// File upload endpoint
app.post("/make-server-917daa5d/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const noteId = formData.get('noteId') as string;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (!noteId) {
      return c.json({ error: 'Note ID is required' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || '';
    const fileName = `${noteId}/${timestamp}-${file.name}`;

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, new Uint8Array(fileBuffer), {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Failed to upload file: ' + error.message }, 500);
    }

    // Create signed URL for the uploaded file
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600 * 24 * 365); // 1 year expiry

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return c.json({ error: 'Failed to create file access URL' }, 500);
    }

    // Store file metadata in KV store
    const fileData = {
      id: `file-${timestamp}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: signedUrlData.signedUrl,
      path: fileName,
      noteId: noteId,
      uploadDate: new Date().toISOString()
    };

    await kv.set(`file:${fileData.id}`, fileData);

    return c.json({
      success: true,
      file: fileData
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    return c.json({ 
      error: 'Upload processing failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// Get files for a note
app.get("/make-server-917daa5d/files/:noteId", async (c) => {
  try {
    const noteId = c.req.param('noteId');
    
    // Get all file keys for this note
    const fileKeys = await kv.getByPrefix(`file:`);
    const noteFiles = fileKeys.filter((file: any) => file.noteId === noteId);

    // Refresh signed URLs for files older than 30 days
    const updatedFiles = await Promise.all(
      noteFiles.map(async (file: any) => {
        const uploadDate = new Date(file.uploadDate);
        const daysSinceUpload = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceUpload > 30) {
          const { data: newSignedUrl, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(file.path, 3600 * 24 * 365);
          
          if (!error && newSignedUrl) {
            file.url = newSignedUrl.signedUrl;
            await kv.set(`file:${file.id}`, file);
          }
        }
        
        return file;
      })
    );

    return c.json({ files: updatedFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    return c.json({ error: 'Failed to fetch files' }, 500);
  }
});

// Delete file
app.delete("/make-server-917daa5d/files/:fileId", async (c) => {
  try {
    const fileId = c.req.param('fileId');
    
    // Get file metadata
    const fileData = await kv.get(`file:${fileId}`);
    if (!fileData) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([fileData.path]);

    if (deleteError) {
      console.error('Storage deletion error:', deleteError);
      // Continue to delete metadata even if storage deletion fails
    }

    // Delete metadata from KV store
    await kv.del(`file:${fileId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// ===== COURSE MATERIAL ENDPOINTS =====

// Upload course material (Admin only)
app.post("/make-server-917daa5d/upload-course-material", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string; // 'paper' or 'ppt'
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (!courseId || !title) {
      return c.json({ error: 'Course ID and title are required' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || '';
    const fileName = `courses/${courseId}/${type}/${timestamp}-${file.name}`;

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, new Uint8Array(fileBuffer), {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Failed to upload file: ' + error.message }, 500);
    }

    // Create signed URL for the uploaded file (1 year expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600 * 24 * 365);

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return c.json({ error: 'Failed to create file access URL' }, 500);
    }

    // Store material metadata in KV store
    const materialData = {
      id: `material-${timestamp}`,
      courseId: courseId,
      title: title,
      description: description,
      type: type,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: signedUrlData.signedUrl,
      filePath: fileName,
      uploadedBy: 'admin',
      uploadedAt: new Date().toISOString()
    };

    await kv.set(`course-material:${courseId}:${materialData.id}`, materialData);

    console.log(`✅ Course material uploaded: ${title} for course ${courseId}`);

    return c.json({
      success: true,
      material: materialData,
      fileUrl: signedUrlData.signedUrl
    });

  } catch (error) {
    console.error('Course material upload error:', error);
    return c.json({ 
      error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// Get course materials
app.get("/make-server-917daa5d/course-materials/:courseId", async (c) => {
  try {
    const courseId = c.req.param('courseId');
    
    // Get all materials for this course
    const materials = await kv.getByPrefix(`course-material:${courseId}:`);
    
    // Refresh signed URLs for materials older than 30 days
    const updatedMaterials = await Promise.all(
      materials.map(async (material: any) => {
        const uploadDate = new Date(material.uploadedAt);
        const daysSinceUpload = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceUpload > 30) {
          const { data: newSignedUrl, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(material.filePath, 3600 * 24 * 365);
          
          if (!error && newSignedUrl) {
            material.fileUrl = newSignedUrl.signedUrl;
            await kv.set(`course-material:${courseId}:${material.id}`, material);
          }
        }
        
        return material;
      })
    );

    return c.json({
      success: true,
      materials: updatedMaterials
    });

  } catch (error) {
    console.error('Error fetching course materials:', error);
    return c.json({ error: 'Failed to fetch materials' }, 500);
  }
});

// Get enrolled students for a course
app.get("/make-server-917daa5d/courses/:courseId/students", async (c) => {
  try {
    const courseId = c.req.param('courseId');
    
    // Get all students
    const allStudents = await kv.getByPrefix('student:');
    
    // For now, return all students (in production, filter by enrolled courses)
    // Filter out sensitive data like passwords
    const students = allStudents.map((student: any) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course,
      semester: student.semester,
      status: 'active'
    }));

    console.log(`✅ Fetched ${students.length} enrolled students for course ${courseId}`);

    return c.json({
      success: true,
      students: students
    });

  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    return c.json({ error: 'Failed to fetch students' }, 500);
  }
});

// Create quiz (Admin only) - simplified with just link
app.post("/make-server-917daa5d/create-quiz", async (c) => {
  try {
    const quizData = await c.req.json();
    
    const quizId = `quiz-${quizData.courseId}-${Date.now()}`;
    const quiz = {
      id: quizId,
      courseId: quizData.courseId,
      courseName: quizData.courseName,
      title: quizData.title,
      link: quizData.link, // Google Forms or external quiz link
      startDate: quizData.startDate,
      endDate: quizData.endDate,
      maxMarks: quizData.maxMarks || 5,
      status: quizData.status || 'Available',
      semester: quizData.semester,
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };
    
    await kv.set(quizId, quiz);
    
    console.log(`✅ Quiz created: ${quiz.title} for course ${quiz.courseName} with link: ${quiz.link}`);
    
    return c.json({
      success: true,
      quiz: quiz
    });
    
  } catch (error) {
    console.error('Error creating quiz:', error);
    return c.json({ error: 'Failed to create quiz' }, 500);
  }
});

// Get quizzes for a course
app.get("/make-server-917daa5d/course-quizzes/:courseId", async (c) => {
  try {
    const courseId = c.req.param('courseId');
    
    // Get all quizzes and filter by courseId
    const allQuizzes = await kv.getByPrefix('quiz-');
    const courseQuizzes = allQuizzes.filter((q: any) => q.courseId === courseId);
    
    console.log(`✅ Fetched ${courseQuizzes.length} quizzes for course ${courseId}`);
    
    return c.json({
      success: true,
      quizzes: courseQuizzes
    });
    
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return c.json({ error: 'Failed to fetch quizzes' }, 500);
  }
});

// ===== ANNOUNCEMENT ENDPOINTS =====

// Admin login
app.post("/make-server-917daa5d/admin/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const result = await announcements.verifyAdmin(username, password);
    
    if (result.success) {
      return c.json({ success: true, role: result.role });
    } else {
      return c.json({ success: false, error: result.error }, 401);
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get all announcements (public)
app.get("/make-server-917daa5d/announcements", async (c) => {
  try {
    const allAnnouncements = await announcements.getAnnouncements();
    return c.json({ announcements: allAnnouncements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return c.json({ error: 'Failed to fetch announcements' }, 500);
  }
});

// Create announcement (admin only)
app.post("/make-server-917daa5d/announcements", async (c) => {
  try {
    const announcementData = await c.req.json();
    const result = await announcements.createAnnouncement(announcementData);
    
    if (result.success) {
      return c.json({ success: true, announcement: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error creating announcement:', error);
    return c.json({ error: 'Failed to create announcement' }, 500);
  }
});

// Update announcement (admin only)
app.put("/make-server-917daa5d/announcements/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const result = await announcements.updateAnnouncement(id, updates);
    
    if (result.success) {
      return c.json({ success: true, announcement: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error updating announcement:', error);
    return c.json({ error: 'Failed to update announcement' }, 500);
  }
});

// Delete announcement (admin only)
app.delete("/make-server-917daa5d/announcements/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const result = await announcements.deleteAnnouncement(id);
    
    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return c.json({ error: 'Failed to delete announcement' }, 500);
  }
});

// ===== EVENT ENDPOINTS =====

// Get all events (public - for students)
app.get("/make-server-917daa5d/events", async (c) => {
  try {
    const allEvents = await events.getEvents();
    return c.json({ events: allEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// Create event (admin only)
app.post("/make-server-917daa5d/events", async (c) => {
  try {
    const eventData = await c.req.json();
    const newEvent = await events.createEvent(eventData);
    return c.json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

// Update event (admin only)
app.put("/make-server-917daa5d/events/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const updatedEvent = await events.updateEvent(id, updates);
    return c.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    return c.json({ error: 'Failed to update event' }, 500);
  }
});

// Delete event (admin only)
app.delete("/make-server-917daa5d/events/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await events.deleteEvent(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

// ===== COURSE ENDPOINTS =====

// Student login
app.post("/make-server-917daa5d/student/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const result = await courses.verifyStudent(username, password);
    
    if (result.success) {
      return c.json({ success: true, student: result.student });
    } else {
      return c.json({ success: false, error: result.error }, 401);
    }
  } catch (error) {
    console.error('Student login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get all courses (public)
app.get("/make-server-917daa5d/courses", async (c) => {
  try {
    const allCourses = await courses.getCourses();
    return c.json({ courses: allCourses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return c.json({ error: 'Failed to fetch courses' }, 500);
  }
});

// Create course (admin only)
app.post("/make-server-917daa5d/courses", async (c) => {
  try {
    const courseData = await c.req.json();
    const result = await courses.createCourse(courseData);
    
    if (result.success) {
      return c.json({ success: true, course: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error creating course:', error);
    return c.json({ error: 'Failed to create course' }, 500);
  }
});

// Update course (admin only)
app.put("/make-server-917daa5d/courses/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const result = await courses.updateCourse(id, updates);
    
    if (result.success) {
      return c.json({ success: true, course: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error updating course:', error);
    return c.json({ error: 'Failed to update course' }, 500);
  }
});

// Delete course (admin only)
app.delete("/make-server-917daa5d/courses/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const result = await courses.deleteCourse(id);
    
    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    return c.json({ error: 'Failed to delete course' }, 500);
  }
});

// ===== QUIZ ENDPOINTS =====

// Get all quizzes (public)
app.get("/make-server-917daa5d/quizzes", async (c) => {
  try {
    const allQuizzes = await courses.getQuizzes();
    return c.json({ quizzes: allQuizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return c.json({ error: 'Failed to fetch quizzes' }, 500);
  }
});

// Create quiz (admin only)
app.post("/make-server-917daa5d/quizzes", async (c) => {
  try {
    const quizData = await c.req.json();
    const result = await courses.createQuiz(quizData);
    
    if (result.success) {
      return c.json({ success: true, quiz: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error creating quiz:', error);
    return c.json({ error: 'Failed to create quiz' }, 500);
  }
});

// Update quiz (admin only)
app.put("/make-server-917daa5d/quizzes/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const result = await courses.updateQuiz(id, updates);
    
    if (result.success) {
      return c.json({ success: true, quiz: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error updating quiz:', error);
    return c.json({ error: 'Failed to update quiz' }, 500);
  }
});

// Delete quiz (admin only)
app.delete("/make-server-917daa5d/quizzes/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const result = await courses.deleteQuiz(id);
    
    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return c.json({ error: 'Failed to delete quiz' }, 500);
  }
});

// Submit quiz (student)
app.post("/make-server-917daa5d/quizzes/:id/submit", async (c) => {
  try {
    const quizId = c.req.param('id');
    const submissionData = await c.req.json();
    const result = await courses.submitQuiz({ ...submissionData, quizId });
    
    if (result.success) {
      return c.json({ success: true, submission: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return c.json({ error: 'Failed to submit quiz' }, 500);
  }
});

// Get quiz submissions
app.get("/make-server-917daa5d/submissions", async (c) => {
  try {
    const quizId = c.req.query('quizId');
    const studentId = c.req.query('studentId');
    const submissions = await courses.getQuizSubmissions(quizId, studentId);
    return c.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return c.json({ error: 'Failed to fetch submissions' }, 500);
  }
});

// Get all students (admin only)
app.get("/make-server-917daa5d/students", async (c) => {
  try {
    const students = await courses.getStudents();
    return c.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return c.json({ error: 'Failed to fetch students' }, 500);
  }
});

// Create student (admin only)
app.post("/make-server-917daa5d/students", async (c) => {
  try {
    const studentData = await c.req.json();
    const result = await courses.createStudent(studentData);
    
    if (result.success) {
      return c.json({ success: true, student: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error creating student:', error);
    return c.json({ error: 'Failed to create student' }, 500);
  }
});

// Bulk create students (admin only)
app.post("/make-server-917daa5d/students/bulk-create", async (c) => {
  try {
    const { students } = await c.req.json();
    
    if (!Array.isArray(students) || students.length === 0) {
      return c.json({ success: false, error: 'No students provided' }, 400);
    }

    console.log(`Bulk creating ${students.length} students...`);
    
    const results = {
      success: true,
      created: 0,
      failed: 0,
      errors: [] as Array<{ row: number; name: string; error: string }>
    };

    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];
      
      try {
        const result = await courses.createStudent(studentData);
        
        if (result.success) {
          results.created++;
          console.log(`✓ Created student ${i + 1}/${students.length}: ${studentData.name}`);
        } else {
          results.failed++;
          results.errors.push({
            row: i + 2, // Excel row (1-indexed + header)
            name: studentData.name || studentData.id || 'Unknown',
            error: result.error || 'Failed to create student'
          });
          console.log(`✗ Failed student ${i + 1}/${students.length}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 2,
          name: studentData.name || studentData.id || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`✗ Exception creating student ${i + 1}:`, error);
      }
    }

    console.log(`Bulk import complete: ${results.created} created, ${results.failed} failed`);
    
    return c.json(results);
  } catch (error) {
    console.error('Error in bulk student creation:', error);
    return c.json({ 
      success: false, 
      error: 'Bulk import failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, 500);
  }
});

// Update student (admin only)
app.put("/make-server-917daa5d/students/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const result = await courses.updateStudent(id, updates);
    
    if (result.success) {
      return c.json({ success: true, student: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error updating student:', error);
    return c.json({ error: 'Failed to update student' }, 500);
  }
});

// Delete student (admin only)
app.delete("/make-server-917daa5d/students/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const result = await courses.deleteStudent(id);
    
    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    return c.json({ error: 'Failed to delete student' }, 500);
  }
});

// ===== ADMIN MANAGEMENT ENDPOINTS =====

// Get all admins
app.get("/make-server-917daa5d/admins", async (c) => {
  try {
    const admins = await courses.getAdmins();
    return c.json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return c.json({ error: 'Failed to fetch admins' }, 500);
  }
});

// Create admin
app.post("/make-server-917daa5d/admins", async (c) => {
  try {
    const adminData = await c.req.json();
    const result = await courses.createAdmin(adminData);
    
    if (result.success) {
      return c.json({ success: true, admin: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error creating admin:', error);
    return c.json({ error: 'Failed to create admin' }, 500);
  }
});

// Update admin
app.put("/make-server-917daa5d/admins/:username", async (c) => {
  try {
    const username = c.req.param('username');
    const updates = await c.req.json();
    const result = await courses.updateAdmin(username, updates);
    
    if (result.success) {
      return c.json({ success: true, admin: result.data });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error updating admin:', error);
    return c.json({ error: 'Failed to update admin' }, 500);
  }
});

// Delete admin
app.delete("/make-server-917daa5d/admins/:username", async (c) => {
  try {
    const username = c.req.param('username');
    const result = await courses.deleteAdmin(username);
    
    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error deleting admin:', error);
    return c.json({ error: 'Failed to delete admin' }, 500);
  }
});

// ===== STAFF MANAGEMENT ENDPOINTS =====

// Get all staff
app.get("/make-server-917daa5d/staff", async (c) => {
  try {
    const staff = await courses.getAllStaff();
    return c.json({ success: true, staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return c.json({ error: 'Failed to fetch staff' }, 500);
  }
});

// Create staff
app.post("/make-server-917daa5d/staff", async (c) => {
  try {
    const body = await c.req.json();
    const result = await courses.createStaff(body);
    
    if (result.success) {
      return c.json({ success: true, staff: result.staff });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error creating staff:', error);
    return c.json({ error: 'Failed to create staff' }, 500);
  }
});

// Update staff
app.put("/make-server-917daa5d/staff/:username", async (c) => {
  try {
    const username = c.req.param('username');
    const body = await c.req.json();
    const result = await courses.updateStaff(username, body);
    
    if (result.success) {
      return c.json({ success: true, staff: result.staff });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error updating staff:', error);
    return c.json({ error: 'Failed to update staff' }, 500);
  }
});

// Delete staff
app.delete("/make-server-917daa5d/staff/:username", async (c) => {
  try {
    const username = c.req.param('username');
    const result = await courses.deleteStaff(username);
    
    if (result.success) {
      return c.json({ success: true });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error deleting staff:', error);
    return c.json({ error: 'Failed to delete staff' }, 500);
  }
});

// Update course instructor
app.put("/make-server-917daa5d/courses/:courseId/instructor", async (c) => {
  try {
    const courseId = c.req.param('courseId');
    const { instructor } = await c.req.json();
    const result = await courses.updateCourseInstructor(courseId, instructor);
    
    if (result.success) {
      return c.json({ success: true, course: result.course });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    console.error('Error updating course instructor:', error);
    return c.json({ error: 'Failed to update course instructor' }, 500);
  }
});

// ===== TICKET SYSTEM ENDPOINTS =====

// Get ticket statistics (total count, etc.)
app.get("/make-server-917daa5d/tickets/stats", async (c) => {
  try {
    const totalCount = await tickets.getTotalTicketCount();
    const allTickets = await tickets.getAllTickets();
    return c.json({ 
      success: true, 
      totalCount,
      activeCount: allTickets.filter(t => t.status !== 'closed').length,
      closedCount: allTickets.filter(t => t.status === 'closed').length
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    return c.json({ error: 'Failed to fetch ticket stats' }, 500);
  }
});

// Get all tickets (admin only)
app.get("/make-server-917daa5d/tickets", async (c) => {
  try {
    const allTickets = await tickets.getAllTickets();
    const totalCount = await tickets.getTotalTicketCount();
    return c.json({ success: true, tickets: allTickets, totalCount });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

// Get tickets by student email
app.get("/make-server-917daa5d/tickets/student/:email", async (c) => {
  try {
    const email = c.req.param('email');
    const studentTickets = await tickets.getTicketsByStudent(email);
    return c.json({ success: true, tickets: studentTickets });
  } catch (error) {
    console.error('Error fetching student tickets:', error);
    return c.json({ error: 'Failed to fetch student tickets' }, 500);
  }
});

// Get tickets by course
app.get("/make-server-917daa5d/tickets/course/:courseId", async (c) => {
  try {
    const courseId = c.req.param('courseId');
    const courseTickets = await tickets.getTicketsByCourse(courseId);
    return c.json({ success: true, tickets: courseTickets });
  } catch (error) {
    console.error('Error fetching course tickets:', error);
    return c.json({ error: 'Failed to fetch course tickets' }, 500);
  }
});

// Get tickets by status
app.get("/make-server-917daa5d/tickets/status/:status", async (c) => {
  try {
    const status = c.req.param('status');
    const statusTickets = await tickets.getTicketsByStatus(status);
    return c.json({ success: true, tickets: statusTickets });
  } catch (error) {
    console.error('Error fetching tickets by status:', error);
    return c.json({ error: 'Failed to fetch tickets by status' }, 500);
  }
});

// Create new ticket
app.post("/make-server-917daa5d/tickets", async (c) => {
  try {
    const ticketData = await c.req.json();
    
    const newTicket = await tickets.createTicket({
      studentId: ticketData.studentId,
      studentName: ticketData.studentName,
      studentEmail: ticketData.studentEmail,
      courseId: ticketData.courseId,
      courseName: ticketData.courseName,
      subject: ticketData.subject,
      description: ticketData.description,
      category: ticketData.category || 'general',
      status: 'open',
      priority: ticketData.priority || 'medium'
    });
    
    // Auto-assign if course has staff assigned
    if (newTicket.courseId) {
      await tickets.autoAssignTicket(newTicket.id, newTicket.courseId);
    }
    
    return c.json({ success: true, ticket: newTicket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return c.json({ error: 'Failed to create ticket' }, 500);
  }
});

// Update ticket
app.put("/make-server-917daa5d/tickets/:ticketId", async (c) => {
  try {
    const ticketId = c.req.param('ticketId');
    const updates = await c.req.json();
    
    const updatedTicket = await tickets.updateTicket(ticketId, updates);
    
    if (!updatedTicket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }
    
    return c.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return c.json({ error: 'Failed to update ticket' }, 500);
  }
});

// Add response to ticket
app.post("/make-server-917daa5d/tickets/:ticketId/responses", async (c) => {
  try {
    const ticketId = c.req.param('ticketId');
    const responseData = await c.req.json();
    
    const updatedTicket = await tickets.addTicketResponse(
      ticketId,
      responseData.author,
      responseData.authorRole,
      responseData.message,
      responseData.isResolution || false
    );
    
    if (!updatedTicket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }
    
    // If it's a resolution/response from admin, create announcement for student
    if (responseData.authorRole === 'admin' || responseData.authorRole === 'staff') {
      const announcement = {
        title: `Response to: ${updatedTicket.subject}`,
        content: responseData.message,
        priority: responseData.isResolution ? 'high' : 'medium',
        category: 'Support',
        targetStudent: updatedTicket.studentEmail
      };
      
      await announcements.createAnnouncement(announcement);
      console.log(`✅ Created announcement for student: ${updatedTicket.studentEmail}`);
    }
    
    return c.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('Error adding ticket response:', error);
    return c.json({ error: 'Failed to add response' }, 500);
  }
});

// Close ticket
app.put("/make-server-917daa5d/tickets/:ticketId/close", async (c) => {
  try {
    const ticketId = c.req.param('ticketId');
    const updatedTicket = await tickets.closeTicket(ticketId);
    
    if (!updatedTicket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }
    
    return c.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('Error closing ticket:', error);
    return c.json({ error: 'Failed to close ticket' }, 500);
  }
});

// Delete ticket
app.delete("/make-server-917daa5d/tickets/:ticketId", async (c) => {
  try {
    const ticketId = c.req.param('ticketId');
    await tickets.deleteTicket(ticketId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return c.json({ error: 'Failed to delete ticket' }, 500);
  }
});

// ===== STAFF ASSIGNMENT ENDPOINTS =====

// Get all staff assignments
app.get("/make-server-917daa5d/staff-assignments", async (c) => {
  try {
    const assignments = await tickets.getAllStaffAssignments();
    return c.json({ success: true, assignments });
  } catch (error) {
    console.error('Error fetching staff assignments:', error);
    return c.json({ error: 'Failed to fetch staff assignments' }, 500);
  }
});

// Assign staff to course
app.post("/make-server-917daa5d/staff-assignments", async (c) => {
  try {
    const data = await c.req.json();
    
    const assignment = await tickets.assignStaffToCourse(
      data.staffUsername,
      data.staffName,
      data.courseId,
      data.courseName
    );
    
    return c.json({ success: true, assignment });
  } catch (error) {
    console.error('Error assigning staff:', error);
    return c.json({ error: 'Failed to assign staff' }, 500);
  }
});

// Remove staff assignment
app.delete("/make-server-917daa5d/staff-assignments/:assignmentId", async (c) => {
  try {
    const assignmentId = c.req.param('assignmentId');
    await tickets.removeStaffAssignment(assignmentId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing staff assignment:', error);
    return c.json({ error: 'Failed to remove staff assignment' }, 500);
  }
});

Deno.serve(app.fetch);