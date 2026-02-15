import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/shop/CartItem';
import { orderService } from '../services/orderService';
import {
  ShoppingCart,
  ShoppingBag,
  Lock,
  Truck,
  Heart,
  ArrowRight,
  Trash2,
  Package
} from 'lucide-react';

const shippingOptions = [
  { label: 'UK', value: 8 },
  { label: 'Europe', value: 8 },
  { label: 'North America', value: 11 },
  { label: 'South America', value: 11 },
  { label: 'Rest of the World', value: 13 },
];

const Cart = () => {
  const { cart, cartTotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [shippingfee, setShippingFee] = useState(8);

  const grandTotal = useMemo(() => {
    return cartTotal + shippingfee;
  }, [cartTotal, shippingfee]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await orderService.createCheckoutSession({
        items: cart,
        shippingfee,
        total: grandTotal,
      });

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
        <div className="fixed inset-0 grid-bg" />
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
      <div className="fixed inset-0 grid-bg" />

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

                  {/* Subtotal */}
                  <div className="summary-row flex justify-between text-gray-400">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                  </div>

                  {/* Shipping Selector (UI preserved style) */}
                  <div className="summary-row flex justify-between items-center text-gray-400">
                    <span>Shipping</span>
                    <select
                      value={shippingfee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                      className="bg-black border border-white/20 text-white px-3 py-1 text-sm"
                    >
                      {shippingOptions.map(option => (
                        <option key={option.label} value={option.value}>
                          {option.label} (${option.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  {/* Grand Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg font-bold">Total</span>
                    <span className="total-amount text-3xl">
                      ${grandTotal.toFixed(2)}
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
                        style={{
                          borderLeftColor:
                            index === 0
                              ? '#FF3366'
                              : index === 1
                              ? '#FFB800'
                              : '#00FF94',
                        }}
                      >
                        <benefit.icon
                          size={16}
                          className="flex-shrink-0"
                          style={{
                            color:
                              index === 0
                                ? '#FF3366'
                                : index === 1
                                ? '#FFB800'
                                : '#00FF94',
                          }}
                        />
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
