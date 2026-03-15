import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineMapPin, HiArrowRightOnRectangle } from 'react-icons/hi2';
import Button from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import { getProfile, updateProfile, getAddresses } from '../services/api';
import toast from 'react-hot-toast';

const AccountPage = () => {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, addressRes] = await Promise.all([getProfile(), getAddresses()]);
      setProfile(profileRes.data);
      setName(profileRes.data?.name || '');
      setEmail(profileRes.data?.email || '');
      setAddresses(addressRes.data || []);
    } catch (err) {
      console.error('Failed to load account data:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, email });
      setEditing(false);
      toast.success('Profile updated');
      loadData();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Signed out');
  };

  return (
    <main className="pt-[72px] min-h-screen bg-cream">
      <div className="section-container py-12 md:py-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="overline mb-3">Account</p>
          <h1 className="font-serif text-heading-1 md:text-display-md text-charcoal-800 mb-10">My Account</h1>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-info p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-flame-500/10 flex items-center justify-center">
                <HiOutlineUser className="w-6 h-6 text-flame-500" />
              </div>
              <h3 className="font-serif text-heading-3 text-charcoal-800">Profile</h3>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-ghost text-body-sm" id="edit-profile-btn">
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="input-label" htmlFor="profile-name">Name</label>
                <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label" htmlFor="profile-email">Email</label>
                <input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field w-full" />
              </div>
              <div className="flex gap-3">
                <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving} id="save-profile-btn">Save</Button>
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-body-md">
              <div className="flex justify-between">
                <span className="text-taupe">Phone</span>
                <span className="text-charcoal-700 font-mono">{profile?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Name</span>
                <span className="text-charcoal-700">{profile?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Email</span>
                <span className="text-charcoal-700">{profile?.email || '—'}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Addresses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-info p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-flame-500/10 flex items-center justify-center">
              <HiOutlineMapPin className="w-6 h-6 text-flame-500" />
            </div>
            <div>
              <h3 className="font-serif text-heading-3 text-charcoal-800">Addresses</h3>
              <p className="text-body-sm text-taupe">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
            </div>
          </div>

          {addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 bg-ivory rounded-luxury border border-taupe/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-body-sm font-semibold text-charcoal-700">{addr.fullName}</p>
                      <p className="text-body-sm text-taupe">{addr.addressLine1}</p>
                      <p className="text-body-sm text-taupe">{addr.city}, {addr.state} — {addr.pincode}</p>
                    </div>
                    {addr.isDefault && (
                      <span className="badge badge-confirmed text-[10px]">Default</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-taupe">No addresses saved yet. Add one during checkout.</p>
          )}
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <button onClick={handleLogout} className="flex items-center gap-2 text-body-sm text-error hover:text-error/80 transition-colors" id="logout-btn">
            <HiArrowRightOnRectangle className="w-5 h-5" />
            Sign Out
          </button>
        </motion.div>
      </div>
    </main>
  );
};

export default AccountPage;
