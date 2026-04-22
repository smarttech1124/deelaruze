import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StripeAdmin = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/orders/stripe/sessions', {
          params: { limit: 20 },
        });
        setSessions(response.data.data || []);
        console.log('Fetched Stripe sessions:', response.data.data);
      } catch (err) {
        console.error('Error fetching Stripe sessions:', err);
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const openModal = (session) => {
    setSelectedSession(session);
  };

  const closeModal = () => {
    setSelectedSession(null);
  };

  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        Loading sessions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-black text-red-500 min-h-screen">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Stripe Sessions</h1>

      {sessions.length === 0 ? (
        <p className="text-gray-400">No Stripe sessions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700 bg-gray-900">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="py-2 px-4 border-b border-gray-700">Session ID</th>
                <th className="py-2 px-4 border-b border-gray-700">Email</th>
                <th className="py-2 px-4 border-b border-gray-700">Amount</th>
                <th className="py-2 px-4 border-b border-gray-700">Status</th>
                <th className="py-2 px-4 border-b border-gray-700">Created</th>
                <th className="py-2 px-4 border-b border-gray-700">Action</th>
              </tr>
            </thead>

            <tbody>
              {sessions.map((session) => {
                const amount = session.amount_total
                  ? `$${(session.amount_total / 100).toFixed(2)}`
                  : 'N/A';

                const createdAt = session.created
                  ? new Date(session.created * 1000).toLocaleString()
                  : 'N/A';

                return (
                  <tr key={session.id} className="hover:bg-gray-800">
                    <td className="py-2 px-4 border-b border-gray-800 text-xs">
                      {session.id}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-800">
                      {session.customer_details?.email || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-800">
                      {amount}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-800">
                      {session.payment_status || session.status}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-800">
                      {createdAt}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-800">
                      <button
                        onClick={() => openModal(session)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white w-full max-w-2xl p-6 rounded-lg shadow-lg relative">

            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Session Details</h2>

            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Session ID:</span> {selectedSession.id}</p>
              <p><span className="text-gray-400">Email:</span> {selectedSession.customer_email || 'N/A'}</p>
              <p><span className="text-gray-400">Amount:</span> ${(selectedSession.amount_total / 100).toFixed(2)}</p>
              <p><span className="text-gray-400">Status:</span> {selectedSession.payment_status}</p>
              <p><span className="text-gray-400">Currency:</span> {selectedSession.currency}</p>
              <p><span className="text-gray-400">Created:</span> {new Date(selectedSession.created * 1000).toLocaleString()}</p>
            </div>

            <pre className="mt-4 bg-black p-3 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(selectedSession, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default StripeAdmin;