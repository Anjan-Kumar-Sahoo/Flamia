import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import useAuthStore from '../store/authStore';

/**
 * Login Page — Per Design Doc §9.1
 * Minimal, elegant, split layout. Left: brand imagery, Right: OTP form.
 * Animated transitions between phone input and OTP stages.
 */
const LoginPage = () => {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);

  const returnTo = location.state?.from || '/';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    // Validate Indian mobile number
    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^(\+91)?[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid Indian mobile number');
      return;
    }

    const fullPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone}`;

    setLoading(true);
    try {
      await sendOtp(fullPhone);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\s/g, '')}`;
      await verifyOtp(fullPhone, otp);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Brand Imagery */}
      <div className="hidden lg:flex bg-charcoal-900 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(200,148,74,0.08) 0%, transparent 70%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative text-center px-12"
        >
          <h2 className="font-serif text-display-lg text-ivory font-light mb-4">
            Welcome Back
          </h2>
          <p className="text-body-lg text-taupe max-w-md">
            Sign in to view your orders, manage your addresses, and continue your Flamia journey.
          </p>
          <div className="divider-gold mt-10 max-w-[120px] mx-auto" />
        </motion.div>
      </div>

      {/* Right — Login Form */}
      <div className="flex items-center justify-center bg-cream px-6 py-24">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          >
            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-10">
              <h2 className="font-serif text-3xl font-semibold text-charcoal-800">Flamia</h2>
            </div>

            <p className="overline mb-3">Account</p>
            <h1 className="font-serif text-heading-1 text-charcoal-800 mb-2">Sign In</h1>
            <p className="text-body-md text-taupe mb-10">
              {step === 'phone'
                ? 'Enter your mobile number to receive OTP.'
                : `We've sent a 6-digit code to ${phone}`}
            </p>

            <AnimatePresence mode="wait">
              {step === 'phone' ? (
                <motion.form
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSendOtp}
                >
                  <label className="input-label" htmlFor="phone-input">Mobile Number</label>
                  <div className="flex gap-3 mb-2">
                    <span className="input-field w-16 text-center text-charcoal-400 flex items-center justify-center">
                      +91
                    </span>
                    <input
                      id="phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className={`input-field flex-1 ${error ? 'input-error' : ''}`}
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-caption text-error mt-2">{error}</p>}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={loading}
                    className="mt-6"
                    id="send-otp-btn"
                  >
                    Send OTP
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleVerifyOtp}
                >
                  <label className="input-label" htmlFor="otp-input">Enter OTP</label>
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className={`input-field w-full text-center text-2xl tracking-[0.5em] font-mono ${error ? 'input-error' : ''}`}
                    maxLength={6}
                    autoFocus
                  />
                  {error && <p className="text-caption text-error mt-2">{error}</p>}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={loading}
                    className="mt-6"
                    id="verify-otp-btn"
                  >
                    Verify & Sign In
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                    className="btn-ghost w-full mt-4 text-center"
                    id="change-number-btn"
                  >
                    Change number
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
