import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const FloatingCartOverlay = () => {
  const { cartCount } = useCart();
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(false);
  const [hideForFooter, setHideForFooter] = useState(false);

  /* ---------------- Hide on Cart Page ---------------- */
  const isCartPage = location.pathname === '/cart';

  /* ---------------- Show when cart has items ---------------- */
  useEffect(() => {
    setIsVisible(cartCount > 0);
  }, [cartCount]);

  /* ---------------- Hide when footer is visible ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      setHideForFooter(footerRect.top < windowHeight);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ---------------- Final Visibility Check ---------------- */
  if (!isVisible || hideForFooter || isCartPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] animate-slideUpFade">
      <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        <Link
          to="/cart"
          className="flex items-center gap-4 px-6 py-4"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md">
            <ShoppingBag size={22} className="text-white" />
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-gray-300">
              Ready to Checkout
            </span>
            <span className="text-white font-semibold">
              {cartCount} item{cartCount > 1 ? 's' : ''} in cart
            </span>
          </div>

          <ArrowRight
            size={20}
            className="text-white transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>

        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </div>
  );
};

export default FloatingCartOverlay;
