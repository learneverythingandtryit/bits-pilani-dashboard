import { useState } from "react";
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

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setTimeout(() => {
      const name =
        email
          .split("@")[0]
          .replace(/[0-9]/g, "")
          .replace(/[^a-zA-Z]/g, " ")
          .trim() || "Student";
      onLogin(name, password);
      setIsLoading(false);
    }, 1000);
  };

  // Show forgot password page if requested
  if (showForgotPassword) {
    return <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* University Illustration - Bottom Right Corner */}
      <div className="fixed bottom-20 right-4 z-10 hidden sm:block">
        <img
          alt="University Innovation Illustration"
          className="w-56 h-auto object-contain opacity-100 px-[0px] py-[-14px] mx-[0px] my-[-32px]"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 mx-[0px] my-[-32px]">
        <div className="w-full max-w-md">
          {/* Logo & Heading */}
          <div className="text-center mb-12">
            <div className="w-full max-w-sm mx-auto mb-8">
              <ImageWithFallback
                src={bitsLogo}
                alt="BITS Pilani Work Integrated Learning Programmes"
                className="w-full h-auto object-contain max-w-sm mx-auto"
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[#374151] text-base">
                BITS Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-12 rounded-lg border-[#D1D5DB] bg-[#F9FAFB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors text-base"
                style={{ fontFamily: "Inter, sans-serif" }}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-[#374151] text-base">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12 rounded-lg border-[#D1D5DB] bg-[#F9FAFB] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors text-base"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#374151] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between py-2">
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
              className="w-full h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
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

          {/* Login Instructions */}
          <div className="mt-8 text-center">
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

      {/* Footer */}
      <div className="bg-white">
        {/* Social Media Links - Above colored stripe */}
        <div className="px-4 py-4 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#6B7280] font-medium">Follow BITS Pilani:</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/bitspilani_wilp/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E1306C] hover:text-[#C13C60] transition-colors duration-200"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.facebook.com/BitsPilaniOffCampus/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1877F2] hover:text-[#166FE5] transition-colors duration-200"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/school/bits-pilani-wilp/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A66C2] hover:text-[#095D9E] transition-colors duration-200"
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://x.com/BITSPilani_WILP/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1DA1F2] hover:text-[#1A91DA] transition-colors duration-200"
                  aria-label="Follow us on X (Twitter)"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Colored stripe */}
        <div className="flex h-2">
          <div className="flex-1 bg-[rgba(252,175,24,1)]"></div>
          <div className="flex-1 bg-[rgba(116,194,231,1)]"></div>
          <div className="flex-1 bg-[rgba(237,30,38,1)]"></div>
        </div>
        
        {/* University Information - Below colored stripe */}
        <div className="px-4 py-3 bg-[#F8F9FA]">
          <p className="text-xs text-[#6B7280] text-center text-[11px]">
            An institution deemed to be a University estd. vide Sec.3 of the UGC
            Act, 1956 under notification #F.12-23/63.U-2 of June 18, 1964
          </p>
        </div>
      </div>
    </div>
  );
}
