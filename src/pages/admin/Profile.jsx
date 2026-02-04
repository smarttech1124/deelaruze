import React, { useState } from 'react';
import api from '../../services/api';

const Profile = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const update = async e => {
    e.preventDefault();
    if (password !== confirm) return alert('Passwords do not match');

    setLoading(true);
    try {
      await api.put('/auth/update-password', { password });
      alert('Password updated');
      setPassword('');
      setConfirm('');
    } catch {
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">

        <header>
          <h1 className="text-5xl font-black">ACCOUNT</h1>
          <p className="text-gray-500 mt-2">
            Security & credentials
          </p>
        </header>

        <form onSubmit={update} className="admin-panel space-y-6">
          <div>
            <label className="admin-label">New Password</label>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="admin-label">Confirm Password</label>
            <input
              type="password"
              className="admin-input"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>

          <button className="admin-button-primary">
            {loading ? 'UPDATING…' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
