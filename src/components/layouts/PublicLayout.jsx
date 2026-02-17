
import { Outlet } from 'react-router-dom';
import Navigation from '../common/Navigation';
import Footer from '../common/Footer';
import FloatingCartOverlay from '../common/FloatingCartOverlay';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingCartOverlay />
    </div>
  );
};

export default PublicLayout;
