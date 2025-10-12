import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

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

Deno.serve(app.fetch);