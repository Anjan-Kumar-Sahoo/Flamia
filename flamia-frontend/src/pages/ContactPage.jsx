import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin } from 'react-icons/hi2';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1200));
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', phone: '', message: '' });
    setLoading(false);
  };

  const contactInfo = [
    { icon: HiOutlineEnvelope, label: 'Email', value: 'hello@flamia.in' },
    { icon: HiOutlinePhone, label: 'Phone', value: '+91 96410 03947' },
    { icon: HiOutlineMapPin, label: 'Studio', value: 'Swami Vivekanand University, West Bengal 700121' },
  ];

  return (
    <main className="pt-[72px] min-h-screen bg-cream">
      <div className="section-container py-16 md:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="overline mb-3">Get in Touch</p>
          <h1 className="font-serif text-heading-1 md:text-display-md text-charcoal-800 mb-4">Contact Us</h1>
          <p className="text-body-md text-taupe max-w-lg mb-12">
            Have a question, custom order request, or just want to say hello?
            We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="input-label" htmlFor="contact-name">Name *</label>
                  <input id="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="input-label" htmlFor="contact-email">Email *</label>
                  <input id="contact-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field w-full" />
                </div>
              </div>
              <div>
                <label className="input-label" htmlFor="contact-phone">Phone</label>
                <input id="contact-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field w-full" />
              </div>
              <div>
                <label className="input-label" htmlFor="contact-message">Message *</label>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={6}
                  className="input-field w-full resize-none"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" isLoading={loading} id="contact-submit-btn">
                Send Message
              </Button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="space-y-8">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <div key={info.label} className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-flame-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-flame-500" />
                    </div>
                    <div>
                      <p className="text-caption text-taupe uppercase tracking-widest mb-1">{info.label}</p>
                      <p className="text-body-md text-charcoal-700">{info.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
