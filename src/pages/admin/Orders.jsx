import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle, Eye, X } from 'lucide-react';
import { orderService } from '../../services/orderService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [filter]);

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

  const handleUpdateStatus = async (id, status, trackingNumber = '') => {
    try {
      await orderService.updateStatus(id, { status, trackingNumber });
      await loadOrders();
      setSelectedOrder(null);
      alert('Order status updated!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-600',
      processing: 'bg-blue-600',
      shipped: 'bg-purple-600',
      delivered: 'bg-green-600',
      cancelled: 'bg-red-600',
    };

    return (
      <span className={`px-3 py-1 text-xs font-bold ${colors[status]} rounded`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const OrderModal = ({ order, onClose }) => {
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 max-w-4xl w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-black">ORDER #{order.orderNumber}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-800">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Order Info */}
            <div className="mb-6">
              <h3 className="text-xl font-black mb-4">ORDER INFORMATION</h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>Order Number:</strong> {order.orderNumber}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Status:</strong> <StatusBadge status={order.status} /></p>
                <p><strong>Payment:</strong> {order.paymentStatus}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mb-6">
                <h3 className="text-xl font-black mb-4">SHIPPING ADDRESS</h3>
                <div className="text-gray-300">
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="mb-6">
              <h3 className="text-xl font-black mb-4">ITEMS</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 bg-black p-4">
                    <div className="w-16 h-20 bg-gray-800 flex-shrink-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{item.title}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="mb-6 bg-black p-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping:</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black border-t border-gray-700 pt-2">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Tracking Number */}
            {order.status !== 'cancelled' && (
              <div className="mb-6">
                <h3 className="text-xl font-black mb-4">TRACKING</h3>
                <Input
                  label="Tracking Number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number..."
                />
              </div>
            )}

            {/* Actions */}
            {order.status === 'pending' && (
              <div className="flex gap-4 mb-4">
                <Button
                  onClick={() => handleUpdateStatus(order._id, 'processing')}
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Package size={20} />
                  MARK AS PROCESSING
                </Button>
              </div>
            )}

            {order.status === 'processing' && (
              <div className="flex gap-4 mb-4">
                <Button
                  onClick={() => handleUpdateStatus(order._id, 'shipped', trackingNumber)}
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={!trackingNumber}
                >
                  <Truck size={20} />
                  MARK AS SHIPPED
                </Button>
              </div>
            )}

            {order.status === 'shipped' && (
              <div className="flex gap-4 mb-4">
                <Button
                  onClick={() => handleUpdateStatus(order._id, 'delivered')}
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  MARK AS DELIVERED
                </Button>
              </div>
            )}

            {['pending', 'processing'].includes(order.status) && (
              <div className="flex gap-4">
                <Button
                  onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                  variant="danger"
                  className="w-full"
                >
                  CANCEL ORDER
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">ORDERS</h1>
          <p className="text-gray-400">Manage customer orders and shipping</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 font-bold transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-white text-black'
                  : 'border-2 border-gray-700 hover:border-white'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <Loader size="lg" />
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-gray-900 p-6 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black">#{order.orderNumber}</h3>
                    <p className="text-gray-400">{order.email}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-bold">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Items</p>
                    <p className="font-bold">{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-bold">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment</p>
                    <p className="font-bold">{order.paymentStatus}</p>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mb-4 text-sm">
                    <p className="text-gray-500">Tracking Number</p>
                    <p className="font-mono">{order.trackingNumber}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 border border-white font-bold hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;