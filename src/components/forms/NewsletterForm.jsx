import React, { useState } from 'react';
import Button from '../common/Button';
import { newsletterService } from '../../services/newsletterService';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await newsletterService.subscribe(email);
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-black mb-4">NEWSLETTER</h2>
      <p className="text-gray-300 mb-4">
        Get notified about new drops, artist features, and underground happenings.
      </p>
      
      {success && (
        <div className="bg-green-600/20 border border-green-600 p-4 text-green-600 mb-4">
          Successfully subscribed!
        </div>
      )}
      
      {error && (
        <div className="bg-red-600/20 border border-red-600 p-4 text-red-600 mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-gray-900 border border-gray-700 px-4 py-3 focus:outline-none focus:border-white transition-colors"
          required
        />
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!email}
        >
          SUBSCRIBE
        </Button>
      </div>
    </div>
  );
};

export default NewsletterForm;