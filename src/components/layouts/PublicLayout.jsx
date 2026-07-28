
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '../common/Navigation';
import Footer from '../common/Footer';
import FloatingCartOverlay from '../common/FloatingCartOverlay';
// import AnnouncementBar from '../common/AnnouncementBar';

const PublicLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* {isHome && <AnnouncementBar />} */}
      <Navigation bannerVisible={isHome} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingCartOverlay />
    </div>
  );
};

export default PublicLayout;
