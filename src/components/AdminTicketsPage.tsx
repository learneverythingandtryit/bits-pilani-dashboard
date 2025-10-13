import { useState, useEffect } from "react";
import { Ticket, MessageSquare, Clock, CheckCircle, XCircle, Filter, Send, User, BookOpen, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select } from "./ui/select";
import { Dialog } from "./ui/dialog";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface TicketData {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId?: string;
  courseName?: string;
  subject: string;
  description: string;
  category: 'grades' | 'content' | 'technical' | 'general';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  author: string;
  authorRole: 'student' | 'staff' | 'admin';
  message: string;
  timestamp: string;
  isResolution?: boolean;
}

interface StaffAssignment {
  id: string;
  staffUsername: string;
  staffName: string;
  courseId: string;
  courseName: string;
  assignedAt: string;
}

interface AdminTicketsPageProps {
  adminUsername: string;
  courses: any[];
}

export function AdminTicketsPage({ adminUsername, courses }: AdminTicketsPageProps) {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Response form
  const [responseMessage, setResponseMessage] = useState('');
  const [isResolution, setIsResolution] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Staff assignment dialog
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffName, setStaffName] = useState('');
  
  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<TicketData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load tickets and staff assignments
  useEffect(() => {
    loadTickets();
    loadStaffAssignments();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/tickets`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffAssignments = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/staff-assignments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setStaffAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Failed to load staff assignments:', error);
    }
  };

  const handleAssignStaff = async () => {
    if (!staffUsername || !staffName || !selectedCourse) return;
    
    const course = courses.find(c => c.id === selectedCourse);
    if (!course) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/staff-assignments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            staffUsername,
            staffName,
            courseId: course.id,
            courseName: course.title
          })
        }
      );
      
      if (response.ok) {
        await loadStaffAssignments();
        setShowStaffDialog(false);
        setStaffUsername('');
        setStaffName('');
        setSelectedCourse('');
      }
    } catch (error) {
      console.error('Failed to assign staff:', error);
    }
  };

  const handleRemoveStaffAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/staff-assignments/${assignmentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        await loadStaffAssignments();
      }
    } catch (error) {
      console.error('Failed to remove staff assignment:', error);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !responseMessage.trim()) return;
    
    setSending(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/tickets/${selectedTicket.id}/responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            author: adminUsername,
            authorRole: 'admin',
            message: responseMessage,
            isResolution
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data.ticket);
        setResponseMessage('');
        setIsResolution(false);
        await loadTickets();
      }
    } catch (error) {
      console.error('Failed to send response:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/tickets/${ticketId}/close`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        await loadTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null);
        }
      }
    } catch (error) {
      console.error('Failed to close ticket:', error);
    }
  };

  const handleDeleteClick = (ticket: TicketData) => {
    setTicketToDelete(ticket);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;
    
    setDeleting(true);
    try {
      console.log(`🗑️ Attempting to delete ticket #${ticketToDelete.id}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-917daa5d/tickets/${ticketToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ticket deleted successfully:', data);
        
        toast.success(`Ticket #${ticketToDelete.id} deleted successfully`);
        
        await loadTickets();
        if (selectedTicket?.id === ticketToDelete.id) {
          setSelectedTicket(null);
        }
        setShowDeleteDialog(false);
        setTicketToDelete(null);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to delete ticket:', errorData);
        toast.error(`Failed to delete ticket: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Exception deleting ticket:', error);
      toast.error('Failed to delete ticket. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (courseFilter !== 'all' && ticket.courseId !== courseFilter) return false;
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-university-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-university-primary">Support Tickets</h1>
          <p className="text-gray-600">Manage student concerns and support requests</p>
        </div>
        <Button onClick={() => setShowStaffDialog(true)} style={{ backgroundColor: 'rgb(25, 35, 94)', color: 'white' }}>
          <User className="w-4 h-4 mr-2" />
          Assign Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-2xl font-semibold text-blue-600">
                {tickets.filter(t => t.status === 'open').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-semibold text-purple-600">
                {tickets.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-green-600">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-university-primary">
                {tickets.length}
              </p>
            </div>
            <Ticket className="w-8 h-8 text-university-primary" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <span className="text-sm text-gray-600">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Tickets</h2>
          {filteredTickets.length === 0 ? (
            <Card className="p-8 text-center">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No tickets match your filters</p>
            </Card>
          ) : (
            filteredTickets.map(ticket => (
              <Card
                key={ticket.id}
                className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedTicket?.id === ticket.id ? 'ring-2 ring-university-primary' : ''
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600">{ticket.studentName}</p>
                    </div>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  
                  {ticket.courseName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      {ticket.courseName}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {ticket.responses.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4" />
                      {ticket.responses.length} response{ticket.responses.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Ticket Details */}
        <div className="sticky top-4">
          {selectedTicket ? (
            <Card className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-600">Ticket #{selectedTicket.id}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                    variant="outline"
                    size="sm"
                    disabled={selectedTicket.status === 'closed'}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Close Ticket
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(selectedTicket)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge className={getStatusColor(selectedTicket.status)}>
                  {selectedTicket.status}
                </Badge>
                <Badge className={getPriorityColor(selectedTicket.priority)}>
                  {selectedTicket.priority}
                </Badge>
                <Badge className="bg-gray-100 text-gray-800">
                  {selectedTicket.category}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Student</p>
                <p className="text-sm">{selectedTicket.studentName}</p>
                <p className="text-sm text-gray-600">{selectedTicket.studentEmail}</p>
              </div>

              {selectedTicket.courseName && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Course</p>
                  <p className="text-sm">{selectedTicket.courseName}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-gray-700">{selectedTicket.description}</p>
              </div>

              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-medium">Responses ({selectedTicket.responses.length})</p>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedTicket.responses.map(response => (
                    <div
                      key={response.id}
                      className={`p-3 rounded-lg ${
                        response.authorRole === 'student'
                          ? 'bg-gray-100'
                          : 'bg-blue-50 border-l-4 border-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {response.author} ({response.authorRole})
                        </span>
                        {response.isResolution && (
                          <Badge className="bg-green-100 text-green-800">Resolution</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{response.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(response.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== 'closed' && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your response..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={4}
                    />
                    
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isResolution}
                          onChange={(e) => setIsResolution(e.target.checked)}
                          className="rounded"
                        />
                        Mark as resolution
                      </label>
                      
                      <Button
                        onClick={handleSendResponse}
                        disabled={sending || !responseMessage.trim()}
                        style={{ backgroundColor: 'rgb(25, 35, 94)', color: 'white' }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Response
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a ticket to view details</p>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && ticketToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Ticket</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Are you sure you want to delete this ticket? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Ticket #{ticketToDelete.id}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Subject:</span> {ticketToDelete.subject}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Student:</span> {ticketToDelete.studentName}
              </p>
              {ticketToDelete.courseName && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Course:</span> {ticketToDelete.courseName}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setTicketToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Ticket
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Staff Assignment Dialog */}
      {showStaffDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6 m-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Assign Staff to Course</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowStaffDialog(false)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Staff Username</label>
                <Input
                  placeholder="Enter staff username..."
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Staff Name</label>
                <Input
                  placeholder="Enter staff full name..."
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleAssignStaff}
                className="w-full"
                style={{ backgroundColor: 'rgb(25, 35, 94)', color: 'white' }}
                disabled={!staffUsername || !staffName || !selectedCourse}
              >
                Assign Staff
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Current Staff Assignments</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {staffAssignments.map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{assignment.staffName}</p>
                      <p className="text-xs text-gray-600">{assignment.courseName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStaffAssignment(assignment.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {staffAssignments.length === 0 && (
                  <p className="text-sm text-gray-600 text-center py-4">No staff assignments yet</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
