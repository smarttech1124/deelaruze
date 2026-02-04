import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Mail, 
  ShoppingCart, 
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    publications: 0,
    submissions: 0,
    orders: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [publications, submissions, orders, contacts] = await Promise.all([
        api.get('/publications'),
        api.get('/submissions'),
        api.get('/orders'),
        api.get('/contact'),
      ]);

      setStats({
        publications: publications.data.count || 0,
        submissions: submissions.data.data?.filter(s => s.status === 'pending').length || 0,
        orders: orders.data.data?.filter(o => o.status === 'pending').length || 0,
        messages: contacts.data.data?.filter(c => c.status === 'unread').length || 0,
      });

      // Get recent activity
      const activity = [
        ...submissions.data.data?.slice(0, 3).map(s => ({
          type: 'submission',
          text: `New submission from ${s.artistName}`,
          time: s.createdAt,
        })) || [],
        ...orders.data.data?.slice(0, 3).map(o => ({
          type: 'order',
          text: `New order ${o.orderNumber}`,
          time: o.createdAt,
        })) || [],
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-gray-900 p-6 border-l-4 cursor-pointer hover:bg-gray-800 transition-colors ${color}`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon size={32} />
        <span className="text-3xl font-black">{value}</span>
      </div>
      <h3 className="text-sm font-bold text-gray-400">{title}</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">ADMIN DASHBOARD</h1>
          <p className="text-gray-400">Welcome back, manage your platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            title="PUBLICATIONS"
            value={stats.publications}
            color="border-blue-500"
            onClick={() => navigate('/admin/publications')}
          />
          <StatCard
            icon={Upload}
            title="PENDING SUBMISSIONS"
            value={stats.submissions}
            color="border-yellow-500"
            onClick={() => navigate('/admin/submissions')}
          />
          <StatCard
            icon={ShoppingCart}
            title="PENDING ORDERS"
            value={stats.orders}
            color="border-green-500"
            onClick={() => navigate('/admin/orders')}
          />
          <StatCard
            icon={Mail}
            title="UNREAD MESSAGES"
            value={stats.messages}
            color="border-red-500"
            onClick={() => navigate('/admin/messages')}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 p-6">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <TrendingUp size={24} />
              QUICK ACTIONS
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/publications/new')}
                className="w-full px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors text-left"
              >
                + Create New Publication
              </button>
              <button
                onClick={() => navigate('/admin/submissions')}
                className="w-full px-6 py-3 border-2 border-white font-bold hover:bg-white hover:text-black transition-colors text-left"
              >
                Review Submissions
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="w-full px-6 py-3 border-2 border-white font-bold hover:bg-white hover:text-black transition-colors text-left"
              >
                Process Orders
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900 p-6">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <AlertCircle size={24} />
              RECENT ACTIVITY
            </h2>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="border-l-2 border-gray-700 pl-4 py-2">
                    <p className="text-sm font-bold">{activity.text}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Newsletter Stats */}
        <div className="bg-gray-900 p-6">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <Users size={24} />
            COMMUNITY
          </h2>
          <button
            onClick={() => navigate('/admin/newsletter')}
            className="px-6 py-3 border-2 border-white font-bold hover:bg-white hover:text-black transition-colors"
          >
            Manage Newsletter Subscribers
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;