import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ===================
// KV STORE (In-memory)
// ===================
const kvStore = new Map<string, any>();
const kv = {
  async set(key: string, value: any) {
    kvStore.set(key, value);
  },
  async get(key: string) {
    return kvStore.get(key);
  },
  async del(key: string) {
    kvStore.delete(key);
  },
  async getByPrefix(prefix: string) {
    return Array.from(kvStore.entries())
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => value);
  },
};

// ===================
// SUPABASE INIT
// ===================
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const bucketName = "make-917daa5d-files";

// ===================
// Hono APP INIT
// ===================
const app = new Hono();

// Middleware
app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// ===================
// STORAGE BUCKET INIT
// ===================
async function initializeBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === bucketName);

    if (!exists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "text/markdown",
        ],
        fileSizeLimit: 50 * 1024 * 1024,
      });
      if (error) console.error("Bucket creation error:", error);
      else console.log("✅ Storage bucket created");
    }
  } catch (error) {
    console.error("Error initializing bucket:", error);
  }
}
initializeBucket();

// ===================
// HEALTH CHECK
// ===================
app.get("/make-server-917daa5d/health", (c) => c.json({ status: "ok" }));

// ===================
// FILE UPLOAD & MANAGEMENT
// ===================
app.post("/make-server-917daa5d/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const noteId = formData.get("noteId") as string;
    if (!file) return c.json({ error: "No file provided" }, 400);
    if (!noteId) return c.json({ error: "Note ID required" }, 400);

    const timestamp = Date.now();
    const fileName = `${noteId}/${timestamp}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, new Uint8Array(fileBuffer), { contentType: file.type });
    if (error) return c.json({ error: error.message }, 500);

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600 * 24 * 365);
    if (signedUrlError) return c.json({ error: signedUrlError.message }, 500);

    const fileData = {
      id: `file-${timestamp}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: signedUrlData.signedUrl,
      path: fileName,
      noteId,
      uploadDate: new Date().toISOString(),
    };
    await kv.set(`file:${fileData.id}`, fileData);

    return c.json({ success: true, file: fileData });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

app.get("/make-server-917daa5d/files/:noteId", async (c) => {
  try {
    const noteId = c.req.param("noteId");
    const files = (await kv.getByPrefix("file:")).filter((f: any) => f.noteId === noteId);

    const updatedFiles = await Promise.all(
      files.map(async (file: any) => {
        const daysOld = (Date.now() - new Date(file.uploadDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysOld > 30) {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(file.path, 3600 * 24 * 365);
          if (!error && data) {
            file.url = data.signedUrl;
            await kv.set(`file:${file.id}`, file);
          }
        }
        return file;
      })
    );
    return c.json({ files: updatedFiles });
  } catch {
    return c.json({ error: "Failed to fetch files" }, 500);
  }
});

app.delete("/make-server-917daa5d/files/:fileId", async (c) => {
  try {
    const fileId = c.req.param("fileId");
    const fileData = await kv.get(`file:${fileId}`);
    if (!fileData) return c.json({ error: "File not found" }, 404);

    await supabase.storage.from(bucketName).remove([fileData.path]);
    await kv.del(`file:${fileId}`);
    return c.json({ success: true });
  } catch {
    return c.json({ error: "Failed to delete file" }, 500);
  }
});

// ===================
// COURSES
// ===================
app.post("/courses", async (c) => {
  const course = await c.req.json();
  course.id = `course-${Date.now()}`;
  await kv.set(`course:${course.id}`, course);
  return c.json(course);
});

app.get("/courses", async (c) => {
  const courses = await kv.getByPrefix("course:");
  return c.json(courses);
});

app.get("/courses/:id", async (c) => {
  const course = await kv.get(`course:${c.req.param("id")}`);
  return c.json(course || { error: "Course not found" });
});

app.put("/courses/:id", async (c) => {
  const course = await kv.get(`course:${c.req.param("id")}`);
  if (!course) return c.json({ error: "Course not found" }, 404);
  const updated = await c.req.json();
  const merged = { ...course, ...updated };
  await kv.set(`course:${course.id}`, merged);
  return c.json(merged);
});

app.delete("/courses/:id", async (c) => {
  await kv.del(`course:${c.req.param("id")}`);
  return c.json({ success: true });
});

// ===================
// QUIZZES
// ===================
app.post("/quizzes", async (c) => {
  const quiz = await c.req.json();
  quiz.id = `quiz-${Date.now()}`;
  await kv.set(`quiz:${quiz.id}`, quiz);
  return c.json(quiz);
});

app.get("/quizzes", async (c) => {
  const quizzes = await kv.getByPrefix("quiz:");
  return c.json(quizzes);
});

// ===================
// ANNOUNCEMENTS
// ===================
app.post("/announcements", async (c) => {
  const announcement = await c.req.json();
  announcement.id = `announcement-${Date.now()}`;
  await kv.set(`announcement:${announcement.id}`, announcement);
  return c.json(announcement);
});

app.get("/announcements", async (c) => {
  const announcements = await kv.getByPrefix("announcement:");
  return c.json(announcements);
});

// ===================
// EVENTS
// ===================
app.post("/events", async (c) => {
  const event = await c.req.json();
  event.id = `event-${Date.now()}`;
  await kv.set(`event:${event.id}`, event);
  return c.json(event);
});

app.get("/events", async (c) => {
  const events = await kv.getByPrefix("event:");
  return c.json(events);
});

// ===================
// STUDENTS / ADMINS / STAFF
// ===================
app.post("/users", async (c) => {
  const user = await c.req.json();
  user.id = `user-${Date.now()}`;
  await kv.set(`user:${user.id}`, user);
  return c.json(user);
});

app.get("/users", async (c) => {
  const users = await kv.getByPrefix("user:");
  return c.json(users);
});

app.get("/users/:id", async (c) => {
  const user = await kv.get(`user:${c.req.param("id")}`);
  return c.json(user || { error: "User not found" });
});

// ===================
// TICKETS / ASSIGNMENTS
// ===================
app.post("/tickets", async (c) => {
  const ticket = await c.req.json();
  ticket.id = `ticket-${Date.now()}`;
  await kv.set(`ticket:${ticket.id}`, ticket);
  return c.json(ticket);
});

app.get("/tickets", async (c) => {
  const tickets = await kv.getByPrefix("ticket:");
  return c.json(tickets);
});

app.get("/tickets/:id", async (c) => {
  const ticket = await kv.get(`ticket:${c.req.param("id")}`);
  return c.json(ticket || { error: "Ticket not found" });
});

// ===================
// START SERVER
// ===================
Deno.serve(app.fetch);
