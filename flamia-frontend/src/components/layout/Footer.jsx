import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="bg-charcoal-950 border-t border-white/5">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-serif font-bold text-white mb-3">Flamia</h3>
            <p className="text-charcoal-400 text-sm leading-relaxed">
              Luxury scented candles crafted with love. Illuminate your space 
              with warmth, fragrance, and beauty.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-sans font-semibold uppercase tracking-wider text-charcoal-300 mb-4">
              Shop
            </h4>
            <ul className="space-y-2">
              {['All Candles', 'Signature Scents', 'Seasonal Collection', 'Gift Sets'].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/shop"
                      className="text-charcoal-500 hover:text-flame-400 text-sm transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-sans font-semibold uppercase tracking-wider text-charcoal-300 mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {['About Us', 'Contact', 'Shipping Policy', 'Return Policy'].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/"
                      className="text-charcoal-500 hover:text-flame-400 text-sm transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-sans font-semibold uppercase tracking-wider text-charcoal-300 mb-4">
              Stay Connected
            </h4>
            <p className="text-charcoal-500 text-sm mb-4">
              Follow us for new arrivals and inspiration.
            </p>
            <div className="flex gap-3">
              {['Instagram', 'Twitter', 'Pinterest'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-charcoal-500 hover:text-flame-400 text-sm transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-charcoal-600 text-xs">
            © {new Date().getFullYear()} Flamia. All rights reserved.
          </p>
          <p className="text-charcoal-600 text-xs flex items-center gap-1">
            Made with <HiOutlineHeart className="text-flame-500 w-3 h-3" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
