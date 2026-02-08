import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { submissionService } from '../../services/submissionService';

const SubmissionForm = () => {
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    instagram: '',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('artistName', formData.artistName);
      data.append('email', formData.email);
      data.append('instagram', formData.instagram);
      data.append('description', formData.description);

      files.forEach((file) => {
        data.append('images', file);
      });

      await submissionService.create(data);
      
      setSuccess(true);
      setFormData({
        artistName: '',
        email: '',
        instagram: '',
        description: '',
      });
      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gray-900 p-8 text-center">
        <h3 className="text-2xl font-black mb-4">SUBMISSION RECEIVED!</h3>
        <p className="text-gray-300 mb-6">
          We'll review your work and get back to you soon.
        </p>
        <Button onClick={() => setSuccess(false)}>
          Submit Another
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
        label="YOUR NAME / ARTIST NAME"
        name="artistName"
        value={formData.artistName}
        onChange={handleChange}
        placeholder="What should we call you?"
        required
        disabled
      />

      <Input
        label="EMAIL"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="your@email.com"
        required
        disabled
      />

      <Input
        label="INSTAGRAM (OPTIONAL)"
        name="instagram"
        value={formData.instagram}
        onChange={handleChange}
        placeholder="@yourhandle"
        disabled
      />

      <Input
        label="TELL US ABOUT YOUR WORK"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        placeholder="What drives your creativity? Where do you create? What's your story?"
        rows={6}
        required
        disabled
      />

      <div>
        <label className="block text-sm font-bold mb-2">
          PORTFOLIO / WORK SAMPLES
        </label>
        <label className="border-2 border-dashed border-gray-700 p-12 text-center hover:border-gray-500 transition-colors cursor-pointer block">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled
          />
          <Upload size={48} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">
            {files.length > 0
              ? `${files.length} file(s) selected`
              : 'Click to upload images or drag and drop'}
          </p>
          <p className="text-sm text-gray-600 mt-2">PNG, JPG up to 10MB each</p>
        </label>
      </div>

      <Button
        onClick={handleSubmit}
        loading={loading}
        fullWidth
        size="lg"
        disabled
      >
        SUBMIT YOUR WORK
      </Button>

      <p className="text-sm text-gray-500 text-center">
        We review every submission. If your work fits our vision, we'll be in touch.
      </p>
    </div>
  );
};

export default SubmissionForm;