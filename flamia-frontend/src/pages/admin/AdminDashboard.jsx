import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineCurrencyRupee,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
} from 'react-icons/hi2';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { getAdminDashboard, getAdminRecentOrders } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';

const StatCard = ({ icon: Icon, label, value, trend, trendUp, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-xl border border-charcoal-100 p-6"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-lg bg-flame-500/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-flame-500" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-caption font-semibold ${trendUp ? 'text-success' : 'text-error'}`}>
          {trendUp ? <HiOutlineArrowTrendingUp className="w-4 h-4" /> : <HiOutlineArrowTrendingDown className="w-4 h-4" />}
          {trend}
        </div>
      )}
    </div>
    <p className="text-[26px] font-bold text-charcoal-800 font-sans mb-1">{value}</p>
    <p className="text-caption text-taupe uppercase tracking-wider">{label}</p>
  </motion.div>
);

const statusVariant = (s) => {
  const map = { PLACED: 'placed', CONFIRMED: 'confirmed', SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled' };
  return map[s] || 'default';
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        getAdminDashboard(),
        getAdminRecentOrders({ size: 8 }),
      ]);
      setStats(statsRes.data || statsRes);
      setRecentOrders(ordersRes.data?.content || ordersRes.content || []);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const statCards = [
    {
      icon: HiOutlineCurrencyRupee,
      label: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
      trend: stats?.revenueTrend,
      trendUp: true,
    },
    {
      icon: HiOutlineShoppingCart,
      label: 'Total Orders',
      value: stats?.totalOrders?.toLocaleString() || '0',
      trend: stats?.ordersTrend,
      trendUp: true,
    },
    {
      icon: HiOutlineCube,
      label: 'Active Products',
      value: stats?.activeProducts?.toLocaleString() || '0',
    },
    {
      icon: HiOutlineUsers,
      label: 'Customers',
      value: stats?.totalCustomers?.toLocaleString() || '0',
    },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-heading-1 font-serif text-charcoal-800">Dashboard</h1>
        <p className="text-body-sm text-taupe mt-1">Welcome back. Here's an overview of your store.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 0.1} />
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-charcoal-100 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-charcoal-100">
          <h2 className="font-serif text-heading-3 text-charcoal-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-body-sm text-flame-500 hover:text-flame-600 font-medium transition-colors">
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-body-md text-taupe">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-charcoal-50">
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold">Order</th>
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold">Customer</th>
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold">Date</th>
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold">Status</th>
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-charcoal-50 hover:bg-charcoal-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/admin/orders/${order.id}`} className="font-mono text-body-sm text-flame-500 hover:text-flame-600">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-charcoal-600">{order.customerName || '—'}</td>
                    <td className="px-6 py-4 text-body-sm text-taupe">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-body-sm font-semibold text-charcoal-800 text-right">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid sm:grid-cols-3 gap-4 mt-6"
      >
        {[
          { to: '/admin/products/new', label: 'Add Product', desc: 'Create a new candle listing' },
          { to: '/admin/coupons/new', label: 'Create Coupon', desc: 'Set up a discount code' },
          { to: '/admin/orders', label: 'Manage Orders', desc: 'Update order statuses' },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="bg-white rounded-xl border border-charcoal-100 p-5 hover:border-flame-500/30 hover:shadow-md transition-all duration-200 group"
            id={`quick-${action.label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <p className="text-body-md font-semibold text-charcoal-800 group-hover:text-flame-600 transition-colors">
              {action.label}
            </p>
            <p className="text-caption text-taupe">{action.desc}</p>
          </Link>
        ))}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
