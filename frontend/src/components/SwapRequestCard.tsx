import React from 'react';
import { format } from 'date-fns';
import type { SwapRequest } from '../types';

interface SwapRequestCardProps {
  swapRequest: SwapRequest;
  type: 'incoming' | 'outgoing';
  onRespond?: (requestId: number, accept: boolean) => void;
}

const SwapRequestCard: React.FC<SwapRequestCardProps> = ({ 
  swapRequest, 
  type, 
  onRespond 
}) => {
  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), 'MMM dd, yyyy - h:mm a');
  };

  const getStatusColor = (status: SwapRequest['Status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: SwapRequest['Status']) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'ACCEPTED':
        return '✅';
      case 'REJECTED':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon(swapRequest.Status)}</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(swapRequest.Status)}`}>
            {swapRequest.Status}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {format(new Date(swapRequest.CreatedAt), 'MMM dd, yyyy')}
        </span>
      </div>

      <div className="space-y-4">
        {type === 'incoming' ? (
          <>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                👤 {swapRequest.Requester?.Name} wants to swap:
              </h4>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="font-medium text-blue-900">{swapRequest.RequesterEvent?.title}</p>
                <p className="text-sm text-blue-700">
                  📅 {swapRequest.RequesterEvent && formatDateTime(swapRequest.RequesterEvent.startTime)}
                </p>
                <p className="text-sm text-blue-700">
                  🕐 {swapRequest.RequesterEvent && formatDateTime(swapRequest.RequesterEvent.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">For your event:</h4>
              <div className="bg-green-50 p-3 rounded-md">
                <p className="font-medium text-green-900">{swapRequest.ResponderEvent?.title}</p>
                <p className="text-sm text-green-700">
                  📅 {swapRequest.ResponderEvent && formatDateTime(swapRequest.ResponderEvent.startTime)}
                </p>
                <p className="text-sm text-green-700">
                  🕐 {swapRequest.ResponderEvent && formatDateTime(swapRequest.ResponderEvent.endTime)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">You offered:</h4>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="font-medium text-blue-900">{swapRequest.RequesterEvent?.title}</p>
                <p className="text-sm text-blue-700">
                  📅 {swapRequest.RequesterEvent && formatDateTime(swapRequest.RequesterEvent.startTime)}
                </p>
                <p className="text-sm text-blue-700">
                  🕐 {swapRequest.RequesterEvent && formatDateTime(swapRequest.RequesterEvent.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                For {swapRequest.Responder?.Name}'s event:
              </h4>
              <div className="bg-green-50 p-3 rounded-md">
                <p className="font-medium text-green-900">{swapRequest.ResponderEvent?.title}</p>
                <p className="text-sm text-green-700">
                  📅 {swapRequest.ResponderEvent && formatDateTime(swapRequest.ResponderEvent.startTime)}
                </p>
                <p className="text-sm text-green-700">
                  🕐 {swapRequest.ResponderEvent && formatDateTime(swapRequest.ResponderEvent.endTime)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {type === 'incoming' && swapRequest.Status === 'PENDING' && onRespond && (
        <div className="flex space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={() => onRespond(swapRequest.ID, false)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            ❌ Reject
          </button>
          <button
            onClick={() => onRespond(swapRequest.ID, true)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            ✅ Accept
          </button>
        </div>
      )}
    </div>
  );
};

export default SwapRequestCard;