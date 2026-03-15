import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * 404 Page — Per Design Doc §9.1
 * Elegant not-found with animated candle, message, and link back.
 */
const NotFoundPage = () => {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
        className="text-center max-w-lg"
      >
        {/* Animated Candle Icon */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-flame-500/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-flame-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            </svg>
          </div>
        </motion.div>

        <p className="overline mb-3">404</p>
        <h1 className="font-serif text-display-md text-charcoal-800 mb-4">
          Page Not Found
        </h1>
        <p className="text-body-md text-taupe mb-10 max-w-sm mx-auto">
          The candle you're looking for has burned out, or perhaps it never existed. Let's find you something beautiful.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary" id="404-home-btn">
            Return Home
          </Link>
          <Link to="/products" className="btn-secondary" id="404-shop-btn">
            Browse Collection
          </Link>
        </div>
      </motion.div>
    </main>
  );
};

export default NotFoundPage;
