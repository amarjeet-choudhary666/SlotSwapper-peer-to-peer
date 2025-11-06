import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SwapRequestCard from '../components/SwapRequestCard';
import type { SwapRequest } from '../types';
import { swapsAPI } from '../services/api';

const SwapRequests: React.FC = () => {
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSwapRequests();
  }, []);

  const loadSwapRequests = async () => {
    try {
      setIsLoading(true);
      const data = await swapsAPI.getMySwapRequests();
      setIncomingRequests(data.incoming || []);
      setOutgoingRequests(data.outgoing || []);
    } catch (err: any) {
      setError('Failed to load swap requests');
      console.error('Error loading swap requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (requestId: number, accept: boolean) => {
    try {
      await swapsAPI.respondToSwapRequest(requestId.toString(), accept);
      // Reload requests to get updated status
      await loadSwapRequests();
    } catch (err: any) {
      setError(`Failed to ${accept ? 'accept' : 'reject'} swap request`);
      console.error('Error responding to swap request:', err);
    }
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

  const totalRequests = incomingRequests.length + outgoingRequests.length;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage incoming and outgoing swap requests
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {totalRequests === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📬</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No swap requests</h3>
            <p className="text-gray-600 mb-4">
              You don't have any swap requests yet. Visit the marketplace to request swaps!
            </p>
            <button
              onClick={loadSwapRequests}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Incoming Requests */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📥</span>
                  Incoming Requests ({incomingRequests.length})
                </h2>
                <button
                  onClick={loadSwapRequests}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  🔄 Refresh
                </button>
              </div>
              
              <div className="space-y-4">
                {incomingRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-md">
                    No incoming requests
                  </p>
                ) : (
                  incomingRequests.map(request => (
                    <SwapRequestCard
                      key={request.ID}
                      swapRequest={request}
                      type="incoming"
                      onRespond={handleRespond}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Outgoing Requests */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📤</span>
                Outgoing Requests ({outgoingRequests.length})
              </h2>
              
              <div className="space-y-4">
                {outgoingRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-md">
                    No outgoing requests
                  </p>
                ) : (
                  outgoingRequests.map(request => (
                    <SwapRequestCard
                      key={request.ID}
                      swapRequest={request}
                      type="outgoing"
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SwapRequests;