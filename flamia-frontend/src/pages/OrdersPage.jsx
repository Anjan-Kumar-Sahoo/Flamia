import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { getOrders } from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';
import { staggerContainerVariants, staggerItemVariants } from '../hooks/useScrollAnimation';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await getOrders({ size: 20 });
      setOrders(res.data?.content || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusVariant = (status) => {
    const map = { PLACED: 'placed', CONFIRMED: 'confirmed', SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled' };
    return map[status] || 'default';
  };

  return (
    <main className="pt-[72px] min-h-screen bg-cream">
      <div className="section-container py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="overline mb-3">Account</p>
          <h1 className="font-serif text-heading-1 md:text-display-md text-charcoal-800 mb-10">My Orders</h1>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="card-info p-6 flex gap-4">
                <Skeleton className="w-20 h-24" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="font-serif text-heading-3 text-charcoal-600 mb-2">No orders yet</h3>
            <p className="text-body-md text-taupe mb-6">Your order history will appear here.</p>
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainerVariants} className="space-y-4">
            {orders.map((order) => (
              <motion.div key={order.id} variants={staggerItemVariants}>
                <Link
                  to={`/orders/${order.id}`}
                  className="card-info flex items-center gap-5 p-6 hover:shadow-luxury transition-shadow duration-300 block"
                  id={`order-${order.orderNumber}`}
                >
                  {/* Order Image */}
                  <div className="w-16 h-20 rounded-luxury overflow-hidden bg-charcoal-50 flex-shrink-0">
                    {order.primaryProductImage ? (
                      <img src={order.primaryProductImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-taupe/30 text-caption">F</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-body-sm font-medium text-charcoal-700">{order.orderNumber}</span>
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </div>
                    <p className="text-body-sm text-taupe">
                      {order.itemCount} item{order.itemCount !== 1 ? 's' : ''} · {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-body-lg font-semibold text-charcoal-800">{formatPrice(order.total)}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default OrdersPage;
