import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import EventCard from '../components/EventCard';
import CreateEventModal from '../components/CreateEventModal';
import SwapRequestModal from '../components/SwapRequestModal';
import type { Event, CreateEventRequest } from '../types';
import { eventsAPI, swapsAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [swappableSlots, setSwappableSlots] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsAPI.getMyEvents();
      setEvents(data);
    } catch (err: any) {
      setError('Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSwappableSlots = async () => {
    try {
      const data = await swapsAPI.getSwappableSlots();
      setSwappableSlots(data || []);
    } catch (err: any) {
      setError('Failed to load swappable slots');
      console.error('Error loading swappable slots:', err);
    }
  };

  const handleCreateEvent = async (eventData: CreateEventRequest) => {
    const newEvent = await eventsAPI.createEvent(eventData);
    setEvents(prev => [...prev, newEvent]);
  };

  const createTestEvents = async () => {
    try {
      const testEvents = [
        {
          title: "Team Meeting",
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
        },
        {
          title: "Focus Block",
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // Day after tomorrow + 2 hours
        },
        {
          title: "Client Call",
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 3 days from now + 30 minutes
        }
      ];

      for (const eventData of testEvents) {
        const newEvent = await eventsAPI.createEvent(eventData);
        setEvents(prev => [...prev, newEvent]);
      }
      
      console.log('Test events created successfully!');
    } catch (error) {
      console.error('Failed to create test events:', error);
      setError('Failed to create test events');
    }
  };



  const handleStatusChange = async (eventId: number, status: Event['status']) => {
    try {
      console.log('Updating event status:', eventId, 'to', status);
      
      // Update the event status in the database
      const updatedEvent = await eventsAPI.updateEvent(eventId.toString(), { status: status });
      console.log('Updated event:', updatedEvent);
      
      setEvents(prev => prev.map(event =>
        event.id === eventId ? updatedEvent : event
      ));
    } catch (err: any) {
      setError('Failed to update event status');
      console.error('Error updating event status:', err);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventsAPI.deleteEvent(eventId.toString());
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err: any) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  const handleRequestSwap = (slot: Event) => {
    setSelectedSlot(slot);
    setIsSwapModalOpen(true);
  };

  const handleSubmitSwapRequest = async (mySlotId: number, theirSlotId: number) => {
    await swapsAPI.createSwapRequest({
      my_slot_id: mySlotId,
      their_slot_id: theirSlotId
    });
    // Refresh the swappable slots
    await loadSwappableSlots();
  };

  const groupedEvents = {
    busy: events.filter(e => e.status === 'BUSY'),
    swappable: events.filter(e => e.status === 'SWAPPABLE'),
    pending: events.filter(e => e.status === 'SWAP_PENDING'),
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              My Calendar
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your events and make them available for swapping
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createTestEvents}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-xl hover:scale-105"
            >
              ✨ Create Test Events
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105"
            >
              + Create Event
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <span className="text-8xl block animate-bounce">📅</span>
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No events yet</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Create your first event to get started with SlotSwapper and begin swapping time slots with others
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105 text-lg"
            >
              ✨ Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔒</span>
                Busy Events ({groupedEvents.busy.length})
              </h2>
              <div className="space-y-4">
                {groupedEvents.busy.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteEvent}
                  />
                ))}
                {groupedEvents.busy.length === 0 && (
                  <p className="text-gray-500 text-sm">No busy events</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔄</span>
                Swappable Events ({groupedEvents.swappable.length})
              </h2>
              <div className="space-y-4">
                {groupedEvents.swappable.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteEvent}
                  />
                ))}
                {groupedEvents.swappable.length === 0 && (
                  <p className="text-gray-500 text-sm">No swappable events</p>
                )}
              </div>
            </div>

          </div>
        )}

        {groupedEvents.pending.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⏳</span>
              Pending Swaps ({groupedEvents.pending.length})
            </h2>
            <div className="space-y-4">
              {groupedEvents.pending.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  showActions={false}
                />
              ))}
            </div>
          </div>
        )}

        {swappableSlots.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Available Swaps</h2>
              <button
                onClick={loadSwappableSlots}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                🔄 Refresh
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {swappableSlots.map(slot => (
                <EventCard
                  key={slot.id}
                  event={slot}
                  showActions={false}
                  actionButton={
                    <button
                      onClick={() => handleRequestSwap(slot)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Request Swap
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        )}

        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEvent}
        />

        <SwapRequestModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          targetEvent={selectedSlot}
          onSubmit={handleSubmitSwapRequest}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;