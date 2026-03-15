import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineUser, HiBars3, HiXMark } from 'react-icons/hi2';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

/**
 * Navbar — Per Design Doc §6.5
 * Cream glassmorphism, 72px height, hide-on-scroll-down/show-on-scroll-up,
 * transparent at top → solid after 100px
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const itemCount = useCartStore((s) => s.getItemCount());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 100);
      setIsVisible(currentY < lastScrollY || currentY < 72);
      setLastScrollY(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'Shop', path: '/products' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isHeroPage = location.pathname === '/';
  const navBg = isHeroPage && !isScrolled
    ? 'bg-transparent'
    : 'glass border-b border-taupe/15';
  const textColor = isHeroPage && !isScrolled ? 'text-ivory' : 'text-charcoal-800';
  const logoColor = isHeroPage && !isScrolled ? 'text-ivory' : 'text-charcoal-800';

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center ${navBg} transition-colors duration-300`}
      >
        <div className="section-container w-full flex items-center justify-between">
          {/* Mobile Hamburger */}
          <button
            id="nav-mobile-menu-toggle"
            className={`btn-icon lg:hidden ${textColor}`}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <HiBars3 className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className={`font-serif text-2xl font-semibold ${logoColor} tracking-wide`} id="nav-logo">
            Flamia
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                id={`nav-link-${link.label.toLowerCase()}`}
                className={`
                  text-body-sm uppercase tracking-[0.08em] font-sans
                  ${textColor}
                  ${location.pathname === link.path ? 'text-flame-500' : ''}
                  hover:text-flame-500 transition-colors duration-300
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Account */}
            <Link
              to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin' : '/account') : '/login'}
              className={`btn-icon ${textColor}`}
              id="nav-account"
              aria-label="Account"
            >
              <HiOutlineUser className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className={`btn-icon relative ${textColor}`} id="nav-cart" aria-label="Cart">
              <HiOutlineShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-flame-500 text-ivory text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-charcoal-900/60 z-50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-cream z-50 lg:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-[72px] border-b border-taupe/15">
                <span className="font-serif text-2xl font-semibold text-charcoal-800">Flamia</span>
                <button
                  className="btn-icon text-charcoal-800"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <HiXMark className="w-6 h-6" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 px-6 py-8">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.08 } },
                  }}
                  className="flex flex-col gap-1"
                >
                  {[
                    { label: 'Home', path: '/' },
                    ...navLinks,
                    ...(isAuthenticated
                      ? [
                          { label: 'My Orders', path: '/orders' },
                          { label: 'Account', path: '/account' },
                        ]
                      : [{ label: 'Login', path: '/login' }]),
                  ].map((link) => (
                    <motion.div
                      key={link.path}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                      }}
                    >
                      <Link
                        to={link.path}
                        className={`
                          block px-4 py-3 rounded-lg text-body-lg font-serif
                          ${location.pathname === link.path ? 'bg-flame-500/10 text-flame-600' : 'text-charcoal-700 hover:bg-charcoal-50'}
                          transition-colors duration-200
                        `}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
