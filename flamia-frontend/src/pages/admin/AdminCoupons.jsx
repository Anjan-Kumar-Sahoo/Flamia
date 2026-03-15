import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiOutlineTrash } from 'react-icons/hi2';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { getAdminCoupons, deleteCoupon } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    try {
      const res = await getAdminCoupons({ size: 50 });
      setCoupons((res.data || res)?.content || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try { await deleteCoupon(id); toast.success('Coupon deleted'); loadCoupons(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-heading-1 font-serif text-charcoal-800">Coupons</h1>
          <p className="text-body-sm text-taupe mt-1">Manage discount codes</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/coupons/new')} icon={<HiPlus className="w-4 h-4" />} id="admin-add-coupon">New Coupon</Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-body-md text-taupe mb-4">No coupons yet.</p>
            <Button variant="primary" onClick={() => navigate('/admin/coupons/new')}>Create First Coupon</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-charcoal-100 bg-charcoal-50/50">
                {['Code','Type','Value','Min Order','Uses','Expires','Status',''].map(h => (
                  <th key={h} className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-charcoal-50 hover:bg-charcoal-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-body-sm font-semibold text-charcoal-800">{c.code}</td>
                    <td className="px-6 py-4 text-body-sm text-charcoal-600">{c.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}</td>
                    <td className="px-6 py-4 text-body-sm font-medium text-charcoal-800">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-taupe">{c.minimumOrderAmount ? formatPrice(c.minimumOrderAmount) : '—'}</td>
                    <td className="px-6 py-4 text-body-sm text-charcoal-600">{c.usedCount || 0} / {c.maxUses || '∞'}</td>
                    <td className="px-6 py-4 text-body-sm text-taupe">{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={c.status === 'ACTIVE' ? 'confirmed' : 'cancelled'}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(c.id, c.code)} className="p-2 text-charcoal-400 hover:text-error transition-colors" title="Delete">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminCoupons;
