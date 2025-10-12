import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import image_f45565175c62bcc651936992a46b956588d7543e from 'figma:asset/f45565175c62bcc651936992a46b956588d7543e.png';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fafbfc] to-[#f3f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1F2937] mb-2">Check your email</h2>
            <p className="text-[#6B7280] mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <Button 
              onClick={onBack}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 rounded-lg transition-colors"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafbfc] to-[#f3f4f6] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-full max-w-sm mx-auto mb-6">
              <img
                src={image_f45565175c62bcc651936992a46b956588d7543e}
                alt="BITS Pilani Work Integrated Learning Programmes"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center text-[#6B7280] hover:text-[#374151] transition-colors mb-6 font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>

          {/* Reset Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#1F2937] mb-2">Forgotten your password?</h2>
              <p className="text-[#6B7280] text-sm">
                Enter your email address below, and we'll email instructions for setting a new one.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#374151]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your BITS email address"
                  required
                  className="w-full px-4 py-3 border border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#9CA3AF] text-white py-3 rounded-lg transition-colors font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  "Reset my password"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
              <p className="text-center text-sm text-[#6B7280]">
                Remember your password?{" "}
                <button
                  onClick={onBack}
                  className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Professional Background */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-red-600 to-red-700 items-center justify-center p-8 relative">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold mb-4 text-white no-underline">Secure Access</h2>
          <p className="text-xl opacity-90 mb-8 text-white text-[16px]">
            Reset your password securely and get back to your studies
          </p>
        </div>
        
        {/* Footer Line */}
      </div>
    </div>
  );
}