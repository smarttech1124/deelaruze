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
  Package,
  Plus,
  Minus,
  Sticker,
  Sparkles,
} from 'lucide-react';

// ─── Shipping ────────────────────────────────────────────────────────────────
const shippingOptions = [
  { label: 'UK 48Tracked',                  value: 3.00  },
  { label: 'EUROPE Tracked',                value: 10.50  },
  { label: 'USA/CANADA/MEXICO Tracked',     value: 14.20 },
  { label: 'AUSTRALIA Tracked',             value: 15.70 },
  { label: 'JAPAN Tracked',                 value: 14.60 },
  { label: 'Rest of the World',             value: 16.00 },
];

const EXTRA_BOOK_SHIPPING = 2; // £2 per additional book beyond the first
const STICKER_PRICE       = 5; // £5 per sticker pack

// ─── Sticker Add-on Component ────────────────────────────────────────────────
const StickerAddon = ({ quantity, onChange }) => {
  return (
    <div className="sticker-addon-card mt-4 p-5 border border-dashed border-yellow-500/40 bg-yellow-500/5 rounded-sm">
      <div className="flex gap-4">

        {/* Sticker Image */}
        <div className="flex-shrink-0 w-20 h-20 border border-white/10 overflow-hidden bg-white/5">
          <img
            src="/images/stickers.jpeg"
            alt="Sticker pack"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info + Controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-white font-bold text-sm tracking-wider">ADD STICKER PACK</p>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed mb-3">
            Exclusive Deela stickers.
            £{STICKER_PRICE.toFixed(2)} per pack.
          </p>

          <div className="flex items-center justify-between">
            <span className="text-yellow-400 font-bold text-sm">
              {quantity === 0
                ? 'Not added'
                : `${quantity} pack${quantity > 1 ? 's' : ''} — £${(quantity * STICKER_PRICE).toFixed(2)}`}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onChange(Math.max(0, quantity - 1))}
                disabled={quantity === 0}
                className="sticker-qty-btn w-8 h-8 flex items-center justify-center border border-white/20 text-white disabled:opacity-30 hover:border-white/60 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-white font-bold text-sm">
                {quantity}
              </span>
              <button
                onClick={() => onChange(quantity + 1)}
                className="sticker-qty-btn w-8 h-8 flex items-center justify-center border border-yellow-500/60 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Cart Page ────────────────────────────────────────────────────────────────
const Cart = () => {
  const { cart, cartTotal, clearCart } = useCart();

  const [loading, setLoading]               = useState(false);
  const [shippingLocation, setShippingLocation] = useState('UK 48Tracked');
  const [stickerQty, setStickerQty]         = useState(0);

  // Total number of books across all cart items
  const totalQuantity = useMemo(
    () => cart.reduce((total, item) => total + (item.quantity || 1), 0),
    [cart]
  );

  // Shipping: base fee for first book, +£3 per additional book
  const shippingFee = useMemo(() => {
    const base = shippingOptions.find(o => o.label === shippingLocation)?.value ?? 0;
    if (totalQuantity <= 0) return 0;
    return base + (totalQuantity - 1) * EXTRA_BOOK_SHIPPING;
  }, [shippingLocation, totalQuantity]);

  const stickerTotal = stickerQty * STICKER_PRICE;

  const grandTotal = cartTotal + shippingFee + stickerTotal;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await orderService.createCheckoutSession({
        items: cart,
        shippingLocation,
        shippingFee,
        stickers: stickerQty > 0
          ? { quantity: stickerQty, unitPrice: STICKER_PRICE, total: stickerTotal }
          : null,
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
    { icon: Lock,  text: 'Secure checkout powered by Stripe',     color: '#FF3366' },
    { icon: Truck, text: 'Tracked shipping on all orders',        color: '#FFB800' },
    { icon: Heart, text: 'All sales support independent artists', color: '#00FF94' },
  ];

  // ─── Empty State ────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        <div className="fixed inset-0 grid-bg" />
        <div className="cart-container relative z-10 min-h-screen pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="cart-title text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
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

  // ─── Shipping fee breakdown label ───────────────────────────────────────
  const shippingBreakdown = totalQuantity === 1
    ? `Base rate`
    : `Base + £${EXTRA_BOOK_SHIPPING} × ${totalQuantity - 1} extra ${totalQuantity - 1 === 1 ? 'book' : 'books'}`;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="fixed inset-0 grid-bg" />

      <div className="cart-container relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Hero */}
          <div className="mb-16">
            {/* <div className="section-badge hero-fade">CHECKOUT</div> */}
            <div className="hero-fade" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-6 mb-4">
                <ShoppingBag className="icon-float w-12 h-12 md:w-16 md:h-16 text-red-500" />
                <h1 className="cart-title text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                  YOUR CART
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-green-500" />
                <span className="text-gray-500 text-sm tracking-widest">
                  {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'} •{' '}
                  {totalQuantity} {totalQuantity === 1 ? 'BOOK' : 'BOOKS'}
                  {stickerQty > 0 && ` • ${stickerQty} STICKER PACK${stickerQty > 1 ? 'S' : ''}`}
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

              {/* Sticker upsell — shown below cart items */}
              <div
                className="content-reveal"
                style={{ animationDelay: `${0.2 + cart.length * 0.1}s` }}
              >
                <StickerAddon quantity={stickerQty} onChange={setStickerQty} />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="summary-card content-reveal p-8"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-yellow-500" />
                  <h2 className="cart-title text-2xl text-white">ORDER SUMMARY</h2>
                </div>

                <div className="space-y-4 mb-6">

                  {/* Subtotal */}
                  <div className="summary-row flex justify-between text-gray-400">
                    <span>Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})</span>
                    <span className="font-bold">£{cartTotal.toFixed(2)}</span>
                  </div>

                  {/* Sticker line — only if added */}
                  {stickerQty > 0 && (
                    <div className="summary-row flex justify-between text-yellow-400">
                      <span>Sticker packs ×{stickerQty}</span>
                      <span className="font-bold">£{stickerTotal.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Shipping Location Selector */}
                  <div className="summary-row flex justify-between items-center text-gray-400">
                    <span>Ship to</span>
                    <select
                      value={shippingLocation}
                      onChange={(e) => setShippingLocation(e.target.value)}
                      className="bg-black border border-white/20 text-white px-3 py-1 text-sm"
                    >
                      {shippingOptions.map(option => (
                        <option key={option.label} value={option.label}>
                          {option.label} (£{option.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Shipping Fee */}
                  <div className="summary-row flex justify-between text-gray-400">
                    <div className="flex flex-col">
                      <span>Shipping</span>
                      <span className="text-xs text-gray-600 mt-0.5">{shippingBreakdown}</span>
                    </div>
                    <span className="font-bold self-start">£{shippingFee.toFixed(2)}</span>
                  </div>
                  {/* Notice */}
                  <div className="summary-row flex justify-between text-gray-400 text-md">
                    <b>PLEASE NOTE: BOOKS WILL BE SHIPPED WITHIN 2 WEEKS</b>
                  </div>

                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  {/* Grand Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg font-bold">Total</span>
                    <span className="total-amount text-3xl">£{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
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

                {/* Benefits */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="text-xs text-gray-500 mb-4 tracking-wider">WHY SHOP WITH US</div>
                  <div className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="benefit-item"
                        style={{ borderLeftColor: benefit.color }}
                      >
                        <benefit.icon size={16} className="flex-shrink-0" style={{ color: benefit.color }} />
                        <span className="text-xs text-gray-400 leading-relaxed">{benefit.text}</span>
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