import { Link } from 'react-router-dom';
import { HiOutlineEnvelope } from 'react-icons/hi2';

/**
 * Footer — Per Design Doc §6.6
 * Deep Charcoal background, 4-column grid, bronze separator
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: 'Flamia',
      items: [
        { label: 'Our Story', path: '/about' },
        { label: 'Contact Us', path: '/contact' },
      ],
    },
    {
      title: 'Shop',
      items: [
        { label: 'All Products', path: '/products' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Shipping Policy', path: '/shipping-policy' },
        { label: 'Refund Policy', path: '/refund-policy' },
        { label: 'Privacy Policy', path: '/privacy-policy' },
        { label: 'Terms of Service', path: '/terms' },
      ],
    },
  ];

  return (
    <footer className="bg-charcoal-800 text-cream">
      {/* Newsletter Section */}
      <div className="border-b border-bronze/20">
        <div className="section-container py-16 text-center">
          <h2 className="font-serif text-heading-2 text-cream mb-3">Join the Flamia Circle</h2>
          <p className="text-body-md text-taupe max-w-md mx-auto mb-8">
            Be the first to know about new collections, exclusive offers, and the stories behind our scents.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex-1 relative">
              <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe" />
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-charcoal-700 border border-charcoal-600 text-cream placeholder:text-charcoal-400
                           rounded-luxury px-4 py-3.5 pl-12 text-body-md
                           focus:outline-none focus:border-flame-500 focus:shadow-gold
                           transition-all duration-200"
                id="footer-newsletter-email"
              />
            </div>
            <button
              type="submit"
              className="btn-primary whitespace-nowrap"
              id="footer-newsletter-submit"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="section-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-serif text-2xl font-semibold text-cream tracking-wide">
              Flamia
            </Link>
            <p className="text-body-sm text-taupe mt-4 max-w-xs leading-relaxed">
              Hand-poured luxury candles crafted from the finest natural wax and rare botanical essences.
            </p>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-sans text-body-sm font-semibold text-cream uppercase tracking-widest mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-body-sm text-taupe hover:text-flame-500 transition-colors duration-300"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-bronze/20">
        <div className="section-container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-caption text-charcoal-400">
            © {currentYear} Flamia. All rights reserved.
          </p>
          <p className="text-caption text-charcoal-400">
            Crafted with warmth in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
