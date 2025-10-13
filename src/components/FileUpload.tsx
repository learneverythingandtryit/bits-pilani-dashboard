import { useState, useRef, useCallback } from "react";
import { Upload, X, File, Image, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface FileUploadProps {
  noteId: string;
  onFilesUploaded: (files: any[]) => void;
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  id: string;
  error?: string;
}

export function FileUpload({
  noteId,
  onFilesUploaded,
  accept = "image/*,.pdf,.doc,.docx,.txt,.md",
  maxSize = 50 * 1024 * 1024, // 50MB default
  multiple = true,
  className = ""
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType === 'application/pdf') return FileText;
    if (fileType.includes('document') || fileType.includes('word')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }

    const allowedTypes = accept.split(',').map(type => type.trim());
    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      } else if (type.includes('/*')) {
        return file.type.startsWith(type.split('/*')[0]);
      } else {
        return file.type === type;
      }
    });

    if (!isValidType) {
      return 'File type not supported';
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('noteId', noteId);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.file;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    // Validate files
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(`${file.name}: ${validationError}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Initialize uploading files state
    const uploadingFilesList: UploadingFile[] = validFiles.map((file, index) => ({
      file,
      progress: 0,
      status: 'uploading',
      id: `upload-${Date.now()}-${index}`
    }));

    setUploadingFiles(uploadingFilesList);

    // Upload files one by one
    const uploadedFiles: any[] = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const uploadingFile = uploadingFilesList[i];

      try {
        // Simulate progress (since we can't track real progress with FormData)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map(uf => 
              uf.id === uploadingFile.id 
                ? { ...uf, progress: Math.min(uf.progress + 10, 90) }
                : uf
            )
          );
        }, 200);

        const uploadedFile = await uploadFile(file);
        
        clearInterval(progressInterval);

        // Update to success
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.id === uploadingFile.id 
              ? { ...uf, progress: 100, status: 'success' }
              : uf
          )
        );

        uploadedFiles.push(uploadedFile);
        toast.success(`${file.name} uploaded successfully`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.id === uploadingFile.id 
              ? { ...uf, status: 'error', error: errorMessage }
              : uf
          )
        );

        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      }
    }

    // Clear uploading files after a delay
    setTimeout(() => {
      setUploadingFiles([]);
    }, 3000);

    // Notify parent component of successful uploads
    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles);
    }
  }, [noteId, maxSize, accept, onFilesUploaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    // Reset input value to allow same file to be selected again
    e.target.value = '';
  }, [handleFiles]);

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(uf => uf.id !== id));
  };

  return (
    <div className={className}>
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Supports images, PDFs, documents up to {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadingFiles.map((uploadingFile) => {
            const Icon = getFileIcon(uploadingFile.file.type);
            
            return (
              <Card key={uploadingFile.id} className="p-3">
                <div className="flex items-center space-x-3">
                  <Icon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {uploadingFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {uploadingFile.status === 'success' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {uploadingFile.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUploadingFile(uploadingFile.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatFileSize(uploadingFile.file.size)}
                    </div>
                    
                    {uploadingFile.status === 'uploading' && (
                      <Progress value={uploadingFile.progress} className="h-2" />
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <p className="text-xs text-red-500">
                        {uploadingFile.error}
                      </p>
                    )}
                    
                    {uploadingFile.status === 'success' && (
                      <p className="text-xs text-green-600">
                        Uploaded successfully
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}