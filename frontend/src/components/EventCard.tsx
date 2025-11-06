import React from 'react';
import { format } from 'date-fns';
import type { Event } from '../types';

interface EventCardProps {
  event: Event;
  onStatusChange?: (eventId: number, status: Event['status']) => void;
  onDelete?: (eventId: number) => void;
  showActions?: boolean;
  actionButton?: React.ReactNode;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onStatusChange, 
  onDelete, 
  showActions = true,
  actionButton 
}) => {
  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'BUSY':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'SWAPPABLE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SWAP_PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'BUSY':
        return '🔒';
      case 'SWAPPABLE':
        return '🔄';
      case 'SWAP_PENDING':
        return '⏳';
      default:
        return '📅';
    }
  };

  const formatDateTime = (dateTime: string) => {
    try {
      if (!dateTime) return 'Invalid date';
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM dd, yyyy - h:mm a');
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateTime);
      return 'Invalid date';
    }
  };

  return (
    <div className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:bg-white/80">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{getStatusIcon(event.status)}</span>
              <div className="absolute inset-0 bg-current opacity-20 rounded-full blur-lg"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              {event.title}
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-blue-500">📅</span>
              <span className="font-medium">{formatDateTime(event.startTime)}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-indigo-500">🕐</span>
              <span className="font-medium">{formatDateTime(event.endTime)}</span>
            </div>
            {event.owner && (
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="text-purple-500">👤</span>
                <span className="font-medium">{event.owner.Name}</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(event.status)}`}>
              <span className="mr-2">{getStatusIcon(event.status)}</span>
              {event.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-3 ml-6">
          {actionButton}
          
          {showActions && onStatusChange && (
            <div className="flex flex-col space-y-2">
              {event.status === 'BUSY' && (
                <button
                  onClick={() => onStatusChange(event.id, 'SWAPPABLE')}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-xl hover:scale-105 font-medium"
                >
                  ✨ Make Swappable
                </button>
              )}
              {event.status === 'SWAPPABLE' && (
                <button
                  onClick={() => onStatusChange(event.id, 'BUSY')}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-xl hover:from-gray-600 hover:to-slate-600 transition-all duration-200 shadow-lg shadow-gray-500/25 hover:shadow-xl hover:scale-105 font-medium"
                >
                  🔒 Make Busy
                </button>
              )}
            </div>
          )}

          {showActions && onDelete && event.status !== 'SWAP_PENDING' && (
            <button
              onClick={() => onDelete(event.id)}
              className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-xl hover:scale-105 font-medium"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;