import HeroSection from '../components/home/Hero';
import Manifesto from '../components/home/Manifesto';
import FeaturedPublication from '../components/home/FeaturedPublications';
import InstagramFeed from '../components/home/InstagramFeed';


const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Manifesto Section */}
      <Manifesto />

      {/* Featured Publications */}
      <FeaturedPublication />

      {/* Instagram Feed Mockup */}
      <InstagramFeed />
    </div>
  );
};

export default Home;