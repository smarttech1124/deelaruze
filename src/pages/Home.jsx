import HeroSection from '../components/home/Hero';
import Manifesto from '../components/home/Manifesto';
import FeaturedPublication from '../components/home/FeaturedPublications';
// import PromoBanner from '../components/home/PromoBanner';
// import FromTheStreetSection from '../components/home/FromTheStreet';


const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Publications */}
      <FeaturedPublication />

      {/* Promo Banner */}
      {/* <PromoBanner /> */}

      {/* Manifesto Section */}
      <Manifesto />

      {/* From the Street Feed */}
      {/* <FromTheStreetSection /> */}
    </div>
  );
};

export default Home;