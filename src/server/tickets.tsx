// Ticket Management System
import * as kv from './kv_store.tsx';

export interface Ticket {
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
  assignedTo?: string; // Staff username
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  author: string;
  authorRole: 'student' | 'staff' | 'admin';
  message: string;
  timestamp: string;
  isResolution?: boolean;
}

export interface StaffAssignment {
  id: string;
  staffUsername: string;
  staffName: string;
  courseId: string;
  courseName: string;
  assignedAt: string;
}

const TICKETS_KEY_PREFIX = 'tickets:';
const STAFF_ASSIGNMENTS_KEY = 'staff_assignments';
const TICKET_COUNTER_KEY = 'ticket_counter';

// Get next ticket number
async function getNextTicketNumber(): Promise<number> {
  const counter = await kv.get(TICKET_COUNTER_KEY);
  const nextNumber = counter ? counter + 1 : 1;
  await kv.set(TICKET_COUNTER_KEY, nextNumber);
  return nextNumber;
}

// Get total ticket count
export async function getTotalTicketCount(): Promise<number> {
  const counter = await kv.get(TICKET_COUNTER_KEY);
  return counter || 0;
}

// Get all tickets
export async function getAllTickets(): Promise<Ticket[]> {
  const tickets = await kv.getByPrefix(TICKETS_KEY_PREFIX);
  return tickets.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

// Get ticket by ID
export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  return await kv.get(`${TICKETS_KEY_PREFIX}${ticketId}`);
}

// Get tickets by student
export async function getTicketsByStudent(studentEmail: string): Promise<Ticket[]> {
  const allTickets = await getAllTickets();
  return allTickets.filter(t => t.studentEmail === studentEmail);
}

// Get tickets by course
export async function getTicketsByCourse(courseId: string): Promise<Ticket[]> {
  const allTickets = await getAllTickets();
  return allTickets.filter(t => t.courseId === courseId);
}

// Get tickets by status
export async function getTicketsByStatus(status: string): Promise<Ticket[]> {
  const allTickets = await getAllTickets();
  return allTickets.filter(t => t.status === status);
}

// Get tickets by assigned staff
export async function getTicketsByStaff(staffUsername: string): Promise<Ticket[]> {
  const allTickets = await getAllTickets();
  return allTickets.filter(t => t.assignedTo === staffUsername);
}

// Create new ticket
export async function createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'responses'>): Promise<Ticket> {
  const ticketNumber = await getNextTicketNumber();
  const ticketId = `${ticketNumber}`;
  
  const ticket: Ticket = {
    ...ticketData,
    id: ticketId,
    status: ticketData.status || 'open',
    priority: ticketData.priority || 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responses: []
  };
  
  await kv.set(`${TICKETS_KEY_PREFIX}${ticketId}`, ticket);
  
  console.log(`✅ Created ticket #${ticketNumber}: ${ticket.subject}`);
  return ticket;
}

// Update ticket
export async function updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket | null> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) return null;
  
  const updatedTicket: Ticket = {
    ...ticket,
    ...updates,
    id: ticketId, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  await kv.set(`${TICKETS_KEY_PREFIX}${ticketId}`, updatedTicket);
  
  console.log(`✅ Updated ticket: ${ticketId}`);
  return updatedTicket;
}

// Add response to ticket
export async function addTicketResponse(
  ticketId: string, 
  author: string, 
  authorRole: 'student' | 'staff' | 'admin',
  message: string,
  isResolution: boolean = false
): Promise<Ticket | null> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) return null;
  
  const response: TicketResponse = {
    id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ticketId,
    author,
    authorRole,
    message,
    timestamp: new Date().toISOString(),
    isResolution
  };
  
  ticket.responses.push(response);
  ticket.updatedAt = new Date().toISOString();
  
  // Update status if it's a resolution
  if (isResolution) {
    ticket.status = 'resolved';
  } else if (ticket.status === 'open') {
    ticket.status = 'in-progress';
  }
  
  await kv.set(`${TICKETS_KEY_PREFIX}${ticketId}`, ticket);
  
  console.log(`✅ Added response to ticket: ${ticketId}`);
  return ticket;
}

// Close ticket
export async function closeTicket(ticketId: string): Promise<Ticket | null> {
  return await updateTicket(ticketId, { status: 'closed' });
}

// Delete ticket
export async function deleteTicket(ticketId: string): Promise<boolean> {
  await kv.del(`${TICKETS_KEY_PREFIX}${ticketId}`);
  console.log(`✅ Deleted ticket: ${ticketId}`);
  return true;
}

// STAFF ASSIGNMENT FUNCTIONS

// Get all staff assignments
export async function getAllStaffAssignments(): Promise<StaffAssignment[]> {
  const assignments = await kv.get(STAFF_ASSIGNMENTS_KEY);
  return assignments || [];
}

// Get staff assigned to course
export async function getStaffForCourse(courseId: string): Promise<StaffAssignment[]> {
  const allAssignments = await getAllStaffAssignments();
  return allAssignments.filter(a => a.courseId === courseId);
}

// Get courses assigned to staff
export async function getCoursesForStaff(staffUsername: string): Promise<StaffAssignment[]> {
  const allAssignments = await getAllStaffAssignments();
  return allAssignments.filter(a => a.staffUsername === staffUsername);
}

// Assign staff to course
export async function assignStaffToCourse(
  staffUsername: string,
  staffName: string,
  courseId: string,
  courseName: string
): Promise<StaffAssignment> {
  const assignments = await getAllStaffAssignments();
  
  // Check if already assigned
  const existing = assignments.find(
    a => a.staffUsername === staffUsername && a.courseId === courseId
  );
  
  if (existing) {
    return existing;
  }
  
  const assignment: StaffAssignment = {
    id: `staff-assign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    staffUsername,
    staffName,
    courseId,
    courseName,
    assignedAt: new Date().toISOString()
  };
  
  assignments.push(assignment);
  await kv.set(STAFF_ASSIGNMENTS_KEY, assignments);
  
  console.log(`✅ Assigned ${staffName} to ${courseName}`);
  return assignment;
}

// Remove staff assignment
export async function removeStaffAssignment(assignmentId: string): Promise<boolean> {
  const assignments = await getAllStaffAssignments();
  const filtered = assignments.filter(a => a.id !== assignmentId);
  
  await kv.set(STAFF_ASSIGNMENTS_KEY, filtered);
  
  console.log(`✅ Removed staff assignment: ${assignmentId}`);
  return true;
}

// Auto-assign ticket to course staff
export async function autoAssignTicket(ticketId: string, courseId: string): Promise<Ticket | null> {
  const staffAssignments = await getStaffForCourse(courseId);
  
  if (staffAssignments.length === 0) {
    return await getTicketById(ticketId);
  }
  
  // Assign to first available staff (can be enhanced with load balancing)
  const staffToAssign = staffAssignments[0];
  
  return await updateTicket(ticketId, {
    assignedTo: staffToAssign.staffUsername
  });
}
