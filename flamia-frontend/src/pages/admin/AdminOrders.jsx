import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { getAdminOrders, updateOrderStatus } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const statusOptions = ['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const statusVariant = (s) => {
  const map = { PLACED: 'placed', CONFIRMED: 'confirmed', SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled' };
  return map[s] || 'default';
};
const nextStatus = (c) => ({ PLACED: 'CONFIRMED', CONFIRMED: 'SHIPPED', SHIPPED: 'DELIVERED' }[c] || null);

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { loadOrders(); }, [page, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = { page, size: 15 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await getAdminOrders(params);
      const d = res.data || res;
      setOrders(d.content || []);
      setTotalPages(d.totalPages || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatus = async (id, newSt) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, { status: newSt });
      toast.success(`Order → ${newSt}`);
      loadOrders();
    } catch (err) { toast.error('Failed to update'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-heading-1 font-serif text-charcoal-800">Orders</h1>
        <p className="text-body-sm text-taupe mt-1">Track and manage customer orders</p>
      </div>

      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {statusOptions.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-4 py-2 rounded-lg text-body-sm font-medium whitespace-nowrap transition-all ${statusFilter === s ? 'bg-charcoal-800 text-ivory' : 'text-charcoal-500 hover:bg-charcoal-100'}`}
            id={`filter-${s.toLowerCase()}`}>{s === 'ALL' ? 'All Orders' : s}</button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center"><p className="text-body-md text-taupe">No orders found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-charcoal-100 bg-charcoal-50/50">
                {['Order','Customer','Items','Date','Status','Total','Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {orders.map((o) => {
                  const next = nextStatus(o.status);
                  return (
                    <tr key={o.id} className="border-b border-charcoal-50 hover:bg-charcoal-50/30 transition-colors">
                      <td className="px-6 py-4"><Link to={`/admin/orders/${o.id}`} className="font-mono text-body-sm text-flame-500 hover:text-flame-600">{o.orderNumber}</Link></td>
                      <td className="px-6 py-4"><p className="text-body-sm text-charcoal-700">{o.customerName || '—'}</p><p className="text-[11px] text-taupe">{o.customerPhone || ''}</p></td>
                      <td className="px-6 py-4 text-body-sm text-charcoal-600">{o.itemCount}</td>
                      <td className="px-6 py-4 text-body-sm text-taupe">{formatDate(o.createdAt)}</td>
                      <td className="px-6 py-4"><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td>
                      <td className="px-6 py-4 text-body-sm font-semibold text-charcoal-800 text-right">{formatPrice(o.total)}</td>
                      <td className="px-6 py-4 text-right">
                        {next && <Button variant="secondary" size="sm" onClick={() => handleStatus(o.id, next)} isLoading={updatingId === o.id} className="text-[11px]">→ {next}</Button>}
                        {o.status === 'PLACED' && <button onClick={() => handleStatus(o.id, 'CANCELLED')} className="ml-2 text-[11px] text-error hover:text-error/80">Cancel</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-charcoal-100">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 rounded-lg text-caption font-medium ${page === i ? 'bg-flame-500 text-ivory' : 'text-charcoal-500 hover:bg-charcoal-50'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminOrders;
