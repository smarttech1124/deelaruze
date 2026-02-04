import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { contactService } from '../../services/contactService';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await contactService.send(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gray-900 p-8 text-center">
        <h3 className="text-2xl font-black mb-4">MESSAGE SENT!</h3>
        <p className="text-gray-300 mb-6">
          We'll get back to you as soon as possible.
        </p>
        <Button onClick={() => setSuccess(false)}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-900 p-8">
      {error && (
        <div className="bg-red-600/20 border border-red-600 p-4 text-red-600">
          {error}
        </div>
      )}

      <Input
        label="NAME"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <Input
        label="EMAIL"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <Input
        label="MESSAGE"
        name="message"
        type="textarea"
        value={formData.message}
        onChange={handleChange}
        rows={6}
        required
      />

      <Button
        onClick={handleSubmit}
        loading={loading}
        fullWidth
        size="lg"
      >
        SEND MESSAGE
      </Button>
    </div>
  );
};

export default ContactForm;