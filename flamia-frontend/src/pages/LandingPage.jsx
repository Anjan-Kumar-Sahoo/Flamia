import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiSparkles } from 'react-icons/hi';

// ── Animation Variants ──────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function LandingPage() {
  return (
    <div className="relative">
      {/* ════════════════════════════════════════════
          ACT 1 — HERO
         ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-900" />

        {/* Ambient Flame Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-flame-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-flame-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center section-container">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8"
            >
              <HiSparkles className="text-flame-400 w-4 h-4" />
              <span className="text-xs font-sans uppercase tracking-[0.2em] text-charcoal-300">
                Handcrafted Luxury
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-medium text-white leading-[1.05] mb-6"
            >
              Illuminate
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-flame-400 via-flame-500 to-flame-600">
                Your World
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-charcoal-400 font-sans max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Luxury scented candles crafted from the finest natural ingredients. 
              Each flame tells a story of warmth, elegance, and serenity.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/shop" className="btn-flame flex items-center gap-2 group">
                Explore Collection
                <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about" className="btn-ghost">
                Our Story
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 border-2 border-charcoal-600 rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1 h-2 bg-flame-500 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          ACT 2 — FEATURES
         ════════════════════════════════════════════ */}
      <section className="py-24 relative">
        <div className="section-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="flame-divider mx-auto mb-6" />
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl md:text-5xl font-serif text-white mb-4"
            >
              Why <span className="text-flame-400">Flamia</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-charcoal-400 font-sans max-w-lg mx-auto"
            >
              Every candle is a promise of quality, crafted for those who
              appreciate the finer things.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Natural Soy Wax',
                desc: '100% natural, sustainable soy wax that burns cleaner and longer than paraffin alternatives.',
                icon: '🌿',
              },
              {
                title: 'Artisan Crafted',
                desc: 'Hand-poured in small batches by skilled artisans who infuse every candle with care and precision.',
                icon: '✨',
              },
              {
                title: 'Premium Fragrances',
                desc: 'Complex scent profiles created from the finest essential oils and fragrance blends from around the world.',
                icon: '🔥',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={index}
                className="glass-card p-8 text-center group hover:border-flame-500/30 transition-all duration-500"
              >
                <span className="text-4xl block mb-4">{feature.icon}</span>
                <h3 className="text-xl font-serif text-white mb-3">{feature.title}</h3>
                <p className="text-charcoal-400 text-sm font-sans leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ACT 3 — CTA BANNER
         ════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-flame-900/20 via-charcoal-900 to-flame-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-flame-500/10 rounded-full blur-[200px]" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 section-container text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl md:text-5xl font-serif text-white mb-6"
          >
            Find Your
            <span className="text-flame-400"> Perfect Scent</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-charcoal-400 font-sans max-w-lg mx-auto mb-8"
          >
            From warm vanilla evenings to fresh citrus mornings — 
            discover candles that match every mood and moment.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link to="/shop" className="btn-flame inline-flex items-center gap-2 group">
              Shop Now
              <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
