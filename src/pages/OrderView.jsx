import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

/* ─── Keyframes & global styles injected once ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :root {
    --neon-pink:  #FF2D6B;
    --neon-green: #00FF94;
    --neon-blue:  #00D4FF;
    --purple:     #9B5DE5;
    --surface:    rgba(255,255,255,0.03);
    --border:     rgba(255,255,255,0.07);
    --border-hot: rgba(255,45,107,0.35);
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 18px rgba(255,45,107,0.25); }
    50%      { box-shadow: 0 0 36px rgba(255,45,107,0.55), 0 0 60px rgba(0,212,255,0.15); }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes tickerBadge {
    from { opacity: 0; transform: scale(0.85) rotate(-3deg); }
    to   { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  .ov-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transition: border-color 0.3s ease, transform 0.25s ease;
  }
  .ov-card:hover {
    border-color: rgba(255,255,255,0.13);
    transform: translateY(-2px);
  }

  .ov-animate {
    opacity: 0;
    animation: fadeSlideUp 0.55s cubic-bezier(.22,.68,0,1.2) forwards;
  }

  .ov-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 999px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    animation: tickerBadge 0.4s cubic-bezier(.34,1.56,.64,1) both;
  }
  .ov-status-badge::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: pulseGlow 2s infinite;
  }

  .ov-item-row {
    border-bottom: 1px solid var(--border);
    transition: background 0.2s;
  }
  .ov-item-row:last-child { border-bottom: none; }
  .ov-item-row:hover { background: rgba(255,255,255,0.04); }

  .ov-total-line {
    background: linear-gradient(90deg, rgba(255,45,107,0.12), rgba(0,212,255,0.08));
    border-radius: 10px;
    padding: 14px 18px;
    margin-top: 12px;
  }

  .ov-scan-line {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent);
    animation: scanline 8s linear infinite;
    pointer-events: none;
    z-index: 999;
  }

  .ov-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
    margin: 0;
  }

  .ov-mono { font-family: 'DM Mono', monospace; }
  .ov-display { font-family: 'Bebas Neue', sans-serif; }
  .ov-body { font-family: 'DM Sans', sans-serif; }

  .ov-stripe-id {
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    color: rgba(255,255,255,0.28);
    word-break: break-all;
    letter-spacing: 0.02em;
    transition: color 0.2s;
  }
  .ov-stripe-id:hover { color: rgba(255,255,255,0.55); }
`;

/* ─── Status colour mapping ─── */
const statusConfig = {
  pending:    { color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  processing: { color: '#00D4FF', bg: 'rgba(0,212,255,0.12)' },
  shipped:    { color: '#9B5DE5', bg: 'rgba(155,93,229,0.12)' },
  delivered:  { color: '#00FF94', bg: 'rgba(0,255,148,0.12)' },
  cancelled:  { color: '#FF2D6B', bg: 'rgba(255,45,107,0.12)' },
  completed:  { color: '#00FF94', bg: 'rgba(0,255,148,0.12)' },
};

const getStatusStyle = (status = '') => {
  const key = status.toLowerCase();
  return statusConfig[key] || { color: '#fff', bg: 'rgba(255,255,255,0.08)' };
};

/* ─── Reusable section card ─── */
const Card = ({ children, delay = 0, style = {}, className = '' }) => (
  <div
    className={`ov-card ov-animate ov-body ${className}`}
    style={{ animationDelay: `${delay}ms`, ...style }}
  >
    {children}
  </div>
);

/* ─── Section label ─── */
const SectionLabel = ({ children }) => (
  <p
    className="ov-mono"
    style={{
      fontSize: 10,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.35)',
      marginBottom: 14,
    }}
  >
    {children}
  </p>
);

/* ─── Main component ─── */
const OrderView = () => {
  const { orderId } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  /* ── States ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="ov-mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Fetching order<span style={{ animation: 'shimmer 1.2s infinite' }}>...</span>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p className="ov-mono" style={{ color: '#FF2D6B', fontSize: 13 }}>{error}</p>
    </div>
  );

  if (!order) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p className="ov-mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Order not found</p>
    </div>
  );

  const { color: statusColor, bg: statusBg } = getStatusStyle(order.status);
  const { color: payColor,    bg: payBg    } = getStatusStyle(order.paymentStatus);

  return (
    <>
      {/* Inject styles */}
      <style>{styles}</style>

      <div className="ov-body" style={{ position: 'relative', minHeight: '100vh', background: '#000', overflow: 'hidden', color: '#fff' }}>

        {/* ── Background layer: grid ── */}
        <div className="fixed inset-0 grid-bg" />

        {/* ── Noise overlay ── */}
        <div
          className="fixed inset-0"
          style={{
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        />

        {/* ── Gradient accents (original preserved) ── */}
        <div
          className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #FF3366 0%, transparent 70%)' }}
        />
        <div
          className="fixed bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #00FF94 0%, transparent 70%)' }}
        />

        {/* ── Subtle scanline ── */}
        <div className="ov-scan-line" />

        {/* ══════════ CONTENT ══════════ */}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '120px 20px 80px', position: 'relative', zIndex: 10 }}>

          {/* ── Header ── */}
          <div className="ov-animate" style={{ animationDelay: '0ms', marginBottom: 36 }}>
            {/* Eyebrow label */}
            <p
              className="ov-mono"
              style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}
            >
              Order Receipt
            </p>

            {/* Order number – big display type */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
              <h1
                className="ov-display"
                style={{
                  fontSize: 'clamp(52px, 10vw, 88px)',
                  lineHeight: 0.9,
                  letterSpacing: '0.02em',
                  background: 'linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.45))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                }}
              >
                #{order.orderNumber}
              </h1>

              {/* Status badges */}
              <div style={{ display: 'flex', gap: 8, paddingBottom: 6, flexWrap: 'wrap' }}>
                <div> <small>Delivery: </small>
                  <span
                    className="ov-status-badge"
                    style={{ color: statusColor, background: statusBg, animationDelay: '120ms' }}
                  >
                    {order.status}
                  </span>
                </div>
                <div> <small>Payment</small>
                  <span
                  className="ov-status-badge"
                  style={{ color: payColor, background: payBg, animationDelay: '200ms' }}
                >
                  {order.paymentStatus}
                </span>
                </div>
              </div>
            </div>

            {/* Date */}
            <p
              className="ov-mono"
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10, letterSpacing: '0.06em' }}
            >
              {new Date(order.createdAt).toLocaleString('en-US', {
                weekday: 'short', year: 'numeric', month: 'long',
                day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>

          {/* ── Divider ── */}
          <div className="ov-divider ov-animate" style={{ animationDelay: '80ms', marginBottom: 28 }} />

          {/* ── Two-column top row: Shipping + Summary ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Shipping Address */}
            <Card delay={150} style={{ padding: '24px 26px' }}>
              <SectionLabel>Ship to</SectionLabel>
              <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, color: '#fff' }}>
                {order.shippingAddress.name}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, lineHeight: 1.65 }}>
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 && <><br />{order.shippingAddress.line2}</>}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </Card>

            {/* Summary */}
            <Card delay={200} style={{ padding: '24px 26px' }}>
              <SectionLabel>Summary</SectionLabel>

              {[
                { label: 'Subtotal',  value: order.subtotal },
                { label: 'Shipping',  value: order.shippingCost },
                { label: 'Tax',       value: order.tax },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    paddingBottom: 8, borderBottom: '1px solid var(--border)',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{label}</span>
                  <span className="ov-mono" style={{ fontSize: 13 }}>${value.toFixed(2)}</span>
                </div>
              ))}

              {/* Total */}
              <div className="ov-total-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                  Total
                </span>
                <span
                  className="ov-mono"
                  style={{
                    fontSize: 22, fontWeight: 500,
                    background: 'linear-gradient(90deg, #FF2D6B, #00D4FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </Card>
          </div>

          {/* ── Items ── */}
          <Card delay={270} style={{ padding: '24px 26px', marginBottom: 16 }}>
            <SectionLabel>Items · {order.items.length}</SectionLabel>

            {order.items.map((item, idx) => (
              <div
                key={item._id.$oid}
                className="ov-item-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: 18,
                  padding: '14px 4px',
                  animationDelay: `${300 + idx * 60}ms`,
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: 72, height: 72,
                      objectFit: 'cover',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'block',
                    }}
                  />
                  {/* Qty badge */}
                  <span
                    className="ov-mono"
                    style={{
                      position: 'absolute', top: -7, right: -7,
                      background: '#FF2D6B',
                      color: '#fff',
                      fontSize: 10, fontWeight: 700,
                      width: 20, height: 20,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #000',
                    }}
                  >
                    {item.quantity}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 500, fontSize: 14.5,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </p>
                  <p className="ov-mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
                    ${item.price.toFixed(2)} ea.
                  </p>
                </div>

                {/* Line total */}
                <p className="ov-mono" style={{ fontSize: 14, fontWeight: 500, flexShrink: 0 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </Card>

          {/* ── Stripe Info ── */}
          <Card
            delay={350}
            style={{
              padding: '18px 26px',
              borderColor: 'rgba(255,255,255,0.04)',
              background: 'rgba(255,255,255,0.015)',
            }}
          >
            <SectionLabel>Payment Reference</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {[
                { label: 'Session',        value: order.stripeSessionId },
                { label: 'Payment Intent', value: order.stripePaymentIntentId },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span
                    className="ov-mono"
                    style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', minWidth: 100, paddingTop: 1 }}
                  >
                    {label}
                  </span>
                  <span className="ov-stripe-id">{value}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
        {/* ══════════ END CONTENT ══════════ */}
      </div>
    </>
  );
};

export default OrderView;