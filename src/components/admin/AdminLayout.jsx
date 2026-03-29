import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet  } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  BookA,
  ShoppingCart, 
  Mail, 
  Users,
  SquareUserRound,
  LogOut,
  Menu,
  X,
  Image
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/publications', icon: FileText, label: 'Publications' },
    // { path: '/admin/submissions', icon: Upload, label: 'Submissions' },
    { path: '/admin/about', icon: BookA, label: 'About Deelaruze' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/messages', icon: Mail, label: 'Messages' },
    { path: '/admin/fromthestreet', icon: Image, label: 'From The Street' },
    { path: '/admin/newsletter', icon: Users, label: 'Newsletter' },
    { path: '/admin/profile', icon: SquareUserRound, label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'block md:hidden' : 'hidden md:block'} w-64 bg-gray-900 border-r border-gray-800 ${mobile ? 'fixed inset-0 z-50' : 'fixed top-0 left-0 h-screen'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-black">
              DEELARUZE
            </Link>
            {mobile && (
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => mobile && setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                    isActive(item.path)
                      ? 'bg-white text-black font-bold'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-gray-800 rounded transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {sidebarOpen && <Sidebar mobile={true} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Header */}
        <div className="md:hidden bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between sticky top-0 z-40">
          <Link to="/" className="text-xl font-black">
            DEELARUZE
          </Link>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>

        {/* Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;