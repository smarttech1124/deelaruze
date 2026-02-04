import React, { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, X } from 'lucide-react';
import { contactService } from '../../services/contactService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unread');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    loadMessages();
  }, [filter]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await contactService.getAll(params);
      setMessages(data.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await contactService.markAsRead(id);
      await loadMessages();
      if (selectedMessage?._id === id) {
        setSelectedMessage({ ...selectedMessage, status: 'read' });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await contactService.delete(id);
      setMessages(messages.filter(m => m._id !== id));
      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      unread: 'bg-yellow-600',
      read: 'bg-blue-600',
      replied: 'bg-green-600',
    };

    return (
      <span className={`px-3 py-1 text-xs font-bold ${colors[status]} rounded`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const MessageModal = ({ message, onClose }) => {
    // Mark as read when opened
    useEffect(() => {
      if (message.status === 'unread') {
        handleMarkAsRead(message._id);
      }
    }, [message._id]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"> 
        <div className="bg-gray-900 max-w-3xl w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-black">MESSAGE</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-800">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Sender Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black">{message.name}</h3>
                  <p className="text-gray-400">{message.email}</p>
                </div>
                <StatusBadge status={message.status} />
              </div>
              <p className="text-sm text-gray-500">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Message */}
            <div className="mb-6">
              <h3 className="text-xl font-black mb-4">MESSAGE</h3>
              <div className="bg-black p-4 border-l-4 border-white">
                <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <a
                href={`mailto:${message.email}?subject=Re: Your message to Deelaruze`}
                className="flex-1 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors text-center"
              >
                <Mail className="inline mr-2" size={20} />
                REPLY VIA EMAIL
              </a>
              <button
                onClick={() => handleDelete(message._id)}
                className="px-6 py-3 border border-red-600 hover:bg-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">MESSAGES</h1>
          <p className="text-gray-400">View and respond to contact form messages</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          {['unread', 'read', 'replied', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 font-bold transition-colors ${
                filter === f
                  ? 'bg-white text-black'
                  : 'border-2 border-gray-700 hover:border-white'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Messages List */}
        {loading ? (
          <Loader size="lg" />
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">No messages found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`bg-gray-900 p-6 hover:bg-gray-800 transition-colors cursor-pointer ${
                  msg.status === 'unread' ? 'border-l-4 border-yellow-500' : ''
                }`}
                onClick={() => setSelectedMessage(msg)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {msg.status === 'unread' ? (
                      <Mail size={20} className="text-yellow-500 mt-1" />
                    ) : (
                      <MailOpen size={20} className="text-gray-500 mt-1" />
                    )}
                    <div>
                      <h3 className="text-xl font-black">{msg.name}</h3>
                      <p className="text-gray-400">{msg.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={msg.status} />
                </div>

                <p className="text-gray-300 mb-3 line-clamp-2">{msg.message}</p>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    {msg.status === 'unread' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(msg._id);
                        }}
                        className="px-4 py-2 border border-gray-700 hover:border-white transition-colors text-sm"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(msg._id);
                      }}
                      className="px-4 py-2 border border-red-600 hover:bg-red-600 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedMessage && (
          <MessageModal
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Messages;