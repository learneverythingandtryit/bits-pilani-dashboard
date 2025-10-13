import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, X, Upload, FileText, Image as ImageIcon, File, Trash2, Download, Tag, BookOpen, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
//import { toast } from "sonner@2.0.3";
import { FileUpload } from "./FileUpload";
import { FileManager } from "./FileManager";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  course: string;
  tags: string;
  createdAt: string;
  lastModified: string;
  favorite: boolean;
  files?: UploadedFile[];
}

interface Course {
  id: string;
  title: string;
  code: string;
  semester: number;
  status: 'completed' | 'ongoing' | 'upcoming';
}

interface NoteEditPageProps {
  note: Note;
  courses: Course[];
  onBack: () => void;
  onSave: (updatedNote: Note) => void;
  onCancel: () => void;
}

export function NoteEditPage({ note, courses, onBack, onSave, onCancel }: NoteEditPageProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [selectedCourse, setSelectedCourse] = useState(note.course);
  const [tags, setTags] = useState(note.tags);
  const [files, setFiles] = useState<UploadedFile[]>(note.files || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing files for the note
  useEffect(() => {
    const loadFiles = async () => {
      if (note.id && note.id !== 'new') {
        setIsLoadingFiles(true);
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/files/${note.id}`, {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            setFiles(result.files || []);
          }
        } catch (error) {
          console.error('Error loading files:', error);
        } finally {
          setIsLoadingFiles(false);
        }
      }
    };

    loadFiles();
  }, [note.id]);

  // Common tags for quick selection
  const commonTags = [
    "Lecture Notes", "Study Notes", "Assignment", "Project", "Reference", 
    "Important", "Review", "Practice", "Theory", "Lab", "Exam Prep"
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (fileType === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-4 h-4 text-blue-500" />;
    if (fileType === 'text/plain') return <File className="w-4 h-4 text-gray-500" />;
    return <File className="w-4 h-4" />;
  };

  const handleFilesUploaded = (uploadedFiles: UploadedFile[]) => {
    setFiles(prev => [...prev, ...uploadedFiles]);
    setUnsavedChanges(true);
  };

  const handleFilesChange = (updatedFiles: UploadedFile[]) => {
    setFiles(updatedFiles);
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast.error("Please enter a note title");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Please enter note content");
      return;
    }
    
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }
    
    if (!tags.trim()) {
      toast.error("Please enter tags");
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedNote: Note = {
        ...note,
        title: title.trim(),
        content: content.trim(),
        course: selectedCourse,
        tags: tags.trim(),
        lastModified: new Date().toISOString(),
        files: files
      };
      
      onSave(updatedNote);
      setUnsavedChanges(false);
      toast.success("Note saved successfully!");
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (unsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      onCancel();
    }
  };

  const handleDiscardChanges = () => {
    // Clean up any object URLs
    files.forEach(file => {
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
    
    setShowDiscardDialog(false);
    onCancel();
  };

  // Track changes
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setUnsavedChanges(true);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setUnsavedChanges(true);
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    setUnsavedChanges(true);
  };

  const handleTagsChange = (value: string) => {
    setTags(value);
    setUnsavedChanges(true);
  };

  const addQuickTag = (tag: string) => {
    if (!tags.includes(tag)) {
      const newTags = tags ? `${tags}, ${tag}` : tag;
      setTags(newTags);
      setUnsavedChanges(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-muted-foreground hover:text-card-foreground -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Note
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Editing: {note.title}
                </span>
                {unsavedChanges && (
                  <Badge variant="secondary" className="bg-warning/10 text-warning">
                    Unsaved changes
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || !title.trim() || !content.trim()}
                className="text-xs bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Save Note
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Edit Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground">Note Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter note title..."
                    className="text-lg font-medium"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {title.length}/100 characters
                  </p>
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground">Note Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Enter your note content here..."
                    className="min-h-96 resize-none"
                    maxLength={10000}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {content.length}/10,000 characters
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {content.trim().split(/\s+/).length} words
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* File Attachments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground">Attachments ({files.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload */}
                  <FileUpload
                    noteId={note.id}
                    onFilesUploaded={handleFilesUploaded}
                    accept="image/*,.pdf,.doc,.docx,.txt,.md"
                    maxSize={50 * 1024 * 1024} // 50MB
                    multiple={true}
                  />
                  
                  {/* File Manager */}
                  {isLoadingFiles ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm">Loading files...</p>
                    </div>
                  ) : (
                    <FileManager
                      noteId={note.id}
                      files={files}
                      onFilesChange={handleFilesChange}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Course
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedCourse} onValueChange={handleCourseChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.title}>
                          <div>
                            <p className="font-medium text-card-foreground">{course.title}</p>
                            <p className="text-xs text-muted-foreground">{course.code}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={tags}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="Enter tags (comma separated)"
                    maxLength={100}
                  />
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Quick Tags:</Label>
                    <div className="flex flex-wrap gap-1">
                      {commonTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => addQuickTag(tag)}
                          className="text-xs px-2 py-1 bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Note Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-card-foreground">Note Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium text-card-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Modified</span>
                    <span className="font-medium text-card-foreground">
                      {new Date(note.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Characters</span>
                    <span className="font-medium text-card-foreground">{content.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Words</span>
                    <span className="font-medium text-card-foreground">{content.trim().split(/\s+/).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attachments</span>
                    <span className="font-medium text-card-foreground">{files.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Save Reminder */}
              {unsavedChanges && (
                <Card className="border-warning/20 bg-warning/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-warning">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                      <p className="text-sm font-medium">Unsaved Changes</p>
                    </div>
                    <p className="text-xs text-warning/80 mt-1">
                      Don't forget to save your changes before leaving!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Discard Changes Dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to discard them? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
              Keep Editing
            </Button>
            <Button variant="destructive" onClick={handleDiscardChanges}>
              Discard Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
