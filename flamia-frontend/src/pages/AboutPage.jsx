import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const AboutPage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const { ref: storyRef, isVisible: storyVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();

  return (
    <main>
      {/* Hero */}
      <section ref={heroRef} className="relative h-[70vh] overflow-hidden bg-charcoal-900 flex items-center justify-center" id="about-hero">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6">
          <p className="overline mb-4">Our Story</p>
          <h1 className="font-serif text-[40px] md:text-display-lg font-light text-ivory mb-4">
            Born from Flame & Fragrance
          </h1>
          <p className="text-body-lg text-taupe max-w-xl mx-auto">
            Where every candle is a love letter to the senses.
          </p>
        </motion.div>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(200, 148, 74, 0.06) 0%, transparent 70%)',
        }} />
      </section>

      {/* Origin Story */}
      <section ref={storyRef} className="py-24 md:py-32 bg-cream" id="about-story">
        <div className="section-narrow">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={storyVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}>
            <p className="overline mb-4">The Beginning</p>
            <h2 className="font-serif text-heading-1 md:text-display-md text-charcoal-800 mb-8">
              A Journey That Started With a Single Flame
            </h2>
            <div className="space-y-4 text-body-md text-charcoal-500 leading-relaxed">
              <p>
                Flamia was born from a simple belief: that the light of a candle has the power
                to transform any space into a sanctuary. What began as a kitchen-table experiment
                in Bangalore has grown into India's most loved luxury candle brand.
              </p>
              <p>
                Our founder, inspired by the evening diyas of her grandmother's home and the
                artisan perfumeries of Grasse, set out to create something extraordinary —
                candles that tell stories through scent, that turn ordinary moments into rituals.
              </p>
              <p>
                Every Flamia candle is hand-poured in small batches. We use 100% natural coconut-soy wax,
                lead-free cotton wicks, and fragrance blends created by India's finest perfumers.
                No shortcuts. No synthetic fillers. Just pure, honest luxury.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-gold" />

      {/* Values */}
      <section ref={valuesRef} className="py-24 md:py-32 bg-ivory" id="about-values">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={valuesVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="overline mb-3">What We Stand For</p>
            <h2 className="font-serif text-heading-1 md:text-display-md text-charcoal-800">Our Values</h2>
          </motion.div>

          <motion.div
            initial="hidden" animate={valuesVisible ? 'visible' : 'hidden'}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Craftsmanship',
                text: 'Each candle is poured, cured, and inspected by hand. We take 14 days from blend to box, because quality cannot be rushed.',
              },
              {
                title: 'Sustainability',
                text: 'From biodegradable wax to recyclable packaging and refillable jars, we design with the planet in mind at every step.',
              },
              {
                title: 'Community',
                text: 'We work with local farmers and artisan cooperatives across India, ensuring fair wages and sustainable sourcing practices.',
              },
            ].map((v) => (
              <motion.div
                key={v.title}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                className="card-info text-center p-10"
              >
                <h3 className="font-serif text-heading-2 text-charcoal-800 mb-4">{v.title}</h3>
                <p className="text-body-md text-taupe leading-relaxed">{v.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-charcoal-900 text-center" id="about-cta">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="font-serif text-heading-1 md:text-display-md text-ivory font-light mb-6">
            Ready to Experience Flamia?
          </h2>
          <Link to="/products" className="btn-primary" id="about-cta-shop">
            Explore the Collection
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default AboutPage;
