import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/shop/CartItem';
import Button from '../components/common/Button';
import { orderService } from '../services/orderService';
import { ShoppingCart, ShoppingBag, Lock, Truck, Heart, ArrowRight, Trash2, Package } from 'lucide-react';

const Cart = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await orderService.createCheckoutSession(cart);
      window.location.href = response.url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to proceed to checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Lock, text: 'Secure checkout powered by Stripe' },
    { icon: Truck, text: 'Free shipping on orders over $75' },
    { icon: Heart, text: 'All sales support independent artists' },
  ];

  if (cart.length === 0) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap');

          .cart-container {
            font-family: 'Space Mono', monospace;
          }

          .cart-title {
            font-family: 'Archivo Black', sans-serif;
            letter-spacing: -0.02em;
          }

          .grid-bg {
            background-image: 
              linear-gradient(rgba(255, 51, 102, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 51, 102, 0.02) 1px, transparent 1px);
            background-size: 50px 50px;
            opacity: 0.5;
          }

          .empty-state {
            background: linear-gradient(135deg, rgba(255, 51, 102, 0.05), rgba(0, 255, 148, 0.05));
            border: 2px solid;
            border-image: linear-gradient(135deg, #FF3366, #00FF94) 1;
            clip-path: polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px));
          }

          .icon-float {
            animation: iconFloat 3s ease-in-out infinite;
          }

          @keyframes iconFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .cta-button {
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
          }

          .cta-button:hover::before {
            left: 100%;
          }

          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          }
        `}</style>

        <div className="fixed inset-0 grid-bg" />
        <div 
          className="fixed inset-0 opacity-3"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
            pointerEvents: 'none'
          }}
        />

        <div className="cart-container relative z-10 min-h-screen pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="cart-title text-6xl md:text-8xl text-white mb-12 tracking-tight">
              YOUR CART
            </h1>
            <div className="empty-state p-12">
              <ShoppingCart className="icon-float w-20 h-20 mx-auto mb-6 text-red-500" />
              <p className="text-2xl md:text-3xl text-white font-bold mb-3">
                Your cart is empty
              </p>
              <p className="text-gray-400 mb-8">
                Start adding some street art to your collection
              </p>
              <Link to="/shop">
                <button className="cta-button inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold text-lg tracking-wider">
                  CONTINUE SHOPPING
                  <ArrowRight size={24} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap');

        .cart-container {
          font-family: 'Space Mono', monospace;
        }

        .cart-title {
          font-family: 'Archivo Black', sans-serif;
          letter-spacing: -0.02em;
        }

        .hero-fade {
          animation: heroFadeIn 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }

        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .content-reveal {
          animation: contentSlideIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }

        @keyframes contentSlideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .summary-card {
          background: rgba(20, 20, 20, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 100px;
        }

        .summary-row {
          transition: all 0.3s;
        }

        .summary-row:hover {
          transform: translateX(4px);
        }

        .checkout-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(135deg, #FF3366, #FFB800);
        }

        .checkout-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .checkout-button:hover::before {
          left: 100%;
        }

        .checkout-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255, 51, 102, 0.4);
        }

        .checkout-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-left: 3px solid;
          transition: all 0.3s;
        }

        .benefit-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }

        .grid-bg {
          background-image: 
            linear-gradient(rgba(255, 51, 102, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 51, 102, 0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.5;
        }

        .section-badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(255, 51, 102, 0.1);
          border: 2px solid #FF3366;
          color: #FF3366;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 0.2em;
          margin-bottom: 24px;
          clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
        }

        .clear-cart-btn {
          transition: all 0.3s;
        }

        .clear-cart-btn:hover {
          color: #FF3366;
          transform: translateX(4px);
        }

        .continue-shopping-btn {
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s;
        }

        .continue-shopping-btn:hover {
          border-color: #00FF94;
          background: rgba(0, 255, 148, 0.05);
          transform: translateY(-2px);
        }

        .total-amount {
          font-family: 'Archivo Black', sans-serif;
          background: linear-gradient(135deg, #FF3366 0%, #FFB800 50%, #00FF94 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .icon-float {
          animation: iconFloat 3s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      {/* Background Elements */}
      <div className="fixed inset-0 grid-bg" />
      <div 
        className="fixed inset-0 opacity-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }}
      />

      {/* Gradient Accents */}
      <div 
        className="fixed top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #FF3366 0%, transparent 70%)' }}
      />

      <div className="cart-container relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="section-badge hero-fade">
              CHECKOUT
            </div>

            <div className="hero-fade" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-6 mb-4">
                <ShoppingBag className="icon-float w-12 h-12 md:w-16 md:h-16 text-red-500" />
                <h1 className="cart-title text-6xl md:text-8xl text-white tracking-tight">
                  YOUR CART
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-green-500" />
                <span className="text-gray-500 text-sm tracking-widest">
                  {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <div
                  key={item._id}
                  className="content-reveal"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <CartItem item={item} />
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div 
                className="summary-card content-reveal p-8"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-yellow-500" />
                  <h2 className="cart-title text-2xl text-white">
                    ORDER SUMMARY
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="summary-row flex justify-between text-gray-400">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className="text-sm">Calculated at checkout</span>
                  </div>
                  
                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg font-bold">Total</span>
                    <span className="total-amount text-3xl">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="checkout-button w-full py-5 text-white font-bold text-lg tracking-wider mb-4 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      PROCEED TO CHECKOUT
                    </>
                  )}
                </button>

                <button
                  onClick={clearCart}
                  className="clear-cart-btn w-full py-3 text-sm text-gray-400 hover:text-white flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>

                <Link to="/shop">
                  <button className="continue-shopping-btn w-full mt-3 py-4 text-sm text-white font-bold tracking-wider flex items-center justify-center gap-2">
                    <ShoppingCart size={18} />
                    CONTINUE SHOPPING
                  </button>
                </Link>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="text-xs text-gray-500 mb-4 tracking-wider">
                    WHY SHOP WITH US
                  </div>
                  <div className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="benefit-item"
                        style={{ borderLeftColor: index === 0 ? '#FF3366' : index === 1 ? '#FFB800' : '#00FF94' }}
                      >
                        <benefit.icon size={16} className="flex-shrink-0" style={{ color: index === 0 ? '#FF3366' : index === 1 ? '#FFB800' : '#00FF94' }} />
                        <span className="text-xs text-gray-400 leading-relaxed">
                          {benefit.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;