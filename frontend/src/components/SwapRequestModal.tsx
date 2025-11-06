import React, { useState, useEffect } from 'react';
import type { Event } from '../types';
import { eventsAPI } from '../services/api';
import EventCard from './EventCard';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEvent: Event | null;
  onSubmit: (mySlotId: number, theirSlotId: number) => Promise<void>;
}

const SwapRequestModal: React.FC<SwapRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  targetEvent, 
  onSubmit 
}) => {
  const [mySwappableEvents, setMySwappableEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMyEvents();
    }
  }, [isOpen]);

  const loadMyEvents = async () => {
    try {
      setIsLoading(true);
      const events = await eventsAPI.getMyEvents();
      // Filter to only show SWAPPABLE events for swap requests
      const swappableEvents = events.filter(event => event.status === 'SWAPPABLE');
      setMySwappableEvents(swappableEvents);
    } catch (err) {
      setError('Failed to load your events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEventId || !targetEvent) {
      setError('Please select one of your events to swap');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(selectedEventId, targetEvent.id);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create swap request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedEventId(null);
    setError('');
    onClose();
  };

  if (!isOpen || !targetEvent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Request Swap</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">You want to swap for:</h3>
          <EventCard event={targetEvent} showActions={false} />
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select one of your swappable events to offer:
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : mySwappableEvents.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">😔</span>
                <p className="text-gray-600">
                  You don't have any swappable events.
                  Go to your dashboard and mark some events as swappable first.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {mySwappableEvents.map(event => (
                  <label
                    key={event.id}
                    className={`block cursor-pointer rounded-lg border-2 p-3 transition-colors ${
                      selectedEventId === event.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedEvent"
                      value={event.id}
                      checked={selectedEventId === event.id}
                      onChange={(e) => setSelectedEventId(Number(e.target.value))}
                      className="sr-only"
                    />
                    <EventCard event={event} showActions={false} />
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedEventId || mySwappableEvents.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Requesting...' : 'Request Swap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapRequestModal;