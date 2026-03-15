import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { createCoupon } from '../../services/api';
import toast from 'react-hot-toast';

const AdminCouponForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '', discountType: 'PERCENTAGE', discountValue: '',
    minimumOrderAmount: '', maxUses: '', expiresAt: '',
  });

  const updateField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) { toast.error('Code and value required'); return; }
    setSaving(true);
    try {
      await createCoupon({
        ...form,
        discountValue: parseFloat(form.discountValue),
        minimumOrderAmount: form.minimumOrderAmount ? parseFloat(form.minimumOrderAmount) : null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      });
      toast.success('Coupon created');
      navigate('/admin/coupons');
    } catch (err) { toast.error(err.message || 'Failed to create coupon'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-heading-1 font-serif text-charcoal-800 mb-1">New Coupon</h1>
        <p className="text-body-sm text-taupe mb-8">Create a discount code for your customers</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-charcoal-100 p-6 space-y-5">
        <div>
          <label className="input-label" htmlFor="cf-code">Coupon Code *</label>
          <input id="cf-code" value={form.code} onChange={(e) => updateField('code', e.target.value.toUpperCase())} className="input-field w-full bg-white font-mono" placeholder="FLAMIA20" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label" htmlFor="cf-type">Discount Type</label>
            <select id="cf-type" value={form.discountType} onChange={(e) => updateField('discountType', e.target.value)} className="input-field w-full bg-white">
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="cf-value">Value *</label>
            <input id="cf-value" type="number" step="0.01" value={form.discountValue} onChange={(e) => updateField('discountValue', e.target.value)} className="input-field w-full bg-white" placeholder={form.discountType === 'PERCENTAGE' ? '20' : '500'} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label" htmlFor="cf-min">Min Order (₹)</label>
            <input id="cf-min" type="number" value={form.minimumOrderAmount} onChange={(e) => updateField('minimumOrderAmount', e.target.value)} className="input-field w-full bg-white" placeholder="Optional" />
          </div>
          <div>
            <label className="input-label" htmlFor="cf-max">Max Uses</label>
            <input id="cf-max" type="number" value={form.maxUses} onChange={(e) => updateField('maxUses', e.target.value)} className="input-field w-full bg-white" placeholder="Unlimited" />
          </div>
        </div>
        <div>
          <label className="input-label" htmlFor="cf-exp">Expires At</label>
          <input id="cf-exp" type="datetime-local" value={form.expiresAt} onChange={(e) => updateField('expiresAt', e.target.value)} className="input-field w-full bg-white" />
        </div>
        <div className="flex gap-4 pt-2">
          <Button type="submit" variant="primary" isLoading={saving} id="save-coupon-btn">Create Coupon</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/coupons')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCouponForm;
