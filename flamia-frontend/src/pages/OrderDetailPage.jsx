import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { getOrderDetail } from '../services/api';
import { formatPrice, formatDate, formatDateTime } from '../utils/formatters';

const statusVariant = (status) => {
  const map = { PLACED: 'placed', CONFIRMED: 'confirmed', SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled' };
  return map[status] || 'default';
};

const statusTimeline = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await getOrderDetail(orderId);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="pt-[72px] min-h-screen bg-cream">
        <div className="section-container py-16 max-w-3xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="pt-[72px] min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-heading-2 text-charcoal-800 mb-2">Order Not Found</h2>
          <Link to="/orders" className="btn-primary mt-4">View All Orders</Link>
        </div>
      </main>
    );
  }

  const currentStepIndex = statusTimeline.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <main className="pt-[72px] min-h-screen bg-cream">
      <div className="section-container py-12 md:py-16 max-w-3xl">
        {/* Back Link */}
        <Link to="/orders" className="text-body-sm text-taupe hover:text-flame-500 transition-colors mb-6 inline-block">
          ← Back to Orders
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-heading-1 text-charcoal-800 mb-1">Order Details</h1>
              <p className="font-mono text-body-sm text-taupe">{order.orderNumber}</p>
            </div>
            <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
          </div>

          {/* Status Timeline */}
          {!isCancelled && (
            <div className="card-info p-6 mb-8">
              <div className="flex items-center justify-between">
                {statusTimeline.map((status, i) => {
                  const isDone = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <div key={status} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all
                          ${isDone ? 'bg-flame-500 text-ivory' : 'bg-charcoal-100 text-taupe'}
                          ${isCurrent ? 'ring-4 ring-flame-500/20' : ''}
                        `}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className={`text-[10px] mt-1.5 uppercase tracking-wider ${isDone ? 'text-flame-600 font-semibold' : 'text-taupe'}`}>
                          {status}
                        </span>
                      </div>
                      {i < statusTimeline.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${isDone && i < currentStepIndex ? 'bg-flame-500' : 'bg-charcoal-100'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tracking ID */}
          {order.trackingId && (
            <div className="card-info p-5 mb-6 flex items-center justify-between">
              <div>
                <p className="text-caption text-taupe">Tracking ID</p>
                <p className="font-mono text-body-md font-semibold text-charcoal-700">{order.trackingId}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="mb-8">
            <h3 className="font-serif text-heading-3 text-charcoal-800 mb-4">Items</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-ivory rounded-luxury border border-taupe/10">
                  <div className="w-14 h-16 rounded-luxury overflow-hidden bg-charcoal-50 flex-shrink-0">
                    {item.productImageUrl && <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-charcoal-700 truncate">{item.productName}</p>
                    <p className="text-caption text-taupe">Qty: {item.quantity} × {formatPrice(item.priceAtOrder)}</p>
                  </div>
                  <span className="text-body-sm font-semibold text-charcoal-800">{formatPrice(item.quantity * item.priceAtOrder)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="card-info p-6 mb-8">
            <h3 className="font-serif text-heading-3 text-charcoal-800 mb-4">Price Summary</h3>
            <div className="space-y-3 text-body-md">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span><span>−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-charcoal-600">
                <span>Shipping</span><span>{order.shippingCharge === 0 ? 'Free' : formatPrice(order.shippingCharge)}</span>
              </div>
              <div className="divider-gold my-2" />
              <div className="flex justify-between text-body-lg font-semibold text-charcoal-800">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="card-info p-6 mb-8">
              <h3 className="font-serif text-heading-3 text-charcoal-800 mb-3">Delivery Address</h3>
              <p className="text-body-sm text-charcoal-600">{order.deliveryAddress.fullName}</p>
              <p className="text-body-sm text-taupe">{order.deliveryAddress.addressLine1}</p>
              {order.deliveryAddress.addressLine2 && <p className="text-body-sm text-taupe">{order.deliveryAddress.addressLine2}</p>}
              <p className="text-body-sm text-taupe">{order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}</p>
            </div>
          )}

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-body-sm">
            <div className="card-info p-4">
              <p className="text-caption text-taupe mb-1">Ordered On</p>
              <p className="text-charcoal-700">{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="card-info p-4">
              <p className="text-caption text-taupe mb-1">Payment</p>
              <p className="text-charcoal-700">{order.paymentMethod?.replace('_', ' ')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default OrderDetailPage;
