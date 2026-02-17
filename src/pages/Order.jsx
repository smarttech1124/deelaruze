import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle, ShoppingBag } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useCart } from '../hooks/useCart';

const Order = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const verifyOrder = async () => {
      if (!sessionId) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const response = await orderService.verifyStripeSession(sessionId);
        setOrder(response);
        clearCart(); // Clear cart after successful payment
      } catch (err) {
        console.error('Order verification failed:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, []);

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center px-4">

      <div className="max-w-2xl w-full text-center">

        {loading && (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 mx-auto text-white animate-spin" />
            <p className="text-gray-400 text-lg">
              Verifying your payment...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="space-y-6">
            <XCircle className="w-20 h-20 mx-auto text-red-500" />
            <h1 className="text-4xl font-bold text-white">
              Payment Verification Failed
            </h1>
            <p className="text-gray-400">
              We couldn't confirm your payment. Please contact support if you were charged.
            </p>

            <Link to="/shop">
              <button className="mt-6 px-8 py-4 bg-white text-black font-bold">
                RETURN TO SHOP
              </button>
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-8">

            <CheckCircle className="w-20 h-20 mx-auto text-green-500" />

            <h1 className="text-5xl font-black text-white tracking-tight">
              PAYMENT SUCCESSFUL
            </h1>

            <p className="text-gray-400 text-lg">
              Thank you for your purchase.
            </p>

            <div className="bg-white/5 p-6 rounded-lg space-y-3">
              <p className="text-sm text-gray-500 tracking-wider">
                ORDER REFERENCE
              </p>
              <p className="text-xl font-bold text-white">
                {order.orderNumber || sessionId}
              </p>

              {order.email && (
                <p className="text-sm text-gray-400 mt-4">
                  A confirmation email has been sent to {order.email}
                </p>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <Link to="/shop">
                <button className="px-8 py-4 bg-white text-black font-bold flex items-center gap-2">
                  <ShoppingBag size={18} />
                  CONTINUE SHOPPING
                </button>
              </Link>

             <Link to={`/order-view/${order._id}`}>
                <button className="px-8 py-4 border border-white text-white font-bold">
                  VIEW ORDERS
                </button>
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Order;
