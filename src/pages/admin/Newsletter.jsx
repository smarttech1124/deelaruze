import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    api.get('/newsletter').then(res => setSubscribers(res.data.data));
  }, []);

  const exportEmails = () => {
    navigator.clipboard.writeText(
      subscribers.map(s => s.email).join('\n')
    );
    alert('Emails copied');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">

        <header>
          <h1 className="text-5xl font-black">NEWSLETTER</h1>
          <p className="text-gray-500 mt-2">
            {subscribers.length} active subscribers
          </p>
        </header>

        <div className="admin-panel flex justify-between items-center">
          <span className="font-bold">EMAIL LIST</span>
          <button onClick={exportEmails} className="admin-button-outline">
            EXPORT
          </button>
        </div>

        <div className="admin-panel space-y-3 max-h-[60vh] overflow-y-auto">
          {subscribers.map(s => (
            <div
              key={s._id}
              className="border-b border-gray-800 py-2 font-mono text-sm"
            >
              {s.email}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
