import React, { useEffect, useState } from 'react';
import { Check, X, Eye, Mail } from 'lucide-react';
import { submissionService } from '../../services/submissionService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await submissionService.getAll(params);
      setSubmissions(data.data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, notes = '') => {
    try {
      await submissionService.updateStatus(id, status, notes);
      await loadSubmissions();
      setSelectedSubmission(null);
      alert(`Submission ${status}!`);
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Failed to update submission');
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-600',
      reviewing: 'bg-blue-600',
      approved: 'bg-green-600',
      rejected: 'bg-red-600',
    };

    return (
      <span className={`px-3 py-1 text-xs font-bold ${colors[status]} rounded`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const SubmissionModal = ({ submission, onClose }) => {
    const [notes, setNotes] = useState(submission.notes || '');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 max-w-4xl w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-black">SUBMISSION DETAILS</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-800">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Artist Info */}
            <div className="mb-6">
              <h3 className="text-xl font-black mb-4">ARTIST INFORMATION</h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>Name:</strong> {submission.artistName}</p>
                <p><strong>Email:</strong> {submission.email}</p>
                {submission.instagram && (
                  <p><strong>Instagram:</strong> {submission.instagram}</p>
                )}
                <p><strong>Status:</strong> <StatusBadge status={submission.status} /></p>
                <p><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xl font-black mb-4">DESCRIPTION</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{submission.description}</p>
            </div>

            {/* Images */}
            <div className="mb-6">
              <h3 className="text-xl font-black mb-4">PORTFOLIO ({submission.images?.length || 0} images)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {submission.images?.map((img, index) => (
                  <a
                    key={index}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square bg-gray-800 hover:opacity-75 transition-opacity"
                  >
                    <img
                      src={img.url}
                      alt={`Work ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="mb-6">
              <h3 className="text-xl font-black mb-4">ADMIN NOTES</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this submission..."
                rows={4}
                className="w-full bg-black border border-gray-700 px-4 py-3 focus:outline-none focus:border-white resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => handleUpdateStatus(submission._id, 'approved', notes)}
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                APPROVE
              </Button>
              <Button
                onClick={() => handleUpdateStatus(submission._id, 'rejected', notes)}
                variant="danger"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <X size={20} />
                REJECT
              </Button>
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
          <h1 className="text-4xl font-black mb-2">SUBMISSIONS</h1>
          <p className="text-gray-400">Review and manage artist submissions</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          {['pending', 'reviewing', 'approved', 'rejected', 'all'].map((f) => (
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

        {/* Submissions List */}
        {loading ? (
          <Loader size="lg" />
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">No submissions found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className="bg-gray-900 p-6 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black">{sub.artistName}</h3>
                    <p className="text-gray-400">{sub.email}</p>
                    {sub.instagram && (
                      <p className="text-sm text-gray-500">{sub.instagram}</p>
                    )}
                  </div>
                  <StatusBadge status={sub.status} />
                </div>

                <p className="text-gray-300 mb-4 line-clamp-2">
                  {sub.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span>{sub.images?.length || 0} images</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSubmission(sub)}
                      className="px-4 py-2 border border-white font-bold hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                    >
                      <Eye size={16} />
                      REVIEW
                    </button>
                    <a
                      href={`mailto:${sub.email}`}
                      className="px-4 py-2 border border-gray-700 hover:border-white transition-colors flex items-center gap-2"
                      title="Email artist"
                    >
                      <Mail size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedSubmission && (
          <SubmissionModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Submissions;