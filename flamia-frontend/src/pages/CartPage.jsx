import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMinus, HiPlus, HiOutlineTrash, HiOutlineShoppingBag } from 'react-icons/hi2';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/formatters';
import Button from '../components/ui/Button';

const CartPage = () => {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <main className="pt-[72px] min-h-screen bg-cream flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="text-center px-6"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-charcoal-50 flex items-center justify-center">
            <HiOutlineShoppingBag className="w-10 h-10 text-taupe" />
          </div>
          <h1 className="font-serif text-heading-2 text-charcoal-800 mb-3">Your cart is empty</h1>
          <p className="text-body-md text-taupe mb-8">Discover our collection of handcrafted luxury candles.</p>
          <Link to="/products" className="btn-primary" id="cart-empty-shop-btn">
            Browse Collection
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-[72px] min-h-screen bg-cream">
      <div className="section-container py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-heading-1 md:text-display-md text-charcoal-800 mb-10">
            Your Cart ({getItemCount()})
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex gap-5 py-6 border-b border-taupe/15"
                >
                  {/* Image */}
                  <div className="w-24 h-28 md:w-28 md:h-32 rounded-luxury overflow-hidden bg-charcoal-50 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-taupe/30">
                        <HiOutlineShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-heading-3 text-charcoal-800 mb-1">{item.name}</h3>
                      <p className="text-body-sm text-taupe">{formatPrice(item.price)} each</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-taupe/30 rounded-luxury">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="px-3 py-2 text-charcoal-500 hover:text-charcoal-800 transition-colors"
                          aria-label="Decrease"
                        >
                          <HiMinus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-body-sm font-medium text-charcoal-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, Math.min(item.maxStock || 99, item.quantity + 1))}
                          className="px-3 py-2 text-charcoal-500 hover:text-charcoal-800 transition-colors"
                          aria-label="Increase"
                        >
                          <HiPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-body-md font-semibold text-charcoal-800">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-charcoal-400 hover:text-error transition-colors"
                          aria-label="Remove item"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Clear Cart */}
            <div className="mt-4">
              <button
                onClick={clearCart}
                className="text-body-sm text-taupe hover:text-error transition-colors"
                id="cart-clear-btn"
              >
                Clear entire cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="card-info p-8 sticky top-24"
            >
              <h3 className="font-serif text-heading-3 text-charcoal-800 mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6 text-body-md">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Shipping</span>
                  <span className="text-success">{subtotal >= 999 ? 'Free' : formatPrice(99)}</span>
                </div>
              </div>

              <div className="divider-gold mb-6" />

              <div className="flex justify-between text-body-lg font-semibold text-charcoal-800 mb-8">
                <span>Total</span>
                <span>{formatPrice(subtotal >= 999 ? subtotal : subtotal + 99)}</span>
              </div>

              {subtotal < 999 && (
                <p className="text-caption text-taupe mb-4">
                  Add {formatPrice(999 - subtotal)} more for free shipping!
                </p>
              )}

              <Link to="/checkout" className="btn-primary w-full text-center block" id="cart-checkout-btn">
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="btn-ghost w-full text-center block mt-4"
                id="cart-continue-shopping"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
