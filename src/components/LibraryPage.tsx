import { useState } from "react";
import { BookOpen, Search, Filter, Clock, User, Download, Eye, Star, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  availableCount: number;
  totalCount: number;
  coverImage: string;
  description: string;
  publicationYear: number;
  rating: number;
}

interface BorrowedBook {
  id: string;
  bookId: string;
  title: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  renewalCount: number;
  maxRenewals: number;
  status: "active" | "overdue" | "renewed";
}

interface DigitalResource {
  id: string;
  title: string;
  type: string;
  subject: string;
  accessUrl: string;
  description: string;
  lastAccessed?: string;
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

interface LibraryPageProps {
  courses: Course[];
}

export function LibraryPage({ courses }: LibraryPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Generate library books based on actual courses
  const [libraryBooks] = useState<LibraryBook[]>(() => {
    const courseBooks: LibraryBook[] = [
      // Computer Programming books
      {
        id: "book-cp-1",
        title: "C Programming Language",
        author: "Dennis M. Ritchie, Brian W. Kernighan",
        isbn: "978-0131103627",
        category: "Computer Programming",
        availableCount: 5,
        totalCount: 8,
        coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc1NzY1ODQ4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "The definitive guide to C programming language",
        publicationYear: 1988,
        rating: 4.9
      },
      // Data Structures books
      {
        id: "book-ds-1",
        title: "Data Structures and Algorithms in C++",
        author: "Michael T. Goodrich",
        isbn: "978-0470383278",
        category: "Data Structures",
        availableCount: 3,
        totalCount: 6,
        coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhhbGdvcml0aG1zJTIwZGF0YSUyMHN0cnVjdHVyZXN8ZW58MXx8fHwxNzU3NjU4NDgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "Comprehensive guide to data structures and algorithms",
        publicationYear: 2013,
        rating: 4.7
      },
      // Linear Algebra books
      {
        id: "book-la-1",
        title: "Linear Algebra and Its Applications",
        author: "David C. Lay",
        isbn: "978-0321982384",
        category: "Mathematics",
        availableCount: 4,
        totalCount: 7,
        coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtYXRoZW1hdGljcyUyMGJvb2t8ZW58MXx8fHwxNzU3NjU4NDgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "Essential concepts in linear algebra and optimization",
        publicationYear: 2016,
        rating: 4.5
      },
      // Operating Systems books
      {
        id: "book-os-1",
        title: "Operating System Concepts",
        author: "Abraham Silberschatz",
        isbn: "978-1118063330",
        category: "Operating Systems",
        availableCount: 2,
        totalCount: 5,
        coverImage: "https://images.unsplash.com/photo-1629654291663-b91ad427bbb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeXN0ZW1zJTIwcHJvZ3JhbW1pbmd8ZW58MXx8fHwxNzU3NjU4NDgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "Comprehensive guide to operating systems principles",
        publicationYear: 2018,
        rating: 4.6
      },
      // Database Systems books
      {
        id: "book-db-1",
        title: "Database System Concepts",
        author: "Abraham Silberschatz, Henry F. Korth",
        isbn: "978-0073523323",
        category: "Database Systems",
        availableCount: 3,
        totalCount: 6,
        coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhYmFzZSUyMHN5c3RlbXN8ZW58MXx8fHwxNzU3NjU4NDgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "Fundamental principles of database design and implementation",
        publicationYear: 2019,
        rating: 4.4
      },
      // Software Engineering books
      {
        id: "book-se-1",
        title: "Software Engineering: A Practitioner's Approach",
        author: "Roger S. Pressman",
        isbn: "978-0078022128",
        category: "Software Engineering",
        availableCount: 4,
        totalCount: 7,
        coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGVuZ2luZWVyaW5nfGVufDF8fHx8MTc1NzY1ODQ4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "Modern approaches to software engineering",
        publicationYear: 2014,
        rating: 4.3
      },
      // Computer Networks books
      {
        id: "book-cn-1",
        title: "Computer Networks",
        author: "Andrew S. Tanenbaum",
        isbn: "978-0132126953",
        category: "Computer Networks",
        availableCount: 2,
        totalCount: 5,
        coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXR3b3JrJTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzU3NjU4NDgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        description: "Comprehensive guide to computer networking concepts",
        publicationYear: 2011,
        rating: 4.5
      }
    ];

    return courseBooks;
  });

  // Sample borrowed books
  const [borrowedBooks] = useState<BorrowedBook[]>([
    {
      id: "1",
      bookId: "1",
      title: "Linear Algebra and Its Applications",
      author: "David C. Lay",
      borrowDate: "2024-01-15",
      dueDate: "2024-02-15",
      renewalCount: 1,
      maxRenewals: 2,
      status: "active"
    },
    {
      id: "2",
      bookId: "2",
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      borrowDate: "2024-01-10",
      dueDate: "2024-02-10",
      renewalCount: 0,
      maxRenewals: 2,
      status: "overdue"
    }
  ]);

  // Generate digital resources based on courses
  const [digitalResources] = useState<DigitalResource[]>([
    {
      id: "dr-1",
      title: "ACM Digital Library",
      type: "Database",
      subject: "Computer Science",
      accessUrl: "https://dl.acm.org",
      description: "Computing literature database with articles on algorithms, programming, and software engineering",
      lastAccessed: "2024-01-18"
    },
    {
      id: "dr-2",
      title: "IEEE Computer Society Digital Library",
      type: "Database",
      subject: "Computer Networks",
      accessUrl: "https://computer.org",
      description: "IEEE publications on computer networks, systems, and architecture",
      lastAccessed: "2024-01-20"
    },
    {
      id: "dr-3",
      title: "SpringerLink Computer Science",
      type: "E-Books",
      subject: "Software Engineering",
      accessUrl: "https://link.springer.com",
      description: "Access to Springer computer science and software engineering books",
      lastAccessed: "2024-01-15"
    },
    {
      id: "dr-4",
      title: "MIT OpenCourseWare",
      type: "Course Materials",
      subject: "Mathematics",
      accessUrl: "https://ocw.mit.edu",
      description: "Free course materials for linear algebra and discrete mathematics",
      lastAccessed: "2024-01-22"
    },
    {
      id: "dr-5",
      title: "VLDB Digital Library",
      type: "Database",
      subject: "Database Systems",
      accessUrl: "https://vldb.org",
      description: "Very Large Data Bases conference proceedings and database research papers",
    },
    {
      id: "dr-6",
      title: "Software Engineering Body of Knowledge",
      type: "Reference",
      subject: "Software Engineering",
      accessUrl: "https://swebok.org",
      description: "IEEE Computer Society guide to software engineering knowledge areas",
      lastAccessed: "2024-01-19"
    }
  ]);

  const categories = ["All", "Mathematics", "Computer Science", "Physics", "Engineering", "Chemistry"];
  const subjects = ["All", "Mathematics", "Computer Science", "Physics", "Engineering"];

  const filteredBooks = libraryBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredResources = digitalResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === "all" || resource.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "overdue": return "bg-red-100 text-red-800 border-red-200";
      case "renewed": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-university-primary">Library</h1>
          <p className="text-university-secondary mt-1">Access books, digital resources, and manage your borrowings</p>
        </div>
        <Button className="bg-university-primary hover:bg-university-secondary">
          <BookOpen className="w-4 h-4 mr-2" />
          Library Card
        </Button>
      </div>

      {/* Library Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-university-primary">{borrowedBooks.length}</p>
                <p className="text-sm text-university-secondary">Borrowed Books</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-university-primary">
                  {borrowedBooks.filter(book => book.status === "active").length}
                </p>
                <p className="text-sm text-university-secondary">Active Loans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-university-primary">
                  {borrowedBooks.filter(book => book.status === "overdue").length}
                </p>
                <p className="text-sm text-university-secondary">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-university-primary">{digitalResources.length}</p>
                <p className="text-sm text-university-secondary">Digital Resources</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="catalog" className="w-full">
        <TabsList>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="borrowed">My Books ({borrowedBooks.length})</TabsTrigger>
          <TabsTrigger value="digital">Digital Resources</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
        </TabsList>

        {/* Book Catalog */}
        <TabsContent value="catalog" className="mt-6">
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-university-secondary" />
                <Input
                  placeholder="Search books by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="professional-card hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="aspect-[3/4] bg-university-light rounded-lg mb-3 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-university-secondary" />
                    </div>
                    <CardTitle className="text-lg text-university-primary line-clamp-2">
                      {book.title}
                    </CardTitle>
                    <p className="text-sm text-university-secondary">{book.author}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-university-secondary">Available:</span>
                        <span className="text-university-primary font-medium">
                          {book.availableCount}/{book.totalCount}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-university-secondary">Availability</span>
                          <span className="text-university-primary">
                            {Math.round((book.availableCount / book.totalCount) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(book.availableCount / book.totalCount) * 100} 
                          className="h-2"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {book.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-university-secondary">{book.rating}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-university-primary hover:bg-university-secondary"
                          disabled={book.availableCount === 0}
                        >
                          {book.availableCount > 0 ? "Borrow" : "Reserve"}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Borrowed Books */}
        <TabsContent value="borrowed" className="mt-6">
          <div className="space-y-4">
            {borrowedBooks.map((book) => {
              const daysUntilDue = getDaysUntilDue(book.dueDate);
              return (
                <Card key={book.id} className="professional-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-university-primary mb-1">{book.title}</h3>
                        <p className="text-sm text-university-secondary mb-2">{book.author}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-university-secondary">Borrowed:</span>
                            <p className="text-university-primary">{book.borrowDate}</p>
                          </div>
                          <div>
                            <span className="text-university-secondary">Due Date:</span>
                            <p className="text-university-primary">{book.dueDate}</p>
                          </div>
                          <div>
                            <span className="text-university-secondary">Days Left:</span>
                            <p className={`font-medium ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                              {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} overdue` : `${daysUntilDue} days`}
                            </p>
                          </div>
                          <div>
                            <span className="text-university-secondary">Renewals:</span>
                            <p className="text-university-primary">{book.renewalCount}/{book.maxRenewals}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(book.status)}>
                          {book.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={book.renewalCount >= book.maxRenewals}
                          >
                            Renew
                          </Button>
                          <Button size="sm" className="bg-university-primary hover:bg-university-secondary">
                            Return
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Digital Resources */}
        <TabsContent value="digital" className="mt-6">
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-university-secondary" />
                <Input
                  placeholder="Search digital resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.slice(1).map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="professional-card hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-university-primary">
                          {resource.title}
                        </CardTitle>
                        <p className="text-sm text-university-secondary mt-1">{resource.type}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {resource.subject}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-university-secondary line-clamp-3">
                        {resource.description}
                      </p>
                      
                      {resource.lastAccessed && (
                        <div className="flex items-center gap-2 text-sm text-university-secondary">
                          <Calendar className="w-4 h-4" />
                          <span>Last accessed: {resource.lastAccessed}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-university-primary hover:bg-university-secondary"
                        >
                          Access
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Reservations */}
        <TabsContent value="reservations" className="mt-6">
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-university-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-university-primary mb-2">No Active Reservations</h3>
            <p className="text-university-secondary mb-4">You don't have any book reservations at the moment.</p>
            <Button className="bg-university-primary hover:bg-university-secondary">
              Browse Catalog
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}