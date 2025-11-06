import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import EventCard from '../components/EventCard';
import SwapRequestModal from '../components/SwapRequestModal';
import type { Event } from '../types';
import { swapsAPI } from '../services/api';

const Marketplace: React.FC = () => {
  const [swappableSlots, setSwappableSlots] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  useEffect(() => {
    loadSwappableSlots();
  }, []);

  const loadSwappableSlots = async () => {
    try {
      setIsLoading(true);
      const data = await swapsAPI.getSwappableSlots();
      setSwappableSlots(data || []);
    } catch (err: any) {
      setError('Failed to load swappable slots');
      console.error('Error loading swappable slots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSwap = (event: Event) => {
    setSelectedEvent(event);
    setIsSwapModalOpen(true);
  };

  const handleSubmitSwapRequest = async (mySlotId: number, theirSlotId: number) => {
    await swapsAPI.createSwapRequest({
      my_slot_id: mySlotId,
      their_slot_id: theirSlotId
    });
    // Refresh the marketplace to remove the slot that's now pending
    await loadSwappableSlots();
  };

  const debugSwappableSlots = async () => {
    console.log('=== Debugging Swappable Slots ===');
    try {
      console.log('Making API call to /swappable-slots...');
      const response = await swapsAPI.getSwappableSlots();
      console.log('Raw API response:', response);
      console.log('Number of swappable slots:', response.length);
      response.forEach((slot, index) => {
        console.log(`Slot ${index + 1}:`, {
          id: slot.id,
          title: slot.title,
          status: slot.status,
          owner: slot.owner
        });
      });
    } catch (error) {
      console.error('Debug failed:', error);
    }
    console.log('=== Debug Complete ===');
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 mt-1">
            Browse and request swaps for available time slots from other users
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {swappableSlots.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No swappable slots available</h3>
            <p className="text-gray-600 mb-4">
              There are currently no time slots available for swapping. Check back later!
            </p>
            <button
              onClick={loadSwappableSlots}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Found {swappableSlots.length} available slot{swappableSlots.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={loadSwappableSlots}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                🔄 Refresh
              </button>
              <button
                onClick={debugSwappableSlots}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium ml-2"
              >
                🐛 Debug
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {swappableSlots.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  showActions={false}
                  actionButton={
                    <button
                      onClick={() => handleRequestSwap(event)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Request Swap
                    </button>
                  }
                />
              ))}
            </div>
          </>
        )}

        <SwapRequestModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          targetEvent={selectedEvent}
          onSubmit={handleSubmitSwapRequest}
        />
      </div>
    </Layout>
  );
};

export default Marketplace;