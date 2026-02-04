
import { Outlet } from 'react-router-dom';
import Navigation from '../common/Navigation';
import Footer from '../common/Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
