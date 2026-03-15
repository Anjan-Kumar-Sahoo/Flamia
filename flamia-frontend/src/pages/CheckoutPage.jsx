import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMapPin, HiOutlineCreditCard, HiOutlineClipboardDocumentList, HiCheck, HiPlus } from 'react-icons/hi2';
import Button from '../components/ui/Button';
import useCartStore from '../store/cartStore';
import { getAddresses, createAddress, createOrder, validateCoupon, createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import { formatPrice } from '../utils/formatters';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 'address', label: 'Address', icon: HiOutlineMapPin },
  { id: 'summary', label: 'Summary', icon: HiOutlineClipboardDocumentList },
  { id: 'payment', label: 'Payment', icon: HiOutlineCreditCard },
];

const CheckoutPage = () => {
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', isDefault: false,
  });
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');

  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal - discount + shipping;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await getAddresses();
      const addrs = res.data || [];
      setAddresses(addrs);
      const defaultAddr = addrs.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddress.fullName || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await createAddress(newAddress);
      setAddresses((prev) => [...prev, res.data]);
      setSelectedAddressId(res.data.id);
      setShowNewAddress(false);
      setNewAddress({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
      toast.success('Address saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setLoading(true);
    try {
      const res = await validateCoupon({ code: couponCode, orderTotal: subtotal });
      setDiscount(res.data.discountAmount || 0);
      setCouponApplied(true);
      toast.success(`Coupon applied: ${formatPrice(res.data.discountAmount)} off`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setDiscount(0);
      setCouponApplied(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: couponApplied ? couponCode : null,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };
      const res = await createOrder(orderData);
      const orderId = res.data.id;

      if (paymentMethod === 'RAZORPAY') {
        await handleRazorpay(orderId);
      } else {
        clearCart();
        toast.success('Order placed! Submit UPI payment details.');
        navigate(`/orders/${orderId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async (orderId) => {
    try {
      const rzpRes = await createRazorpayOrder(orderId);
      const rzpOrder = rzpRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'Flamia',
        description: 'Luxury Candles',
        order_id: rzpOrder.razorpayOrderId,
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            toast.success('Payment successful! Order confirmed.');
            navigate(`/orders/${orderId}`);
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#C8944A' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initialize payment');
    }
  };

  return (
    <main className="pt-[72px] min-h-screen bg-cream">
      <div className="section-container py-12 md:py-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="overline mb-3">Checkout</p>
          <h1 className="font-serif text-heading-1 md:text-display-md text-charcoal-800 mb-10">Complete Your Order</h1>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isDone ? 'bg-success text-ivory' : isActive ? 'bg-flame-500 text-ivory' : 'bg-charcoal-50 text-taupe'}
                  `}>
                    {isDone ? <HiCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-caption mt-2 ${isActive ? 'text-flame-600 font-semibold' : 'text-taupe'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${isDone ? 'bg-success' : 'bg-charcoal-100'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* ── Step 1: Address ── */}
          {step === 0 && (
            <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <h2 className="font-serif text-heading-2 text-charcoal-800 mb-6">Select Address</h2>

              <div className="space-y-3 mb-6">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full text-left p-5 rounded-luxury border-2 transition-all duration-200
                      ${selectedAddressId === addr.id ? 'border-flame-500 bg-flame-50' : 'border-taupe/20 bg-ivory hover:border-taupe/40'}`}
                    id={`addr-${addr.id}`}
                  >
                    <p className="text-body-sm font-semibold text-charcoal-700">{addr.fullName}</p>
                    <p className="text-body-sm text-taupe">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                    <p className="text-body-sm text-taupe">{addr.city}, {addr.state} — {addr.pincode}</p>
                    {addr.phone && <p className="text-caption text-taupe mt-1">{addr.phone}</p>}
                  </button>
                ))}
              </div>

              {showNewAddress ? (
                <div className="card-info p-6 space-y-4 mb-6">
                  <h3 className="font-serif text-heading-3 mb-2">New Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="input-label">Full Name *</label>
                      <input value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className="input-field w-full" />
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">Phone</label>
                      <input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="input-field w-full" />
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">Address Line 1 *</label>
                      <input value={newAddress.addressLine1} onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })} className="input-field w-full" />
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">Address Line 2</label>
                      <input value={newAddress.addressLine2} onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })} className="input-field w-full" />
                    </div>
                    <div>
                      <label className="input-label">City *</label>
                      <input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="input-field w-full" />
                    </div>
                    <div>
                      <label className="input-label">State *</label>
                      <input value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="input-field w-full" />
                    </div>
                    <div>
                      <label className="input-label">Pincode *</label>
                      <input value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} className="input-field w-full" maxLength={6} />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="primary" size="sm" onClick={handleSaveAddress} isLoading={loading}>Save Address</Button>
                    <Button variant="secondary" size="sm" onClick={() => setShowNewAddress(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewAddress(true)} className="flex items-center gap-2 text-body-sm text-flame-500 hover:text-flame-600 transition-colors mb-6" id="add-new-addr-btn">
                  <HiPlus className="w-4 h-4" /> Add New Address
                </button>
              )}

              <Button variant="primary" size="lg" fullWidth onClick={() => setStep(1)} disabled={!selectedAddressId} id="to-summary-btn">
                Continue to Summary
              </Button>
            </motion.div>
          )}

          {/* ── Step 2: Order Summary ── */}
          {step === 1 && (
            <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="font-serif text-heading-2 text-charcoal-800 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 py-3 border-b border-taupe/10">
                    <div className="w-14 h-16 rounded-luxury overflow-hidden bg-charcoal-50 flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-charcoal-700 truncate">{item.name}</p>
                      <p className="text-caption text-taupe">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-body-sm font-semibold text-charcoal-800">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-8">
                <label className="input-label">Coupon Code</label>
                <div className="flex gap-3">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="FLAMIA20"
                    className={`input-field flex-1 font-mono ${couponApplied ? 'border-success bg-success/5' : ''}`}
                    disabled={couponApplied}
                    id="coupon-input"
                  />
                  {couponApplied ? (
                    <Button variant="secondary" size="sm" onClick={() => { setCouponApplied(false); setDiscount(0); setCouponCode(''); }}>Remove</Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={handleApplyCoupon} isLoading={loading} id="apply-coupon-btn">Apply</Button>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="card-info p-6 mb-8">
                <div className="space-y-3 text-body-md">
                  <div className="flex justify-between text-charcoal-600">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Coupon Discount</span><span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-charcoal-600">
                    <span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="divider-gold my-3" />
                  <div className="flex justify-between text-body-lg font-semibold text-charcoal-800">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
                <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(2)} id="to-payment-btn">
                  Continue to Payment
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 2 && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <h2 className="font-serif text-heading-2 text-charcoal-800 mb-6">Payment Method</h2>

              <div className="space-y-3 mb-8">
                {[
                  { id: 'RAZORPAY', label: 'Razorpay', desc: 'Cards, UPI, Wallets, Net Banking' },
                  { id: 'MANUAL_UPI', label: 'Manual UPI', desc: 'Pay via UPI and upload screenshot' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`w-full text-left p-5 rounded-luxury border-2 transition-all duration-200
                      ${paymentMethod === pm.id ? 'border-flame-500 bg-flame-50' : 'border-taupe/20 bg-ivory hover:border-taupe/40'}`}
                    id={`pm-${pm.id.toLowerCase()}`}
                  >
                    <p className="text-body-md font-semibold text-charcoal-700">{pm.label}</p>
                    <p className="text-body-sm text-taupe">{pm.desc}</p>
                  </button>
                ))}
              </div>

              {/* Final Total */}
              <div className="card-info p-6 mb-8">
                <div className="flex justify-between text-body-lg font-semibold text-charcoal-800">
                  <span>Amount to Pay</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button variant="primary" size="lg" className="flex-1" onClick={handlePlaceOrder} isLoading={loading} id="place-order-btn">
                  {paymentMethod === 'RAZORPAY' ? 'Pay Now' : 'Place Order'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default CheckoutPage;
