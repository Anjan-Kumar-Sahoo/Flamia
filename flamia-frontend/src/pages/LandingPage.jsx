import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiChevronDown, HiOutlineSparkles, HiOutlineHandRaised, HiOutlineBeaker, HiOutlineClock } from 'react-icons/hi2';
import { useScrollAnimation, scrollRevealVariants, staggerContainerVariants, staggerItemVariants } from '../hooks/useScrollAnimation';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FLAMIA LANDING PAGE — 7-Act Cinematic Narrative
   Per Design Doc: FLAMIA_UI_DESIGN_SYSTEM §7
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ── ACT 1: THE HERO ──────────────────────────
const HeroSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden bg-charcoal-900" id="hero">
      {/* Background with Ken Burns */}
      <motion.div
        style={{ scale: bgScale }}
        className="absolute inset-0"
      >
        <img
          src="/images/hero-bg.png"
          alt="Flamia luxury candle in elegant setting"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Hero Gradient Overlay — Design Doc §2.3 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, rgba(13,13,13,0.0) 0%, rgba(13,13,13,0.3) 40%, rgba(13,13,13,0.85) 100%)
            `,
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15, delayChildren: 0.5 } },
          }}
        >
          {/* Headline — Display XL, light weight, word-by-word reveal */}
          <motion.h1
            className="font-serif text-[40px] md:text-display-lg lg:text-display-xl font-light text-ivory tracking-tight"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
            }}
          >
            Illuminate Your World
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="mt-6 text-body-lg md:text-[20px] text-taupe max-w-xl mx-auto leading-relaxed"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] } },
            }}
          >
            Hand-poured luxury candles crafted from the finest natural wax
            and rare botanical essences.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
            }}
          >
            <Link to="/products" className="btn-primary text-center min-w-[200px]" id="hero-cta-shop">
              Discover the Collection
            </Link>
            <Link to="/about" className="btn-secondary border-ivory/30 text-ivory hover:border-ivory/60 hover:bg-ivory/5 text-center min-w-[200px]" id="hero-cta-about">
              Our Story
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <span className="text-overline text-taupe/60 tracking-[0.2em]">SCROLL</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <HiChevronDown className="w-5 h-5 text-taupe/50" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ── ACT 2: BRAND PROMISE ─────────────────────
const BrandPromise = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 md:py-32 bg-cream" id="brand-promise">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
            className="relative aspect-[4/5] rounded-luxury overflow-hidden bg-charcoal-100"
          >
            <img
              src="/images/brand-story.png"
              alt="Artisan hand-pouring Flamia candle wax"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-charcoal-900/20" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0, 0, 0.2, 1] }}
          >
            <p className="overline mb-4">The Flamia Difference</p>
            <h2 className="font-serif text-[28px] md:text-display-md text-charcoal-800 mb-6">
              Where Art Meets Fragrance
            </h2>
            <div className="space-y-4 text-body-md text-charcoal-500 max-w-lg">
              <p>
                Every Flamia candle begins with a vision — a memory of evening light through amber glass,
                the first rain on warm soil, a garden at dusk. We translate these moments into fragrance.
              </p>
              <p>
                Our artisans pour each candle by hand using 100% natural coconut-soy wax,
                infused with rare botanical essences sourced from artisan distillers across India and beyond.
              </p>
              <p>
                The result is not merely a candle — it's an atmosphere, a ritual, an invitation to slow down
                and illuminate your most intimate spaces with warmth and intention.
              </p>
            </div>
            <Link to="/about" className="btn-ghost mt-8 inline-block" id="brand-learn-more">
              Learn More About Us →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ── ACT 3: FEATURED COLLECTION ───────────────
const FeaturedCollection = () => {
  const { ref, isVisible } = useScrollAnimation();

  // Placeholder featured products (will be fetched from API)
  const featured = [
    { name: 'Velvet Noir', scent: 'Oud, Black Rose, Musk', price: '₹2,490', image: '/images/velvet-noir.png' },
    { name: 'Golden Hour', scent: 'Amber, Bergamot, Vanilla', price: '₹1,990', image: '/images/golden-hour.png' },
    { name: 'Monsoon Earth', scent: 'Petrichor, Vetiver, Cedar', price: '₹2,290', image: '/images/monsoon-earth.png' },
    { name: 'Silk & Saffron', scent: 'Saffron, Sandalwood, Milk', price: '₹2,690', image: '/images/silk-saffron.png' },
  ];

  return (
    <section ref={ref} className="py-24 md:py-32 bg-ivory" id="featured-collection">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="overline mb-4">Curated for You</p>
          <h2 className="font-serif text-[28px] md:text-display-md text-charcoal-800">
            The Signature Collection
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainerVariants}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featured.map((product, i) => (
            <motion.div key={product.name} variants={staggerItemVariants}>
              <Link
                to="/products"
                className="card-product block group"
                id={`featured-card-${i}`}
              >
                <div className="aspect-[4/5] bg-cream relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-luxury group-hover:scale-[1.08]"
                  />
                  {/* Shimmer overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(135deg, rgba(200,148,74,0.06) 0%, transparent 50%, rgba(200,148,74,0.06) 100%)',
                    }}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-heading-3 text-charcoal-800 mb-1">{product.name}</h3>
                  <p className="text-body-sm text-taupe mb-3">{product.scent}</p>
                  <p className="text-body-lg font-semibold text-charcoal-800">{product.price}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link to="/products" className="btn-secondary" id="featured-view-all">
            View All Products
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// ── ACT 4: THE EXPERIENCE (PARALLAX) ─────────
const ExperienceSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={sectionRef} className="relative py-40 md:py-56 overflow-hidden" id="experience">
      {/* Parallax Background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 -top-20 -bottom-20 bg-charcoal-800"
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200,148,74,0.06) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Content */}
      <div ref={ref} className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
        >
          <h2 className="font-serif text-[28px] md:text-display-md font-light text-ivory max-w-3xl mx-auto">
            An Experience, Not Just a Candle
          </h2>
          <p className="mt-6 text-body-lg text-taupe max-w-xl mx-auto">
            Close your eyes. Breathe in. Let the fragrance become the moment.
            Every Flamia candle is designed to transform your space into a sanctuary.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ── ACT 5: BRAND VALUES ──────────────────────
const BrandValues = () => {
  const { ref, isVisible } = useScrollAnimation();

  const values = [
    {
      icon: <HiOutlineSparkles className="w-8 h-8" />,
      title: '100% Natural Wax',
      description: 'No synthetic additives or paraffin. Pure coconut-soy wax for a clean, even burn.',
    },
    {
      icon: <HiOutlineHandRaised className="w-8 h-8" />,
      title: 'Hand-Poured',
      description: 'Each candle is individually crafted by artisan hands. No two are exactly alike.',
    },
    {
      icon: <HiOutlineBeaker className="w-8 h-8" />,
      title: 'Rare Botanicals',
      description: 'Fragrances sourced from artisan distillers — essences you won\'t find elsewhere.',
    },
    {
      icon: <HiOutlineClock className="w-8 h-8" />,
      title: '60+ Hour Burn',
      description: 'Long-lasting luxury. Our signature jars deliver over 60 hours of fragrance.',
    },
  ];

  return (
    <section ref={ref} className="py-24 md:py-32 bg-cream" id="brand-values">
      <div className="section-container">
        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainerVariants}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {values.map((value) => (
            <motion.div
              key={value.title}
              variants={staggerItemVariants}
              className="card-info text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-flame-500/10 flex items-center justify-center text-flame-500 transition-transform duration-300 group-hover:scale-110">
                {value.icon}
              </div>
              <h3 className="font-serif text-heading-3 text-charcoal-800 mb-3">{value.title}</h3>
              <p className="text-body-sm text-taupe leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ── ACT 6: TESTIMONIALS ──────────────────────
const Testimonials = () => {
  const { ref, isVisible } = useScrollAnimation();

  const testimonials = [
    {
      quote: 'The Velvet Noir candle transformed my living room into a Parisian salon. The scent is intoxicating — warm, rich, and utterly unforgettable.',
      name: 'Priya S.',
      rating: 5,
    },
    {
      quote: 'I\'ve tried luxury candles from around the world, and Flamia stands apart. The quality of the wax, the depth of fragrance — this is the real thing.',
      name: 'Arjun M.',
      rating: 5,
    },
    {
      quote: 'Monsoon Earth captures the exact feeling of the first rain. I light it every evening during the monsoon season. Pure magic.',
      name: 'Kavya R.',
      rating: 5,
    },
  ];

  return (
    <section ref={ref} className="py-24 md:py-32 bg-ivory" id="testimonials">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="overline mb-4">What Our Customers Say</p>
          <h2 className="font-serif text-[28px] md:text-display-md text-charcoal-800">
            Words of Warmth
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          variants={staggerContainerVariants}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={staggerItemVariants}
              className="card-info relative"
            >
              {/* Large Quote Mark */}
              <span className="font-serif text-[80px] text-flame-500/20 leading-none absolute -top-2 left-6">
                "
              </span>
              <div className="relative pt-8">
                <p className="text-body-md text-charcoal-600 italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: t.rating }, (_, j) => (
                    <svg key={j} className="w-4 h-4 text-flame-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-body-sm font-semibold text-charcoal-800">{t.name}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ── LANDING PAGE (ALL ACTS) ──────────────────
const LandingPage = () => {
  return (
    <main>
      <HeroSection />
      <div className="divider-gold" />
      <BrandPromise />
      <FeaturedCollection />
      <ExperienceSection />
      <BrandValues />
      <div className="divider-gold" />
      <Testimonials />
    </main>
  );
};

export default LandingPage;
