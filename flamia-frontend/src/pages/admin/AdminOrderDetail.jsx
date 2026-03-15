import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { getAdminOrderDetail, updateOrderStatus, updateOrderTracking } from '../../services/api';
import { formatPrice, formatDate, formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

const statusVariant = (s) => ({ PLACED: 'placed', CONFIRMED: 'confirmed', SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled' }[s] || 'default');
const nextStatus = (c) => ({ PLACED: 'CONFIRMED', CONFIRMED: 'SHIPPED', SHIPPED: 'DELIVERED' }[c] || null);

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => { loadOrder(); }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await getAdminOrderDetail(orderId);
      setOrder(res.data || res);
      setTrackingId((res.data || res)?.trackingId || '');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatus = async (newSt) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, { status: newSt, trackingId: trackingId || undefined });
      toast.success(`Status → ${newSt}`);
      loadOrder();
    } catch (err) { toast.error('Failed'); }
    finally { setUpdating(false); }
  };

  const handleTrackingSave = async () => {
    try {
      await updateOrderTracking(orderId, { trackingId });
      toast.success('Tracking saved');
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48 w-full" /></div>;
  if (!order) return <div className="text-center py-20"><p className="text-taupe">Order not found</p><Link to="/admin/orders" className="btn-primary mt-4">Back</Link></div>;

  const next = nextStatus(order.status);

  return (
    <div className="max-w-4xl">
      <Link to="/admin/orders" className="text-body-sm text-taupe hover:text-flame-500 mb-6 inline-block">← Back to Orders</Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-heading-1 font-serif text-charcoal-800">Order {order.orderNumber}</h1>
            <p className="text-body-sm text-taupe mt-1">{formatDateTime(order.createdAt)}</p>
          </div>
          <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
        </div>

        {/* Status Actions */}
        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <div className="bg-white rounded-xl border border-charcoal-100 p-6 mb-6">
            <h3 className="font-serif text-heading-3 text-charcoal-800 mb-4">Update Status</h3>
            {order.status === 'CONFIRMED' && (
              <div className="mb-4">
                <label className="input-label">Tracking ID</label>
                <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} className="input-field w-full bg-white font-mono" placeholder="Enter tracking number" />
              </div>
            )}
            <div className="flex gap-3">
              {next && <Button variant="primary" onClick={() => handleStatus(next)} isLoading={updating}>Mark as {next}</Button>}
              {order.status === 'PLACED' && <Button variant="danger" onClick={() => handleStatus('CANCELLED')} isLoading={updating}>Cancel Order</Button>}
            </div>
          </div>
        )}

        {/* Customer */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-charcoal-100 p-6">
            <h3 className="font-serif text-heading-3 text-charcoal-800 mb-3">Customer</h3>
            <p className="text-body-sm text-charcoal-700">{order.customerName || '—'}</p>
            <p className="text-body-sm text-taupe font-mono">{order.customerPhone || ''}</p>
            <p className="text-body-sm text-taupe">{order.customerEmail || ''}</p>
          </div>
          {order.deliveryAddress && (
            <div className="bg-white rounded-xl border border-charcoal-100 p-6">
              <h3 className="font-serif text-heading-3 text-charcoal-800 mb-3">Shipping</h3>
              <p className="text-body-sm text-charcoal-700">{order.deliveryAddress.fullName}</p>
              <p className="text-body-sm text-taupe">{order.deliveryAddress.addressLine1}</p>
              <p className="text-body-sm text-taupe">{order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-charcoal-100 p-6 mb-6">
          <h3 className="font-serif text-heading-3 text-charcoal-800 mb-4">Items</h3>
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b border-charcoal-50 last:border-0">
              <div className="w-12 h-14 rounded-lg overflow-hidden bg-charcoal-50 flex-shrink-0">
                {item.productImageUrl && <img src={item.productImageUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-body-sm font-medium text-charcoal-800">{item.productName}</p>
                <p className="text-caption text-taupe">Qty: {item.quantity} × {formatPrice(item.priceAtOrder)}</p>
              </div>
              <span className="text-body-sm font-semibold text-charcoal-800">{formatPrice(item.quantity * item.priceAtOrder)}</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-charcoal-100 space-y-2 text-body-sm">
            <div className="flex justify-between text-charcoal-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>−{formatPrice(order.discountAmount)}</span></div>}
            <div className="flex justify-between text-charcoal-600"><span>Shipping</span><span>{order.shippingCharge === 0 ? 'Free' : formatPrice(order.shippingCharge)}</span></div>
            <div className="flex justify-between text-body-lg font-semibold text-charcoal-800 pt-2 border-t border-charcoal-100"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl border border-charcoal-100 p-6">
          <h3 className="font-serif text-heading-3 text-charcoal-800 mb-3">Payment</h3>
          <div className="grid grid-cols-2 gap-4 text-body-sm">
            <div><p className="text-caption text-taupe">Method</p><p className="text-charcoal-700">{order.paymentMethod?.replace('_', ' ')}</p></div>
            <div><p className="text-caption text-taupe">Status</p><p className="text-charcoal-700">{order.paymentStatus || '—'}</p></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminOrderDetail;
