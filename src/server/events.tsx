import * as kv from './kv_store.tsx';

// Initialize default events if needed
export async function initializeEvents() {
  try {
    const existingEvents = await kv.get('admin_events');
    if (!existingEvents) {
      console.log('Initializing events storage...');
      await kv.set('admin_events', JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing events:', error);
  }
}

// Get all events
export async function getEvents() {
  try {
    const eventsData = await kv.get('admin_events');
    return eventsData ? JSON.parse(eventsData) : [];
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
}

// Create new event
export async function createEvent(event: any) {
  try {
    const events = await getEvents();
    const newEvent = {
      ...event,
      id: event.id || `admin-event-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };
    
    events.push(newEvent);
    await kv.set('admin_events', JSON.stringify(events));
    
    console.log(`Event created: ${newEvent.title} (${newEvent.id})`);
    return newEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

// Update event
export async function updateEvent(eventId: string, updatedData: any) {
  try {
    const events = await getEvents();
    const index = events.findIndex((e: any) => e.id === eventId);
    
    if (index === -1) {
      throw new Error('Event not found');
    }
    
    events[index] = {
      ...events[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set('admin_events', JSON.stringify(events));
    
    console.log(`Event updated: ${eventId}`);
    return events[index];
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

// Delete event
export async function deleteEvent(eventId: string) {
  try {
    const events = await getEvents();
    const filteredEvents = events.filter((e: any) => e.id !== eventId);
    
    await kv.set('admin_events', JSON.stringify(filteredEvents));
    
    console.log(`Event deleted: ${eventId}`);
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}
