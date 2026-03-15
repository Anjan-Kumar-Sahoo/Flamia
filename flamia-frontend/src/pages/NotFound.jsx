import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-4"
      >
        <h1 className="text-8xl font-serif font-bold text-flame-500 mb-4">404</h1>
        <h2 className="text-2xl font-serif text-white mb-3">Page Not Found</h2>
        <p className="text-charcoal-400 font-sans mb-8 max-w-md mx-auto">
          The candle you're looking for seems to have flickered out.
          Let's get you back to the warmth.
        </p>
        <Link to="/" className="btn-flame">
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}
