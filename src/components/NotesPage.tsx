import { useState, useRef, useEffect } from "react";
import { Plus, Search, Star, Edit, Trash2, ChevronDown, Upload, X, FileText, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

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
  status: "ongoing" | "completed" | "upcoming";
  progress?: number;
  grades: {
    assignmentQuiz: number | null;
    midSemester: number | null;
    comprehensive: number | null;
    total: number | null;
    finalGrade: string | null;
  };
}

interface NotesPageProps {
  courses: Course[];
  notes?: Note[];
  onNoteClick?: (note: Note) => void;
  onNotesChange?: (notes: Note[]) => void;
}

// Shared NoteCard component with improved design
function NoteCard({ 
  note, 
  onNoteClick, 
  onToggleFavorite, 
  onEditNote, 
  onDeleteNote, 
  onTagClick,
  onCourseClick 
}: {
  note: Note;
  onNoteClick?: (note: Note) => void;
  onToggleFavorite: (noteId: string) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onTagClick: (tag: string) => void;
  onCourseClick: (course: string) => void;
}) {
  return (
    <Card 
      className="bg-card border border-university-border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-80 flex flex-col group overflow-hidden"
      onClick={() => onNoteClick && onNoteClick(note)}
    >
      {/* Course Badge */}
      <div className="px-5 pt-4 pb-2 flex-shrink-0 text-center">
        <span 
          className="inline-block text-xs font-medium text-university-primary bg-university-light px-3 py-1.5 rounded-full border border-university-border hover:bg-accent hover:text-university-primary cursor-pointer transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onCourseClick(note.course);
          }}
        >
          {note.course}
        </span>
      </div>
      
      {/* Title Section - Tight Spacing */}
      <div className="px-5 pb-3 flex-shrink-0">
        <h3 className="text-university-primary font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors text-center font-bold font-normal underline text-[14px]">
          {note.title}
        </h3>
      </div>
      
      {/* Content Section - Controlled Overflow */}
      <div className="px-5 flex-1 overflow-hidden">
        <p className="text-university-secondary leading-relaxed line-clamp-6 h-full overflow-hidden text-ellipsis break-words text-[12px]">
          {note.content.length > 280 ? `${note.content.substring(0, 280)}...` : note.content}
        </p>
      </div>
      
      {/* Files Section - If files exist */}
      {note.files && note.files.length > 0 && (
        <div className="px-5 py-2 flex-shrink-0 border-t border-university-border">
          <div className="flex items-center gap-2 text-xs text-university-secondary">
            <FileText className="w-3 h-3" />
            <span>{note.files.length} file{note.files.length > 1 ? 's' : ''} attached</span>
          </div>
        </div>
      )}

      {/* Footer Section - Always at Bottom */}
      <div className="px-5 py-3 flex items-center justify-between flex-shrink-0 border-t border-university-border bg-muted/30 rounded-b-xl mt-auto">
        <Badge 
          variant="secondary" 
          className="text-xs font-medium bg-university-primary text-white hover:bg-university-secondary hover:text-white cursor-pointer px-3 py-1 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onTagClick(note.tags);
          }}
        >
          {note.tags}
        </Badge>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note.id);
            }}
            className="p-1.5 h-7 w-7 hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 rounded-full transition-colors"
          >
            <Star className={`w-3.5 h-3.5 ${note.favorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEditNote(note);
            }}
            className="p-1.5 h-7 w-7 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-full transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteNote(note.id);
            }}
            className="p-1.5 h-7 w-7 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-full transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function NotesPage({ courses, notes: propNotes, onNoteClick, onNotesChange }: NotesPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  // Default sample notes data - Load from localStorage or use defaults
  const getDefaultNotes = (): Note[] => [
    {
      id: "note-1",
      title: "Computer Programming Fundamentals",
      content: "Basic programming fundamentals including variables, data types, control structures, and functions. This covers loops, conditionals, arrays, and basic object-oriented concepts. Important topics include memory management, algorithm design, and debugging techniques. Practice problems focus on implementing common algorithms like sorting and searching. Key concepts: variables store data, functions organize code, loops repeat actions, conditionals make decisions. Memory allocation is crucial for efficient programs. Debugging involves systematic error identification and correction.",
      course: "Computer Programming",
      tags: "basics",
      createdAt: "2025-09-01",
      lastModified: "2025-09-05",
      favorite: true
    },
    {
      id: "note-2",
      title: "Digital Electronics & Circuit Design",
      content: "Boolean algebra, logic gates, flip-flops, and microprocessor architecture. Covers combinational and sequential circuits, memory systems, and basic computer organization. Key concepts include binary arithmetic, karnaugh maps, and state machines. Logic gates perform basic operations: AND, OR, NOT, NAND, NOR. Sequential circuits have memory using flip-flops. Microprocessors execute instructions through fetch-decode-execute cycle. Memory hierarchy includes cache, RAM, and storage. Circuit optimization reduces complexity and improves performance.",
      course: "Digital Electronics & Microprocessor",
      tags: "hardware",
      createdAt: "2025-09-02",
      lastModified: "2025-09-08",
      favorite: false
    },
    {
      id: "note-3",
      title: "Graph Theory and Discrete Mathematics",
      content: "Graph algorithms, tree structures, and combinatorial optimization. This includes shortest path algorithms, minimum spanning trees, graph coloring, and network flow problems. Mathematical foundations for computer science applications. Graphs model relationships between objects. Vertices represent entities, edges represent connections. Algorithms like Dijkstra find shortest paths. Trees are connected acyclic graphs. Spanning trees connect all vertices with minimum edges. Graph coloring assigns colors to vertices with constraints.",
      course: "Discrete Structures for Computer Science",
      tags: "theory",
      createdAt: "2025-09-03",
      lastModified: "2025-09-10",
      favorite: false
    },
    {
      id: "note-4",
      title: "Advanced Data Structures and Algorithm Analysis",
      content: "Sorting algorithms, search techniques, and Big-O notation analysis. Advanced data structures like heaps, hash tables, and balanced trees. Dynamic programming, greedy algorithms, and complexity theory. Implementation strategies and performance optimization. Arrays provide constant-time access but fixed size. Linked lists allow dynamic sizing but slower access. Hash tables offer average constant-time operations. Trees enable hierarchical organization and efficient searching. Sorting algorithms have different time complexities: O(n²) for bubble sort, O(n log n) for merge sort.",
      course: "Data Structures & Algorithms",
      tags: "algorithms",
      createdAt: "2025-09-05",
      lastModified: "2025-09-12",
      favorite: true
    },
    {
      id: "note-5",
      title: "Object-Oriented Design Patterns",
      content: "Inheritance, polymorphism, encapsulation, and abstraction principles. Design patterns including singleton, factory, observer, and strategy patterns. UML diagrams and software architecture concepts. Classes define objects with attributes and methods. Inheritance promotes code reuse through parent-child relationships. Polymorphism allows objects to take multiple forms. Encapsulation hides internal implementation details. Design patterns solve common programming problems. Singleton ensures single instance creation. Factory creates objects without specifying exact classes.",
      course: "Object Oriented Programming in Design",
      tags: "oop",
      createdAt: "2025-09-07",
      lastModified: "2025-09-15",
      favorite: true
    },
    {
      id: "note-6",
      title: "Database Design and Normalization",
      content: "ER diagrams, normalization forms, and SQL optimization techniques. Database design principles, ACID properties, transaction management, and indexing strategies. Performance tuning and query optimization. Entities represent real-world objects. Relationships connect entities with cardinality constraints. Normalization eliminates redundancy through decomposition. First normal form removes repeating groups. Second normal form removes partial dependencies. Third normal form removes transitive dependencies. ACID ensures database reliability: Atomicity, Consistency, Isolation, Durability.",
      course: "Database Systems & Application",
      tags: "database",
      createdAt: "2025-09-08",
      lastModified: "2025-09-18",
      favorite: false
    },
    {
      id: "note-7",
      title: "Operating System Process Management",
      content: "CPU scheduling algorithms, memory allocation, and file systems. Process synchronization, deadlock prevention, and inter-process communication. Virtual memory management and system calls. Processes are executing programs with their own memory space. Threads share memory within processes for efficient multitasking. Scheduling algorithms determine process execution order. Round-robin provides time slicing for fairness. Priority scheduling favors important processes. Memory management handles allocation and deallocation. Virtual memory extends available memory using disk storage.",
      course: "Operating Systems",
      tags: "os",
      createdAt: "2025-09-10",
      lastModified: "2025-09-20",
      favorite: true
    },
    {
      id: "note-8",
      title: "Software Development Lifecycle",
      content: "Agile methodologies, requirement analysis, and project management techniques. Software testing strategies, version control, and deployment practices. Quality assurance and maintenance procedures. Requirements define what software should do. Design specifies how software will work. Implementation writes actual code. Testing verifies correctness and quality. Deployment makes software available to users. Maintenance updates and fixes software over time. Agile uses iterative development with frequent feedback. Waterfall follows sequential phases with documentation.",
      course: "Software Engineering",
      tags: "methodology",
      createdAt: "2025-09-12",
      lastModified: "2025-09-22",
      favorite: false
    },
    {
      id: "note-9",
      title: "Network Protocols and Security",
      content: "OSI model, routing algorithms, and network security fundamentals. TCP/IP protocol suite, network topologies, and security protocols. Firewall configuration and intrusion detection systems. Networks connect devices for communication and resource sharing. OSI model has seven layers from physical to application. TCP provides reliable connection-oriented communication. UDP offers faster connectionless communication. IP handles addressing and routing between networks. Security protocols encrypt data for protection. Firewalls filter network traffic based on rules. VPNs create secure tunnels over public networks.",
      course: "Computer Networks",
      tags: "networking",
      createdAt: "2025-09-15",
      lastModified: "2025-09-23",
      favorite: true
    },
    {
      id: "note-10",
      title: "Software Testing Methodologies",
      content: "Unit testing, integration testing, and test automation frameworks. Test case design, boundary value analysis, and regression testing. Quality assurance processes and bug tracking systems. Testing finds defects before software release. Unit tests verify individual components work correctly. Integration tests check component interactions. System tests validate complete software functionality. Acceptance tests confirm user requirements are met. Test cases specify inputs, actions, and expected outcomes. Automation runs tests repeatedly without manual intervention. Regression testing ensures new changes don't break existing features.",
      course: "Software Testing",
      tags: "testing",
      createdAt: "2025-09-18",
      lastModified: "2025-09-24",
      favorite: false
    },
    {
      id: "note-11",
      title: "Cloud Computing Architecture",
      content: "Virtualization, containerization, and cloud deployment models. Service models including IaaS, PaaS, and SaaS. Scalability, load balancing, and distributed systems concepts. Cloud computing provides on-demand access to computing resources. Virtualization creates multiple virtual machines on single hardware. Containers package applications with dependencies for portability. Infrastructure as a Service provides virtual hardware. Platform as a Service offers development environments. Software as a Service delivers applications over internet. Auto-scaling adjusts resources based on demand.",
      course: "Cloud Computing",
      tags: "cloud",
      createdAt: "2025-09-20",
      lastModified: "2025-09-25",
      favorite: true
    },
    {
      id: "note-12",
      title: "Data Mining Techniques",
      content: "Classification, clustering, and pattern recognition algorithms. Association rules, decision trees, and neural networks. Big data processing and knowledge discovery methods. Data mining extracts patterns from large datasets. Classification predicts categories for new data. Clustering groups similar data points together. Association rules find relationships between items. Decision trees make predictions through branching logic. Neural networks model complex patterns through interconnected nodes. Preprocessing cleans and prepares data for analysis. Feature selection identifies most relevant attributes.",
      course: "Data Mining",
      tags: "mining",
      createdAt: "2025-09-22",
      lastModified: "2025-09-25",
      favorite: false
    }
  ];

  // Use notes from props if provided, otherwise use local state with localStorage
  const [localNotes, setLocalNotes] = useState<Note[]>(() => {
    if (propNotes) return propNotes;
    
    try {
      const savedNotes = localStorage.getItem("studentNotes");
      if (savedNotes) {
        return JSON.parse(savedNotes);
      }
    } catch (error) {
      console.warn("Failed to load notes from localStorage:", error);
    }
    return getDefaultNotes();
  });

  // Use prop notes if provided, otherwise use local notes
  const notes = propNotes || localNotes;

  // Update parent component when notes change (if callback provided)
  const updateNotes = (updatedNotes: Note[]) => {
    if (onNotesChange) {
      onNotesChange(updatedNotes);
    } else {
      setLocalNotes(updatedNotes);
      try {
        localStorage.setItem("studentNotes", JSON.stringify(updatedNotes));
      } catch (error) {
        console.warn("Failed to save notes to localStorage:", error);
      }
    }
  };

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    course: "",
    tags: "",
    files: [] as UploadedFile[]
  });

  // Get all unique tags
  const allTags = Array.from(new Set(notes.map(note => note.tags))).sort();

  // Get all unique courses from notes
  const availableCourses = Array.from(new Set(notes.map(note => note.course))).sort();

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourse === "all" || note.course === selectedCourse;
    const matchesTag = selectedTag === "all" || note.tags === selectedTag;
    
    return matchesSearch && matchesCourse && matchesTag;
  });

  const handleCreateNote = () => {
    if (newNote.title.trim() && newNote.content.trim() && newNote.course.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        course: newNote.course.trim(),
        tags: newNote.tags.trim() || "general",
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        favorite: false,
        files: newNote.files.length > 0 ? newNote.files : undefined
      };
      
      updateNotes([note, ...notes]);
      setNewNote({ title: "", content: "", course: "", tags: "", files: [] });
      setIsCreateDialogOpen(false);
    }
  };

  const toggleFavorite = (noteId: string) => {
    updateNotes(notes.map(note => 
      note.id === noteId ? { ...note, favorite: !note.favorite } : note
    ));
  };

  const deleteNote = (noteId: string) => {
    updateNotes(notes.filter(note => note.id !== noteId));
  };

  const handleEditNote = () => {
    if (editingNote && editingNote.title && editingNote.content) {
      updateNotes(notes.map(note => 
        note.id === editingNote.id 
          ? {
              ...editingNote,
              lastModified: new Date().toISOString().split('T')[0]
            }
          : note
      ));
      setEditingNote(null);
    }
  };

  const handleTagClick = (tag: string) => {
    // Toggle behavior: if same tag is clicked, clear filter; otherwise set new filter
    setSelectedTag(selectedTag === tag ? "all" : tag);
  };

  const handleCourseClick = (course: string) => {
    // Toggle behavior: if same course is clicked, clear filter; otherwise set new filter
    setSelectedCourse(selectedCourse === course ? "all" : course);
  };

  // File upload functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    Array.from(files).forEach(file => {
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please upload images, PDFs, Word documents, or text files.`);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Please upload files smaller than 10MB.`);
        return;
      }

      // Create file URL (in a real app, you'd upload to a server)
      const fileUrl = URL.createObjectURL(file);
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        url: fileUrl,
        uploadDate: new Date().toISOString()
      };

      newFiles.push(uploadedFile);
    });

    // Add files to the editing note or new note
    if (editingNote) {
      setEditingNote({
        ...editingNote,
        files: [...(editingNote.files || []), ...newFiles]
      });
    } else {
      setNewNote(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));
    }

    // Reset file input
    event.target.value = '';
  };

  const removeFile = (fileId: string, isEditing = false) => {
    if (isEditing && editingNote) {
      setEditingNote({
        ...editingNote,
        files: editingNote.files?.filter(f => f.id !== fileId) || []
      });
    } else {
      setNewNote(prev => ({
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      }));
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType === 'text/plain') return '📄';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const previewFileHandler = (file: UploadedFile) => {
    setPreviewFile(file);
  };

  // Computed data that automatically updates when notes change
  const favoriteNotes = filteredNotes.filter(note => note.favorite);
  const recentNotes = notes
    .slice()
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 10)
    .filter(note => {
      // Apply same filtering logic to recent notes
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.tags.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCourse = selectedCourse === "all" || note.course === selectedCourse;
      const matchesTag = selectedTag === "all" || note.tags === selectedTag;
      
      return matchesSearch && matchesCourse && matchesTag;
    });

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-university-primary mb-1">My Notes</h1>
            <p className="text-university-secondary text-sm">Organize and manage your study notes</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setNewNote({ title: "", content: "", course: "", tags: "", files: [] });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-university-primary hover:bg-university-primary/90 dark:bg-university-primary dark:hover:bg-university-primary/90 text-white px-6 py-2 rounded-lg font-medium text-sm">
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-lg">Create New Note</DialogTitle>
                <DialogDescription className="text-sm">
                  Add a new study note with course assignment and tag for better organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course" className="text-xs font-medium">Course *</Label>
                  <Select value={newNote.course} onValueChange={(value) => setNewNote({...newNote, course: value})}>
                    <SelectTrigger className={`text-xs ${!newNote.course.trim() ? "border-red-300" : ""}`}>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses
                        .sort((a, b) => a.title.localeCompare(b.title))
                        .map(course => (
                          <SelectItem key={course.id} value={course.title} className="text-xs">
                            {course.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title" className="text-xs font-medium">Title *</Label>
                  <Input
                    id="title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    placeholder="Enter note title..."
                    className={`text-xs ${!newNote.title.trim() ? "border-red-300" : ""}`}
                  />
                </div>
                <div>
                  <Label htmlFor="tags" className="text-xs font-medium">Tag</Label>
                  <Input
                    id="tags"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                    placeholder="lecture, assignment, theory..."
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="content" className="text-xs font-medium">Content *</Label>
                  <Textarea
                    id="content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    placeholder="Write your note content here..."
                    rows={10}
                    className={`text-xs text-[12px] h-40 resize-none overflow-y-auto min-h-[10rem] max-h-[10rem] ${!newNote.content.trim() ? "border-red-300" : ""}`}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Attachments</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      ref={createFileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      multiple
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => createFileInputRef.current?.click()}
                      className="text-xs flex items-center gap-1 w-full justify-center"
                    >
                      <Upload className="w-3 h-3" />
                      Upload Files
                    </Button>
                    
                    {/* File List */}
                    {newNote.files.length > 0 && (
                      <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                        {newNote.files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded border border-university-border text-xs">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm">{getFileIcon(file.type)}</span>
                              <span className="truncate flex-1">{file.name}</span>
                              <span className="text-muted-foreground whitespace-nowrap">{formatFileSize(file.size)}</span>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              {file.type.startsWith('image/') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    previewFileHandler(file);
                                  }}
                                  className="p-1 h-6 w-6"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file.id, false);
                                }}
                                className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateNote} 
                    className="bg-[#191f5f] hover:bg-[#151a4a] text-xs"
                    disabled={!newNote.title.trim() || !newNote.content.trim() || !newNote.course.trim()}
                  >
                    Create Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters Row */}
        <div className="flex gap-4 items-center mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-xs focus:border-[#191f5f] focus:ring-[#191f5f] dark:focus:border-[#3b82f6] dark:focus:ring-[#3b82f6] bg-card border-border"
            />
          </div>

          {/* Course Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 min-w-[140px] justify-between text-xs text-university-primary dark:text-university-secondary"
              >
                {selectedCourse === "all" ? "All Courses" : 
                 availableCourses.find(c => c === selectedCourse)?.substring(0, 15) + "..." || "All Courses"}
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
              <DropdownMenuItem onClick={() => setSelectedCourse("all")} className="text-xs">
                All Courses
              </DropdownMenuItem>
              {availableCourses.map(course => (
                <DropdownMenuItem key={course} onClick={() => setSelectedCourse(course)} className="text-xs">
                  {course}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tags Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 min-w-[120px] justify-between text-xs text-university-primary dark:text-university-secondary"
              >
                {selectedTag === "all" ? "All Tags" : selectedTag}
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedTag("all")} className="text-xs">
                All Tags
              </DropdownMenuItem>
              {allTags.map(tag => (
                <DropdownMenuItem key={tag} onClick={() => setSelectedTag(tag)} className="text-xs">
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Notes Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-transparent border-b border-university-border rounded-none p-0 h-auto mb-6 w-full justify-start">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#191f5f] data-[state=active]:bg-transparent data-[state=active]:text-[#191f5f] dark:data-[state=active]:text-[#3b82f6] rounded-none pb-3 px-4 font-medium text-sm text-university-secondary data-[state=active]:text-university-primary bg-transparent border-0"
            >
              All Notes ({filteredNotes.length})
            </TabsTrigger>
            <TabsTrigger 
              value="favorites"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#191f5f] data-[state=active]:bg-transparent data-[state=active]:text-[#191f5f] dark:data-[state=active]:text-[#3b82f6] rounded-none pb-3 px-4 font-medium text-sm text-university-secondary data-[state=active]:text-university-primary bg-transparent border-0"
            >
              Favorites ({favoriteNotes.length})
            </TabsTrigger>
            <TabsTrigger 
              value="recent"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#191f5f] data-[state=active]:bg-transparent data-[state=active]:text-[#191f5f] dark:data-[state=active]:text-[#3b82f6] rounded-none pb-3 px-4 font-medium text-sm text-university-secondary data-[state=active]:text-university-primary bg-transparent border-0"
            >
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onNoteClick={onNoteClick}
                  onToggleFavorite={toggleFavorite}
                  onEditNote={setEditingNote}
                  onDeleteNote={deleteNote}
                  onTagClick={handleTagClick}
                  onCourseClick={handleCourseClick}
                />
              ))}
            </div>
            
            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-university-secondary text-sm">No notes found. Create your first note to get started!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {favoriteNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onNoteClick={onNoteClick}
                  onToggleFavorite={toggleFavorite}
                  onEditNote={setEditingNote}
                  onDeleteNote={deleteNote}
                  onTagClick={handleTagClick}
                  onCourseClick={handleCourseClick}
                />
              ))}
            </div>
            
            {favoriteNotes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-university-secondary text-sm">No favorite notes yet. Star some notes to add them here!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onNoteClick={onNoteClick}
                  onToggleFavorite={toggleFavorite}
                  onEditNote={setEditingNote}
                  onDeleteNote={deleteNote}
                  onTagClick={handleTagClick}
                  onCourseClick={handleCourseClick}
                />
              ))}
            </div>
            
            {recentNotes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-university-secondary text-sm">No recent notes found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Note Dialog */}
        {editingNote && (
          <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-lg">Edit Note</DialogTitle>
                <DialogDescription className="text-sm">
                  Make changes to your note below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-course" className="text-xs font-medium">Course *</Label>
                  <Select value={editingNote.course} onValueChange={(value) => setEditingNote({...editingNote, course: value})}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses
                        .sort((a, b) => a.title.localeCompare(b.title))
                        .map(course => (
                          <SelectItem key={course.id} value={course.title} className="text-xs">
                            {course.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-title" className="text-xs font-medium">Title *</Label>
                  <Input
                    id="edit-title"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                    placeholder="Enter note title..."
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tags" className="text-xs font-medium">Tag</Label>
                  <Input
                    id="edit-tags"
                    value={editingNote.tags}
                    onChange={(e) => setEditingNote({...editingNote, tags: e.target.value})}
                    placeholder="lecture, assignment, theory..."
                    className="text-xs text-[12px]"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-content" className="text-xs font-medium">Content *</Label>
                  <Textarea
                    id="edit-content"
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                    placeholder="Write your note content here..."
                    rows={10}
                    className="text-xs text-[12px] h-40 resize-none overflow-y-auto min-h-[10rem] max-h-[10rem]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Attachments</Label>
                  <div className="mt-2">
                    {/* File List */}
                    {editingNote.files && editingNote.files.length > 0 && (
                      <div className="mb-3 space-y-2 max-h-32 overflow-y-auto">
                        {editingNote.files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded border border-university-border text-xs">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm">{getFileIcon(file.type)}</span>
                              <span className="truncate flex-1">{file.name}</span>
                              <span className="text-muted-foreground whitespace-nowrap">{formatFileSize(file.size)}</span>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              {file.type.startsWith('image/') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    previewFileHandler(file);
                                  }}
                                  className="p-1 h-6 w-6"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file.id, true);
                                }}
                                className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      multiple
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      Upload Files
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditingNote(null)} className="text-xs">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleEditNote} 
                      className="bg-[#191f5f] hover:bg-[#151a4a] text-xs"
                      disabled={!editingNote.title.trim() || !editingNote.content.trim()}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* File Preview Dialog */}
        {previewFile && (
          <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-lg flex items-center gap-2">
                  <span>{getFileIcon(previewFile.type)}</span>
                  {previewFile.name}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {formatFileSize(previewFile.size)} • {new Date(previewFile.uploadDate).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-auto">
                {previewFile.type.startsWith('image/') ? (
                  <img 
                    src={previewFile.url} 
                    alt={previewFile.name}
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
                    <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
                    <Button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewFile.url;
                        link.download = previewFile.name;
                        link.click();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}