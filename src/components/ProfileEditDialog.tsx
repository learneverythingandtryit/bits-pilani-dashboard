import { useState, useRef, useEffect } from "react";
import { User, Mail, Phone, BookOpen, Calendar, Camera, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface UserProfile {
  name: string;
  id: string;
  email: string;
  phone: string;
  course: string;
  semester: string;
  avatar: string;
}

interface ProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export function ProfileEditDialog({ isOpen, onClose, userProfile, onSave }: ProfileEditDialogProps) {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update formData when userProfile changes
  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(formData);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setFormData(userProfile); // Reset form data
    setUploadError(""); // Clear any upload errors
    onClose();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setIsUploading(true);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file (PNG, JPG, GIF, WebP).');
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Please select an image smaller than 5MB.');
      }

      // Create FileReader to convert image to base64
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: result }));
        setIsUploading(false);
      };

      reader.onerror = () => {
        throw new Error('Failed to read the image file. Please try again.');
      };

      reader.readAsDataURL(file);

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'An error occurred while uploading the image.');
      setIsUploading(false);
    }

    // Clear the input so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const triggerImageUpload = () => {
    if (isUploading) return; // Prevent multiple uploads
    fileInputRef.current?.click();
  };

  const removeProfilePicture = () => {
    setFormData(prev => ({ ...prev, avatar: "" }));
    setUploadError("");
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-university-primary flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-university-secondary">
            Update your personal information and academic details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-university-primary/20">
                <AvatarImage 
                  src={formData.avatar || ""} 
                  alt={`${formData.name}'s profile picture`}
                />
                <AvatarFallback className="bg-university-primary text-white text-2xl font-semibold">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              
              {/* Upload Button */}
              <Button
                type="button"
                size="sm"
                onClick={triggerImageUpload}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-university-primary hover:bg-university-secondary disabled:opacity-50"
                title="Change profile picture"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </Button>

              {/* Remove Button (only show if there's an avatar) */}
              {formData.avatar && (
                <Button
                  type="button"
                  size="sm"
                  onClick={removeProfilePicture}
                  className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white"
                  title="Remove profile picture"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-university-secondary mb-2">
                Click the camera icon to change profile picture
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: PNG, JPG, GIF, WebP (max 5MB)
              </p>
              
              {/* Upload Error */}
              {uploadError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-600">{uploadError}</p>
                </div>
              )}
              
              {/* Upload Success */}
              {formData.avatar && !uploadError && !isUploading && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-600">Profile picture updated successfully!</p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-university-primary flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="university-input"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id" className="text-university-primary">
                Student ID
              </Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                className="university-input"
                placeholder="Your student ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-university-primary flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="university-input"
                placeholder="your.email@pilani.bits-pilani.ac.in"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-university-primary flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="university-input"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course" className="text-university-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Course
              </Label>
              <Select
                value={formData.course}
                onValueChange={(value) => handleInputChange('course', value)}
              >
                <SelectTrigger className="university-input">
                  <SelectValue placeholder="Select your course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B.Tech Computer Science">B.Tech Computer Science</SelectItem>
                  <SelectItem value="M.Tech Computer Science">M.Tech Computer Science</SelectItem>
                  <SelectItem value="B.Tech Electronics & Instrumentation">B.Tech Electronics & Instrumentation</SelectItem>
                  <SelectItem value="M.Tech Electronics & Instrumentation">M.Tech Electronics & Instrumentation</SelectItem>
                  <SelectItem value="B.Tech Mechanical Engineering">B.Tech Mechanical Engineering</SelectItem>
                  <SelectItem value="M.Tech Mechanical Engineering">M.Tech Mechanical Engineering</SelectItem>
                  <SelectItem value="B.Tech Chemical Engineering">B.Tech Chemical Engineering</SelectItem>
                  <SelectItem value="M.Tech Chemical Engineering">M.Tech Chemical Engineering</SelectItem>
                  <SelectItem value="B.Tech Civil Engineering">B.Tech Civil Engineering</SelectItem>
                  <SelectItem value="M.Tech Civil Engineering">M.Tech Civil Engineering</SelectItem>
                  <SelectItem value="B.E. Biotechnology">B.E. Biotechnology</SelectItem>
                  <SelectItem value="M.Tech Biotechnology">M.Tech Biotechnology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester" className="text-university-primary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Current Semester
              </Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => handleInputChange('semester', value)}
              >
                <SelectTrigger className="university-input">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Semester">1st Semester</SelectItem>
                  <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                  <SelectItem value="3rd Semester">3rd Semester</SelectItem>
                  <SelectItem value="4th Semester">4th Semester</SelectItem>
                  <SelectItem value="5th Semester">5th Semester</SelectItem>
                  <SelectItem value="6th Semester">6th Semester</SelectItem>
                  <SelectItem value="7th Semester">7th Semester</SelectItem>
                  <SelectItem value="8th Semester">8th Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-university-border pt-4">
            <h3 className="text-lg font-medium text-university-primary mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-university-primary">Campus</Label>
                <Input
                  value="BITS Pilani, Rajasthan"
                  disabled
                  className="university-input bg-gray-50 text-university-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-university-primary">Academic Year</Label>
                <Input
                  value="2021-2025"
                  disabled
                  className="university-input bg-gray-50 text-university-secondary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-university-border">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 bg-university-primary hover:bg-university-secondary"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}