import { useState, useEffect } from "react";
import { ArrowLeft, Download, ZoomIn, ZoomOut, RotateCw, Share2, Edit, Star, Calendar, Tag, FileText, Image as ImageIcon, File, Eye, ChevronLeft, ChevronRight, Maximize2, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { copyWithFeedback, copyToClipboardSilent } from "../utils/clipboard";
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

interface NoteDetailPageProps {
  note: Note;
  onBack: () => void;
  onEdit?: (note: Note) => void;
  onToggleFavorite?: (noteId: string) => void;
}

export function NoteDetailPage({ note, onBack, onEdit, onToggleFavorite }: NoteDetailPageProps) {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [imageGalleryIndex, setImageGalleryIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>(note.files || []);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Load files from server
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

  // Get image files for gallery
  const imageFiles = files?.filter(file => file.type.startsWith('image/')) || [];
  const documentFiles = files?.filter(file => !file.type.startsWith('image/')) || [];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (fileType === 'text/plain') return <File className="w-5 h-5 text-gray-500" />;
    return <File className="w-5 h-5" />;
  };

  const handleDownload = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
    toast.success(`Downloaded ${file.name}`);
  };

  const handleCopyContent = async () => {
    try {
      await copyWithFeedback(
        note.content,
        toast,
        "Note content copied to clipboard!",
        setCopied
      );
    } catch (error) {
      // Silent error handling - user already gets feedback from copyWithFeedback
      if (process.env.NODE_ENV === 'development') {
        console.debug('Copy operation failed (this is normal in some environments):', error);
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: note.title,
      text: `${note.title}\n\n${note.content}\n\nCourse: ${note.course}\nTags: ${note.tags}`,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Note shared successfully");
        return;
      } catch (err) {
        // User cancelled sharing - don't show error
        if (err.name === 'AbortError') {
          return;
        }
        // Silent fallback - no need to warn about expected behavior
        if (process.env.NODE_ENV === 'development') {
          console.debug('Native share failed, falling back to clipboard:', err);
        }
      }
    }
    
    // Fallback to copying to clipboard
    try {
      await copyWithFeedback(
        shareData.text,
        toast,
        "Note content copied to clipboard for sharing"
      );
    } catch (error) {
      // Silent error handling - user already gets feedback from copyWithFeedback
      if (process.env.NODE_ENV === 'development') {
        console.debug('Share operation failed (this is normal in some environments):', error);
      }
    }
  };

  const nextImage = () => {
    if (imageFiles.length > 1) {
      setImageGalleryIndex((prev) => (prev + 1) % imageFiles.length);
    }
  };

  const prevImage = () => {
    if (imageFiles.length > 1) {
      setImageGalleryIndex((prev) => (prev - 1 + imageFiles.length) % imageFiles.length);
    }
  };

  const resetImageView = () => {
    setZoom(100);
    setRotation(0);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedFile && selectedFile.type.startsWith('image/')) {
        switch (e.key) {
          case 'ArrowLeft':
            prevImage();
            break;
          case 'ArrowRight':
            nextImage();
            break;
          case 'Escape':
            setSelectedFile(null);
            setIsFullscreen(false);
            break;
          case '+':
          case '=':
            setZoom(prev => Math.min(prev + 10, 200));
            break;
          case '-':
            setZoom(prev => Math.max(prev - 10, 25));
            break;
          case 'r':
            setRotation(prev => (prev + 90) % 360);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedFile, imageFiles.length]);

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
                Back to Notes
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Badge 
                variant="secondary" 
                className="text-xs font-medium bg-primary/10 text-primary px-3 py-1"
              >
                {note.course}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Note Header */}
          <div>
            <h1 className="text-3xl font-bold text-university-primary mb-4">{note.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {new Date(note.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Modified {new Date(note.lastModified).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <Badge variant="outline" className="text-xs">{note.tags}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Note Content */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-card-foreground">Note Content</h2>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-96">
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap text-university-secondary leading-relaxed text-base text-[13px]">
                        {note.content}
                      </p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Loading State for Files */}
              {isLoadingFiles && (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm">Loading attachments...</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Image Gallery */}
              {!isLoadingFiles && imageFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-card-foreground">
                      Images ({imageFiles.length})
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageFiles.map((file, index) => (
                        <div
                          key={file.id}
                          className="relative group cursor-pointer rounded-lg overflow-hidden bg-muted aspect-square"
                          onClick={() => {
                            setSelectedFile(file);
                            setImageGalleryIndex(index);
                            resetImageView();
                          }}
                        >
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-primary-foreground text-xs bg-black/70 dark:bg-black/80 rounded px-2 py-1 truncate">
                              {file.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Document Preview */}
              {!isLoadingFiles && documentFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-card-foreground">
                      Documents ({documentFiles.length})
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {documentFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {getFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-card-foreground truncate">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedFile(file)}
                              className="text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(file)}
                              className="text-xs"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-card-foreground">Quick Actions</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => {
                      if (onEdit) {
                        onEdit(note);
                        toast.success("Opening note editor...");
                      } else {
                        toast.error("Edit functionality not available");
                      }
                    }}
                    disabled={!onEdit}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Note
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={async () => {
                      try {
                        const loadingToast = toast.loading("Generating PDF...");
                        
                        // Dynamic import of jsPDF
                        const { default: jsPDF } = await import('jspdf');
                        const pdf = new jsPDF();
                        
                        // Set document properties
                        pdf.setProperties({
                          title: note.title,
                          subject: `Course: ${note.course}`,
                          author: 'BITS Pilani Student Dashboard',
                          creator: 'BITS Dashboard'
                        });
                        
                        // Add header
                        pdf.setFontSize(20);
                        pdf.setTextColor(25, 35, 94); // University blue
                        pdf.text(note.title, 20, 30);
                        
                        // Add course and metadata
                        pdf.setFontSize(12);
                        pdf.setTextColor(100, 100, 100);
                        pdf.text(`Course: ${note.course}`, 20, 45);
                        pdf.text(`Tags: ${note.tags}`, 20, 55);
                        pdf.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, 20, 65);
                        pdf.text(`Modified: ${new Date(note.lastModified).toLocaleDateString()}`, 20, 75);
                        
                        // Add separator line
                        pdf.setDrawColor(200, 200, 200);
                        pdf.line(20, 85, 190, 85);
                        
                        // Add content
                        pdf.setFontSize(11);
                        pdf.setTextColor(60, 60, 60);
                        const splitContent = pdf.splitTextToSize(note.content, 170);
                        pdf.text(splitContent, 20, 100);
                        
                        // Calculate content height for attachments section
                        const contentHeight = 100 + (splitContent.length * 5);
                        
                        // Add attachments section if files exist
                        if (files && files.length > 0) {
                          const attachmentY = contentHeight + 20;
                          
                          pdf.setFontSize(14);
                          pdf.setTextColor(25, 35, 94);
                          pdf.text('Attachments:', 20, attachmentY);
                          
                          pdf.setFontSize(10);
                          pdf.setTextColor(80, 80, 80);
                          
                          files.forEach((file, index) => {
                            const fileY = attachmentY + 15 + (index * 15);
                            pdf.text(`• ${file.name} (${formatFileSize(file.size)})`, 25, fileY);
                          });
                        }
                        
                        // Add footer
                        const pageCount = pdf.getNumberOfPages();
                        for (let i = 1; i <= pageCount; i++) {
                          pdf.setPage(i);
                          pdf.setFontSize(8);
                          pdf.setTextColor(150, 150, 150);
                          pdf.text('Generated by BITS Pilani Student Dashboard', 20, 285);
                          pdf.text(`Page ${i} of ${pageCount}`, 170, 285);
                        }
                        
                        // Save the PDF
                        const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                        pdf.save(fileName);
                        
                        toast.dismiss(loadingToast);
                        toast.success(`PDF "${fileName}" downloaded successfully!`);
                      } catch (error) {
                        console.error('PDF generation error:', error);
                        toast.error("Failed to generate PDF. Please try again.");
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start text-sm transition-colors ${
                      copied 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={async () => {
                      try {
                        // Create comprehensive note content with metadata
                        const fullContent = `${note.title}

Course: ${note.course}
Tags: ${note.tags}
Created: ${new Date(note.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
Modified: ${new Date(note.lastModified).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}

─────────────────────────────────────

${note.content}

${files && files.length > 0 ? `
─────────────────────────────────────

Attachments (${files.length}):
${files.map(file => `• ${file.name} (${formatFileSize(file.size)})`).join('\n')}
` : ''}

─────────────────────────────────────
Generated by BITS Pilani Student Dashboard`;

                        await copyWithFeedback(
                          fullContent,
                          toast,
                          "Complete note content copied to clipboard!",
                          setCopied
                        );
                      } catch (error) {
                        // Silent error handling - user already gets feedback from copyWithFeedback
                        if (process.env.NODE_ENV === 'development') {
                          console.debug('Full content copy failed (this is normal in some environments):', error);
                        }
                      }
                    }}
                    disabled={copied}
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy Content"}
                  </Button>
                </CardContent>
              </Card>

              {/* Note Statistics */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-card-foreground">Note Details</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Words</span>
                    <span className="font-medium text-card-foreground">{note.content.split(/\s+/).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Characters</span>
                    <span className="font-medium text-card-foreground">{note.content.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attachments</span>
                    <span className="font-medium text-card-foreground">{files?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course</span>
                    <span className="font-medium text-card-foreground text-right">{note.course}</span>
                  </div>
                </CardContent>
              </Card>

              {/* File Summary */}
              {!isLoadingFiles && files && files.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-card-foreground">Attachments Summary</h3>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {imageFiles.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Images</span>
                        <span className="font-medium text-card-foreground">{imageFiles.length}</span>
                      </div>
                    )}
                    {documentFiles.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Documents</span>
                        <span className="font-medium text-card-foreground">{documentFiles.length}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Size</span>
                      <span className="font-medium text-card-foreground">
                        {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Dialog */}
      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={() => {
          setSelectedFile(null);
          setIsFullscreen(false);
          resetImageView();
        }}>
          <DialogContent className={`${isFullscreen ? 'max-w-[95vw] max-h-[95vh] w-full h-full' : 'sm:max-w-4xl max-h-[90vh]'}`}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedFile.type)}
                  <span>{selectedFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedFile.type.startsWith('image/') && (
                    <>
                      {imageFiles.length > 1 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span>{imageGalleryIndex + 1} of {imageFiles.length}</span>
                        </div>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setZoom(prev => Math.max(prev - 10, 25))}>
                        <ZoomOut className="w-3 h-3" />
                      </Button>
                      <span className="text-sm text-gray-600">{zoom}%</span>
                      <Button variant="outline" size="sm" onClick={() => setZoom(prev => Math.min(prev + 10, 200))}>
                        <ZoomIn className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setRotation(prev => (prev + 90) % 360)}>
                        <RotateCw className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                        <Maximize2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDownload(selectedFile)}>
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </DialogTitle>
              <DialogDescription className="sr-only">
                File preview for {selectedFile.name} - {formatFileSize(selectedFile.size)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto relative">
              {selectedFile.type.startsWith('image/') ? (
                <div className="relative flex items-center justify-center min-h-96">
                  {imageFiles.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <img
                    src={imageFiles[imageGalleryIndex]?.url || selectedFile.url}
                    alt={imageFiles[imageGalleryIndex]?.name || selectedFile.name}
                    className="max-w-full max-h-full object-contain transition-transform"
                    style={{
                      transform: `scale(${Math.min(zoom / 100, 1.5)}) rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                      maxWidth: '90%',
                      maxHeight: '90%',
                      width: 'auto',
                      height: 'auto',
                      margin: 'auto',
                      display: 'block'
                    }}
                  />
                </div>
              ) : selectedFile.type === 'application/pdf' ? (
                <iframe
                  src={selectedFile.url}
                  className="w-full h-96 min-h-96 rounded-lg"
                  title={selectedFile.name}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Preview not available for this file type</p>
                  <Button onClick={() => handleDownload(selectedFile)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                {formatFileSize(selectedFile.size)} • {new Date(selectedFile.uploadDate).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleDownload(selectedFile)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}