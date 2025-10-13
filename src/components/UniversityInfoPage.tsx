import { X, ArrowLeft, ExternalLink, MapPin, Phone, Mail, Globe, Calendar, Users, Award, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UniversityInfoPageProps {
  onBack: () => void;
}

export function UniversityInfoPage({ onBack }: UniversityInfoPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-university-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/10 p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold">BITS Pilani University Information</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/10 p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card className="professional-card p-6">
              <div className="relative h-64 sm:h-80 mb-6 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1741639928703-2d09e886cc61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmdzJTIwYWNhZGVtaWN8ZW58MXx8fHwxNzU4NzM3ODI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="BITS Pilani Campus"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-university-primary mb-4">
                  Birla Institute of Technology and Science, Pilani
                </h2>
                <p className="text-lg text-university-secondary mb-4">
                  A Leading Institution of Excellence in Higher Education
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="bg-university-primary text-white">
                    Established 1964
                  </Badge>
                  <Badge variant="secondary" className="bg-university-primary text-white">
                    Private University
                  </Badge>
                  <Badge variant="secondary" className="bg-university-primary text-white">
                    Multi-Campus
                  </Badge>
                </div>
              </div>
            </Card>

            {/* About BITS */}
            <Card className="professional-card p-6">
              <h3 className="text-2xl font-semibold text-university-primary mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                About BITS Pilani
              </h3>
              <div className="space-y-4 text-university-secondary">
                <p>
                  The Birla Institute of Technology and Science (BITS) Pilani is a private deemed university 
                  located in Pilani, Rajasthan, India. It is one of the most prestigious technical institutions 
                  in India, known for its excellence in engineering, sciences, and management education.
                </p>
                <p>
                  BITS Pilani has established itself as a leader in higher education with a strong emphasis 
                  on research, innovation, and industry collaboration. The institute offers undergraduate, 
                  postgraduate, and doctoral programs across multiple disciplines.
                </p>
                <p>
                  With its multiple campuses across India and international presence, BITS Pilani continues 
                  to be at the forefront of technological advancement and academic excellence, producing 
                  leaders who contribute significantly to society and industry.
                </p>
              </div>
            </Card>

            {/* Campus Locations */}
            <Card className="professional-card p-6">
              <h3 className="text-2xl font-semibold text-university-primary mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Campus Locations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-university-border rounded-lg">
                  <h4 className="font-semibold text-university-primary mb-2">Pilani Campus</h4>
                  <p className="text-sm text-university-secondary">
                    The main campus located in Pilani, Rajasthan. Founded in 1964.
                  </p>
                </div>
                <div className="p-4 border border-university-border rounded-lg">
                  <h4 className="font-semibold text-university-primary mb-2">Goa Campus</h4>
                  <p className="text-sm text-university-secondary">
                    Established in 2004, offering engineering and sciences programs.
                  </p>
                </div>
                <div className="p-4 border border-university-border rounded-lg">
                  <h4 className="font-semibold text-university-primary mb-2">Hyderabad Campus</h4>
                  <p className="text-sm text-university-secondary">
                    Founded in 2008, focusing on engineering and technology.
                  </p>
                </div>
                <div className="p-4 border border-university-border rounded-lg">
                  <h4 className="font-semibold text-university-primary mb-2">Dubai Campus</h4>
                  <p className="text-sm text-university-secondary">
                    International campus established in 2000 in Dubai, UAE.
                  </p>
                </div>
              </div>
            </Card>

            {/* Programs Offered */}
            <Card className="professional-card p-6">
              <h3 className="text-2xl font-semibold text-university-primary mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                Programs Offered
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-university-primary mb-3">Undergraduate</h4>
                  <ul className="space-y-2 text-sm text-university-secondary">
                    <li>• B.E. Computer Science</li>
                    <li>• B.E. Electronics & Instrumentation</li>
                    <li>• B.E. Mechanical Engineering</li>
                    <li>• B.E. Chemical Engineering</li>
                    <li>• B.Pharm</li>
                    <li>• B.Sc. (Hons.) Chemistry</li>
                    <li>• B.Sc. (Hons.) Physics</li>
                    <li>• B.Sc. (Hons.) Mathematics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-university-primary mb-3">Postgraduate</h4>
                  <ul className="space-y-2 text-sm text-university-secondary">
                    <li>• M.E. Software Systems</li>
                    <li>• M.Sc. Chemistry</li>
                    <li>• M.Sc. Physics</li>
                    <li>• M.Sc. Mathematics</li>
                    <li>• MBA</li>
                    <li>• M.Phil</li>
                    <li>• M.Tech</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-university-primary mb-3">Doctoral</h4>
                  <ul className="space-y-2 text-sm text-university-secondary">
                    <li>• Ph.D. Engineering</li>
                    <li>• Ph.D. Sciences</li>
                    <li>• Ph.D. Pharmacy</li>
                    <li>• Ph.D. Management</li>
                    <li>• Ph.D. Humanities</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <Card className="professional-card p-6">
              <h3 className="text-xl font-semibold text-university-primary mb-4">Quick Facts</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-university-primary" />
                  <div>
                    <p className="font-medium text-university-primary">Founded</p>
                    <p className="text-sm text-university-secondary">1964</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-university-primary" />
                  <div>
                    <p className="font-medium text-university-primary">Students</p>
                    <p className="text-sm text-university-secondary">15,000+</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-university-primary" />
                  <div>
                    <p className="font-medium text-university-primary">Ranking</p>
                    <p className="text-sm text-university-secondary">Top 10 Engineering Colleges</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-university-primary" />
                  <div>
                    <p className="font-medium text-university-primary">Campuses</p>
                    <p className="text-sm text-university-secondary">4 (India & UAE)</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="professional-card p-6">
              <h3 className="text-xl font-semibold text-university-primary mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-university-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-university-primary">Address</p>
                    <p className="text-sm text-university-secondary">
                      BITS Pilani, Pilani Campus<br />
                      Vidya Vihar, Pilani - 333031<br />
                      Rajasthan, India
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-university-primary" />
                  <div>
                    <p className="font-medium text-university-primary">Phone</p>
                    <p className="text-sm text-university-secondary">+91-1596-515-151</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-university-primary" />
                  <div>
                    <p className="font-medium text-university-primary">Email</p>
                    <p className="text-sm text-university-secondary">info@pilani.bits-pilani.ac.in</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-university-primary" />
                  <div>
                    <p className="font-medium text-university-primary">Website</p>
                    <a 
                      href="https://www.bits-pilani.ac.in" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-university-primary hover:underline flex items-center gap-1"
                    >
                      www.bits-pilani.ac.in
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="professional-card p-6">
              <h3 className="text-xl font-semibold text-university-primary mb-4">Key Achievements</h3>
              <div className="space-y-3">
                <div className="p-3 bg-university-light rounded-lg">
                  <p className="text-sm font-medium text-university-primary">NAAC A++ Grade</p>
                  <p className="text-xs text-university-secondary">Highest accreditation from NAAC</p>
                </div>
                <div className="p-3 bg-university-light rounded-lg">
                  <p className="text-sm font-medium text-university-primary">NIRF Ranking</p>
                  <p className="text-xs text-university-secondary">Consistently in top engineering institutes</p>
                </div>
                <div className="p-3 bg-university-light rounded-lg">
                  <p className="text-sm font-medium text-university-primary">Industry Partnerships</p>
                  <p className="text-xs text-university-secondary">Strong collaborations with leading companies</p>
                </div>
                <div className="p-3 bg-university-light rounded-lg">
                  <p className="text-sm font-medium text-university-primary">Alumni Network</p>
                  <p className="text-xs text-university-secondary">100,000+ alumni worldwide</p>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="professional-card p-6">
              <h3 className="text-xl font-semibold text-university-primary mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a 
                  href="https://www.bits-pilani.ac.in/admissions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 hover:bg-university-light rounded-lg transition-colors"
                >
                  <span className="text-sm text-university-primary">Admissions</span>
                  <ExternalLink className="w-4 h-4 text-university-accent" />
                </a>
                <a 
                  href="https://www.bits-pilani.ac.in/academics" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 hover:bg-university-light rounded-lg transition-colors"
                >
                  <span className="text-sm text-university-primary">Academics</span>
                  <ExternalLink className="w-4 h-4 text-university-accent" />
                </a>
                <a 
                  href="https://www.bits-pilani.ac.in/research" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 hover:bg-university-light rounded-lg transition-colors"
                >
                  <span className="text-sm text-university-primary">Research</span>
                  <ExternalLink className="w-4 h-4 text-university-accent" />
                </a>
                <a 
                  href="https://www.bits-pilani.ac.in/placements" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 hover:bg-university-light rounded-lg transition-colors"
                >
                  <span className="text-sm text-university-primary">Placements</span>
                  <ExternalLink className="w-4 h-4 text-university-accent" />
                </a>
                <a 
                  href="https://www.bits-pilani.ac.in/alumni" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 hover:bg-university-light rounded-lg transition-colors"
                >
                  <span className="text-sm text-university-primary">Alumni</span>
                  <ExternalLink className="w-4 h-4 text-university-accent" />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}