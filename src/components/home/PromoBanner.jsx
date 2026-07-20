import { Link } from 'react-router-dom';

const PromoBanner = () => {
  return (
    <section className="relative bg-red-600 py-8 md:py-10 px-4 md:px-8 overflow-hidden animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <p className="text-xs md:text-sm font-bold tracking-widest text-white/80 mb-1">
            7 DAYS PROMOTION
          </p>
          <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase leading-tight">
            50% Off TAOS Volume 5
          </h3>
        </div>

        <Link
          to="/shop"
          className="shrink-0 px-8 py-4 bg-white text-black font-bold text-sm tracking-wider hover:bg-black hover:text-white transition-colors"
        >
          SHOP NOW
        </Link>
      </div>
    </section>
  );
};

export default PromoBanner;
