import bitsLogo from 'figma:asset/d3c8c11311a55cbf5d0dda79bd6ff4204297115d.png';
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Eye, EyeOff, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ForgotPasswordPage } from "./ForgotPasswordPage";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import wilpLogo from "figma:asset/96b0fcc34a2793c7a806154c040a98a942e164fe.png";
import newWilpLogo from "figma:asset/f45565175c62bcc651936992a46b956588d7543e.png";

interface LoginPageProps {
  onLogin: (email: string, password: string, studentData?: any) => void;
  onSwitchToAdmin?: () => void;
}

export function LoginPage({ onLogin, onSwitchToAdmin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(""); // Clear any previous errors
    
    // Try student login
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/student/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ username: email, password })
        }
      );

      const data = await response.json();

      if (data.success && data.student) {
        // Student authenticated successfully
        onLogin(data.student.name, password, data.student);
        setIsLoading(false);
        return;
      } else {
        // Show error message if login failed
        setErrorMessage('Invalid email or password. Please check your credentials and try again.');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Login failed. Please check your internet connection and try again.');
      setIsLoading(false);
    }
  };

  // Show forgot password page if requested
  if (showForgotPassword) {
    return <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Logo & Heading */}
          <div className="text-center mb-6">
            <ImageWithFallback
              src={bitsLogo}
              alt="BITS Pilani Work Integrated Learning Programmes"
              className="w-full h-auto object-contain max-w-md mx-auto"
            />
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs text-red-800 flex-1">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => setErrorMessage("")}
                  className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#374151] text-sm">
                BITS Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-10 rounded-lg border-[#D1D5DB] bg-[#F9FAFB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors text-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#374151] text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pr-10 rounded-lg border-[#D1D5DB] bg-[#F9FAFB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors text-sm"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#374151] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-[#374151] cursor-pointer"
                >
                  Remember Me
                </Label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#374151] hover:text-[#1F2937] underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!email || !password || isLoading}
              className="w-full h-10 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                <>Log In <span className="ml-2">➤</span></>
              )}
            </Button>
          </form>

          {/* Student Credentials Info */}


          {/* Admin Portal Link */}
          {onSwitchToAdmin && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="w-full flex items-center justify-center gap-2 text-xs text-red-600 hover:text-red-700 font-medium transition-colors py-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Portal Login →
              </button>
            </div>
          )}

          {/* Login Instructions */}
          <div className="mt-3 text-center">
            <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
              <DialogTrigger asChild>
                <button className="text-[#4F46E5] hover:text-[#4338CA] text-sm font-medium transition-colors">
                  Click here for login instructions
                </button>
              </DialogTrigger>
              <DialogContent className="w-[85vw] h-[80vh] max-w-[1100px] p-8 overflow-y-auto bg-white rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold text-blue-600 mb-4">
                    Instructions
                  </DialogTitle>
                  <DialogDescription className="text-sm text-[#6B7280]">
                    Login instructions for different user types in the WILP
                    Portal
                  </DialogDescription>
                </DialogHeader>

                {/* Instructions content */}
                <div className="space-y-6 text-gray-800 text-base leading-relaxed">
                  <p className="font-semibold text-lg text-gray-900 text-center">
                    Welcome to the WILP Portal
                  </p>

                  <p className="text-[12px]">
                    <strong>For WILP Students:</strong> Please enter your BITS
                    Mail address containing your 11-character student id (for
                    eg.
                    <code className="bg-gray-100 px-1 rounded mx-1">
                      201218ts450@wilp.bits-pilani.ac.in
                    </code>
                    ) and your date of birth (in ddmmyyyy format) as your
                    default password.
                    <br />
                    <span className="text-gray-600">
                      Example: If your date of birth is March 1st 1990, then
                      your password will be
                      <code className="bg-gray-100 px-1 rounded mx-1">
                        01031990
                      </code>
                    </span>
                  </p>

                  <p className="text-[12px]">
                    <strong>For On-campus faculty:</strong> Please enter your
                    BITS Mail address. Your default password will be your
                    4-digit PSRN number, prefixed with the letter corresponding
                    to your campus, in uppercase.
                    <br />
                    <span className="text-gray-600">
                      Examples:
                      <code className="bg-gray-100 px-1 rounded mx-1">
                        P0123
                      </code>
                      ,
                      <code className="bg-gray-100 px-1 rounded mx-1">
                        G0123
                      </code>
                      ,
                      <code className="bg-gray-100 px-1 rounded mx-1">
                        H0123
                      </code>
                      ,
                      <code className="bg-gray-100 px-1 rounded mx-1">
                        D0123
                      </code>
                    </span>
                  </p>

                  <p className="text-[12px]">
                    <strong>For Off-campus faculty:</strong> Please enter your
                    BITS Mail address. Your default password will be your
                    4-digit PSRN number prefixed with
                    <code className="bg-gray-100 px-1 rounded mx-1">P</code>,
                    irrespective of your actual location.
                    <br />
                    <span className="text-gray-600">
                      Example:
                      <code className="bg-gray-100 px-1 rounded mx-1">
                        P0123
                      </code>
                    </span>
                  </p>

                  <p className="text-[12px]">
                    <strong>For Guest faculty:</strong> Please enter your BITS
                    Mail address and your PAN number in uppercase as your
                    default password.
                    <br />
                    <span className="text-gray-600">
                      Example:
                      <code className="bg-gray-100 px-1 rounded mx-1">
                        ABCDE1234F
                      </code>
                    </span>
                  </p>

                  <p className="text-[12px]">
                    <strong>For TAs / PS2 Students:</strong> Please enter your
                    BITS Mail address and your Student ID in uppercase as your
                    default password.
                    <br />
                    <span className="text-gray-600">
                      Example:
                      <code className="bg-gray-100 px-1 rounded mx-1">
                        2011A1PS708G
                      </code>
                    </span>
                  </p>

                  <p className="text-red-600 text-[12px]">
                    If you are unable to login to the eLearn portal with your
                    password, or have forgotten your password, please click on
                    the <strong>"Forgot Password?"</strong> link and enter your
                    BITS Mail address. An email with the password reset
                    instructions will be sent to you.
                  </p>

                  <p className="text-[12px] text-left">
                    If you're unable to login to your BITS Mail account, please
                    write to
                    <a
                      href="mailto:mailadmin@wilp.bits-pilani.ac.in"
                      className="text-blue-600 underline ml-1"
                    >
                      mailadmin@wilp.bits-pilani.ac.in
                    </a>
                    .
                  </p>
                </div>

                {/* Close Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="px-5 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 flex items-center gap-2"
                  >
                    Close <span className="text-lg">×</span>
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="bg-white flex-shrink-0">
        {/* Social Media Links - Above colored stripe */}
        <div className="px-3 py-2 bg-white">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[10px] text-[#6B7280] font-medium hidden sm:inline">Follow BITS Pilani:</span>
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/bitspilani_wilp/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E1306C] hover:text-[#C13C60] transition-colors duration-200"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/BitsPilaniOffCampus/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1877F2] hover:text-[#166FE5] transition-colors duration-200"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/school/bits-pilani-wilp/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0A66C2] hover:text-[#095D9E] transition-colors duration-200"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/BITSPilani_WILP/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1DA1F2] hover:text-[#1A91DA] transition-colors duration-200"
                aria-label="Follow us on X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Colored stripe */}
        <div className="flex h-1.5">
          <div className="flex-1 bg-[rgba(252,175,24,1)]"></div>
          <div className="flex-1 bg-[rgba(116,194,231,1)]"></div>
          <div className="flex-1 bg-[rgba(237,30,38,1)]"></div>
        </div>
        
        {/* University Information - Below colored stripe */}
        <div className="px-3 py-2 bg-[#F8F9FA]">
          <p className="text-[10px] text-[#6B7280] text-center leading-tight">
            An institution deemed to be a University estd. vide Sec.3 of the UGC
            Act, 1956 under notification #F.12-23/63.U-2 of June 18, 1964
          </p>
        </div>
      </div>
    </div>
  );
}