import { useState, useEffect } from "react";
import { Download, Trash2, Eye, File, Image, FileText, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface FileManagerProps {
  noteId: string;
  files: any[];
  onFilesChange: (files: any[]) => void;
  className?: string;
}

export function FileManager({ noteId, files, onFilesChange, className = "" }: FileManagerProps) {
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (fileId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Update local state
      const updatedFiles = files.filter(file => file.id !== fileId);
      onFilesChange(updatedFiles);
      
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      // For images, we can use the signed URL directly
      if (file.type.startsWith('image/')) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For other files, open in new tab
        window.open(file.url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handlePreview = (file: any) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setPreviewFile(file);
    } else {
      // For non-previewable files, download them
      handleDownload(file);
    }
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        <File className="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p>No files attached</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => {
          const Icon = getFileIcon(file.type);
          const isImage = file.type.startsWith('image/');
          
          return (
            <Card key={file.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* File Preview/Icon */}
                  <div className="aspect-square rounded-lg bg-muted overflow-hidden relative">
                    {isImage ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handlePreview(file)}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Hover overlay for non-images */}
                    {!isImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center cursor-pointer"
                           onClick={() => handlePreview(file)}>
                        <Eye className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(file)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {isImage ? 'View' : 'Open'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isLoading}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete File</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{file.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(file.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {previewFile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = getFileIcon(previewFile.type);
                    return <Icon className="w-5 h-5" />;
                  })()}
                  {previewFile.name}
                </DialogTitle>
                <DialogDescription>
                  {formatFileSize(previewFile.size)} • {formatDate(previewFile.uploadDate)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-auto">
                {previewFile.type.startsWith('image/') ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : previewFile.type === 'application/pdf' ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-[60vh] rounded-lg"
                    title={previewFile.name}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Preview not available for this file type
                    </p>
                    <Button onClick={() => handleDownload(previewFile)}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open File
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(previewFile.size)} • {formatDate(previewFile.uploadDate)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleDownload(previewFile)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}