import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, Eye, X, Sparkles, Copy } from 'lucide-react';
import { orderService } from '../../services/orderService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const statusColors = {
  pending:    'bg-yellow-600',
  processing: 'bg-blue-600',
  shipped:    'bg-purple-600',
  delivered:  'bg-green-600',
  cancelled:  'bg-red-600',
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 text-xs font-bold ${statusColors[status] ?? 'bg-gray-600'} rounded`}>
    {status.toUpperCase()}
  </span>
);

// ─── Order Modal ──────────────────────────────────────────────────────────────
const OrderModal = ({ order, onClose, onUpdateStatus }) => {
  const [updating, setUpdating]           = useState(false);
  const [trackingInput, setTrackingInput] = useState(order.trackingNumber || '');
  const [copied, setCopied]               = useState(false);

  const hasStickers = (order.stickers?.quantity ?? 0) > 0;

  // When the order prop refreshes (e.g. after a status update) keep input in sync
  useEffect(() => {
    setTrackingInput(order.trackingNumber || '');
  }, [order.trackingNumber]);

  const handleUpdate = async (status) => {
    setUpdating(true);
    try {
      // Only send trackingNumber when moving to shipped — other transitions don't need it
      const payload = { status };
      if (status === 'shipped') {
        payload.trackingNumber = trackingInput.trim();
      }
      await onUpdateStatus(order._id, payload);
    } finally {
      setUpdating(false);
    }
  };

  const copyTracking = () => {
    if (!trackingInput) return;
    navigator.clipboard.writeText(trackingInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">

        {/* ── Header ── */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-black">ORDER #{order.orderNumber}</h2>
            <p className="text-gray-500 text-sm mt-1">{order.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* ── Order Info ── */}
          <section>
            <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-4 uppercase">
              Order Information
            </h3>
            <div className="bg-black p-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Order Number</p>
                <p className="font-mono font-bold">#{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Date</p>
                <p className="font-bold">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Delivery Status</p>
                <StatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Payment Status</p>
                <span className={`text-xs font-bold ${
                  order.paymentStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Phone Number</p>
                <span className="font-bold">{order.phone || 'N/A'}</span>
              </div>
            </div>
          </section>

          {/* ── Tracking Number ── */}
          {order.status !== 'cancelled' && (
            <section>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-4 uppercase">
                Tracking Number
              </h3>

              {order.status === 'processing' ? (
                /* Editable — admin can enter or override before marking shipped */
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Enter or override tracking number..."
                      className="flex-1 bg-black border border-gray-700 focus:border-purple-500
                                 text-white text-sm font-mono px-4 py-3 outline-none
                                 placeholder-gray-600 transition-colors"
                    />
                    {trackingInput && (
                      <button
                        onClick={copyTracking}
                        className="px-3 border border-gray-700 hover:border-gray-400
                                   text-gray-400 hover:text-white transition-colors"
                        title="Copy tracking number"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    A tracking number was auto-generated when the order moved to processing.
                    You can override it here before marking as shipped.
                  </p>
                </div>
              ) : (
                /* Read-only for all other statuses */
                <div className="bg-black p-4 flex items-center justify-between">
                  <p className={`font-mono font-bold text-sm ${
                    order.trackingNumber ? 'text-purple-400' : 'text-gray-600'
                  }`}>
                    {order.trackingNumber || 'Not assigned yet'}
                  </p>
                  {order.trackingNumber && (
                    <button
                      onClick={copyTracking}
                      className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Copy size={12} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Shipping Address ── */}
          {order.shippingAddress && (
            <section>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-4 uppercase">
                Shipping Address
              </h3>
              <div className="bg-black p-4 text-sm text-gray-300 leading-relaxed">
                <p className="font-bold text-white">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}
                  {order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ''}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingLocation && (
                  <p className="mt-2 text-xs text-gray-500">
                    Region: <span className="text-white">{order.shippingLocation}</span>
                  </p>
                )}
              </div>
            </section>
          )}

          {/* ── Items ── */}
          <section>
            <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-4 uppercase">
              Items · {order.items.length}{hasStickers ? ' + stickers' : ''}
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 bg-black p-4">
                  <div className="w-14 h-18 bg-gray-800 flex-shrink-0 overflow-hidden">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    <p className="text-xs text-gray-500">£{item.price.toFixed(2)} each</p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0">
                    £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              {hasStickers && (
                <div className="flex gap-4 bg-black p-4 border border-yellow-500/20">
                  <div className="w-14 h-14 bg-yellow-500/10 flex-shrink-0 flex items-center
                                  justify-center border border-dashed border-yellow-500/30">
                    <Sparkles size={20} className="text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-yellow-400">Exclusive Art Sticker Pack</p>
                    <p className="text-xs text-gray-500 mt-1">Qty: {order.stickers.quantity}</p>
                    <p className="text-xs text-gray-500">£{order.stickers.unitPrice.toFixed(2)} each</p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0 text-yellow-400">
                    £{order.stickers.total.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Totals ── */}
          <section>
            <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-4 uppercase">
              Order Total
            </h3>
            <div className="bg-black p-4 text-sm space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>
                  Books ({order.items.reduce((s, i) => s + i.quantity, 0)}{' '}
                  {order.items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'copy' : 'copies'})
                </span>
                <span>£{order.subtotal.toFixed(2)}</span>
              </div>
              {hasStickers && (
                <div className="flex justify-between text-yellow-400/80">
                  <span>Sticker Packs ×{order.stickers.quantity}</span>
                  <span>£{order.stickers.total.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>Shipping — {order.shippingLocation || 'N/A'}</span>
                <span>£{order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black border-t border-gray-700 pt-3 mt-3">
                <span>Total</span>
                <span>£{order.total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* ── Actions ── */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <section>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-4 uppercase">
                Update Status
              </h3>
              <div className="space-y-3">
                {order.status === 'pending' && (
                  <Button
                    onClick={() => handleUpdate('processing')}
                    variant="primary"
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Package size={18} />
                    {updating ? 'UPDATING...' : 'MARK AS PROCESSING'}
                  </Button>
                )}

                {order.status === 'processing' && (
                  <div>
                    {!trackingInput.trim() && (
                      <p className="text-xs text-yellow-500 mb-3">
                        ⚠ Enter a tracking number above before marking as shipped.
                      </p>
                    )}
                    <Button
                      onClick={() => handleUpdate('shipped')}
                      variant="primary"
                      disabled={updating || !trackingInput.trim()}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Truck size={18} />
                      {updating ? 'UPDATING...' : 'MARK AS SHIPPED'}
                    </Button>
                  </div>
                )}

                {order.status === 'shipped' && (
                  <Button
                    onClick={() => handleUpdate('delivered')}
                    variant="primary"
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    {updating ? 'UPDATING...' : 'MARK AS DELIVERED'}
                  </Button>
                )}

                {['pending', 'processing'].includes(order.status) && (
                  <Button
                    onClick={() => handleUpdate('cancelled')}
                    variant="danger"
                    disabled={updating}
                    className="w-full"
                  >
                    {updating ? 'UPDATING...' : 'CANCEL ORDER'}
                  </Button>
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── Orders Page ──────────────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { loadOrders(); }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await orderService.getAll(params);
      setOrders(data.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // payload = { status, trackingNumber? }
  const handleUpdateStatus = async (id, payload) => {
    try {
      await orderService.updateStatus(id, payload);
      await loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-1">ORDERS</h1>
          <p className="text-gray-400 text-sm">Manage customer orders and shipping</p>
        </div>

        {/* ── Filters ── */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 text-sm font-bold transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-white text-black'
                  : 'border border-gray-700 hover:border-gray-400 text-gray-400 hover:text-white'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── List ── */}
        {loading ? (
          <Loader size="lg" />
        ) : orders.length === 0 ? (
          <div className="text-center py-20 border border-gray-800">
            <p className="text-xl text-gray-500">
              No {filter !== 'all' ? filter : ''} orders found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const hasStickers = (order.stickers?.quantity ?? 0) > 0;
              const totalBooks  = order.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={order._id}
                  className="bg-gray-900 p-6 hover:bg-gray-800/80 transition-colors
                             border border-transparent hover:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black">#{order.orderNumber}</h3>
                      <p className="text-gray-400 text-sm mt-0.5">{order.email}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Total</p>
                      <p className="font-bold">£{order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Books</p>
                      <p className="font-bold">{totalBooks}</p>
                    </div>
                    {hasStickers && (
                      <div>
                        <p className="text-yellow-500 text-xs mb-1">Stickers</p>
                        <p className="font-bold text-yellow-400">×{order.stickers.quantity}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Date</p>
                      <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Payment</p>
                      <p className={`font-bold text-xs ${
                        order.paymentStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {order.paymentStatus.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  {order.orderNumber && (
                    <div className="mb-4 text-xs">
                      <span className="text-gray-500">Order Number: </span>
                      <span className="font-mono text-red-400">{order.orderNumber}</span>
                    </div>
                  )}

                  {order.trackingNumber && (
                    <div className="mb-4 text-xs">
                      <span className="text-gray-500">Tracking: </span>
                      <span className="font-mono text-purple-400">{order.trackingNumber}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {order.shippingLocation && (
                      <p className="text-xs text-gray-600">
                        Ships to: <span className="text-gray-400">{order.shippingLocation}</span>
                      </p>
                    )}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="ml-auto px-4 py-2 border border-gray-700 text-sm font-bold
                                 hover:bg-white hover:text-black hover:border-white
                                 transition-colors flex items-center gap-2"
                    >
                      <Eye size={14} />
                      VIEW DETAILS
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;