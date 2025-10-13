// Announcement management endpoints for admin
import * as kv from './kv_store.tsx';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  createdBy: string;
  read?: boolean;
  time?: string;
}

// Get all announcements
export async function getAnnouncements() {
  try {
    const announcements = await kv.getByPrefix('announcement-');
    return announcements.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

// Create new announcement (Admin only)
export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>) {
  try {
    const id = `announcement-${Date.now()}`;
    const newAnnouncement: Announcement = {
      ...announcement,
      id,
      createdAt: new Date().toISOString(),
      time: 'just now'
    };
    
    await kv.set(id, newAnnouncement);
    return { success: true, data: newAnnouncement };
  } catch (error) {
    console.error('Error creating announcement:', error);
    return { success: false, error: 'Failed to create announcement' };
  }
}

// Update announcement (Admin only)
export async function updateAnnouncement(id: string, updates: Partial<Announcement>) {
  try {
    const existing = await kv.get(id);
    if (!existing) {
      return { success: false, error: 'Announcement not found' };
    }
    
    const updated = { ...existing, ...updates };
    await kv.set(id, updated);
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating announcement:', error);
    return { success: false, error: 'Failed to update announcement' };
  }
}

// Delete announcement (Admin only)
export async function deleteAnnouncement(id: string) {
  try {
    await kv.del(id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return { success: false, error: 'Failed to delete announcement' };
  }
}

// Initialize default admin credentials if not exists
export async function initializeAdmin() {
  try {
    const existingAdmin = await kv.get('admin-credentials');
    if (!existingAdmin) {
      // Default admin credentials
      await kv.set('admin-credentials', {
        username: 'admin',
        password: 'admin123', // In production, this should be hashed
        role: 'admin'
      });
      console.log('Default admin credentials initialized');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

// Verify admin credentials
export async function verifyAdmin(username: string, password: string) {
  try {
    // Check default admin
    const credentials = await kv.get('admin-credentials');
    if (credentials && credentials.username === username && credentials.password === password) {
      return { success: true, role: 'admin', name: 'Administrator' };
    }
    
    // Check additional admins
    const admins = await kv.get('admin-accounts') || [];
    const admin = admins.find((a: any) => a.username === username && a.password === password);
    if (admin) {
      return { success: true, role: 'admin', name: admin.name };
    }
    
    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    console.error('Error verifying admin:', error);
    return { success: false, error: 'Verification failed' };
  }
}
