import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineTruck, HiOutlineSparkles, HiMinus, HiPlus } from 'react-icons/hi2';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';
import Skeleton from '../components/ui/Skeleton';
import { getProductBySlug, getProductReviews } from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await getProductBySlug(slug);
      setProduct(res.data);

      // Load reviews
      if (res.data?.id) {
        const reviewRes = await getProductReviews(res.data.id, { size: 5 });
        setReviews(reviewRes.data?.content || []);
      }
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.primaryImageUrl,
        maxStock: product.stockQuantity,
      });
    }
    toast.success(`${product.name} added to cart`);
    setQuantity(1);
  };

  if (loading) {
    return (
      <main className="pt-[72px] min-h-screen bg-cream">
        <div className="section-container py-16">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-[4/5] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-12 w-48 mt-8" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-[72px] min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-heading-2 text-charcoal-800 mb-2">Product Not Found</h2>
          <p className="text-body-md text-taupe mb-6">This candle may have been discontinued.</p>
          <Link to="/products" className="btn-primary">Browse Collection</Link>
        </div>
      </main>
    );
  }

  const images = product.images?.length > 0
    ? product.images.sort((a, b) => a.displayOrder - b.displayOrder)
    : [{ url: product.primaryImageUrl, altText: product.name }];

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <main className="pt-[72px] min-h-screen bg-cream">
      <div className="section-container py-12 md:py-20">
        {/* Breadcrumb */}
        <nav className="mb-8 text-body-sm text-taupe">
          <Link to="/" className="hover:text-flame-500 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-flame-500 transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal-600">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          >
            {/* Main Image */}
            <div className="aspect-[4/5] rounded-luxury overflow-hidden bg-charcoal-50 mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]?.url}
                  alt={images[selectedImage]?.altText || product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-luxury overflow-hidden border-2 transition-all duration-200
                      ${selectedImage === i ? 'border-flame-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    id={`thumbnail-${i}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0, 0, 0.2, 1] }}
          >
            {/* Category */}
            {product.category && (
              <p className="overline mb-3">{product.category.name}</p>
            )}

            {/* Name */}
            <h1 className="font-serif text-heading-1 md:text-display-md text-charcoal-800 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <StarRating rating={product.averageRating} />
                <span className="text-body-sm text-taupe">
                  {product.averageRating?.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-[28px] font-semibold text-charcoal-800 font-sans">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-body-lg text-taupe line-through">{formatPrice(product.compareAtPrice)}</span>
                  <span className="badge badge-confirmed text-caption">
                    {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="divider-gold mb-8" />

            {/* Description */}
            <p className="text-body-md text-charcoal-500 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Scent Notes */}
            {product.scentNotes && (
              <div className="mb-6">
                <h4 className="input-label mb-2">Scent Notes</h4>
                <p className="text-body-md text-charcoal-700">{product.scentNotes}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {product.weight && (
                <div className="card-info p-4">
                  <p className="text-caption text-taupe mb-1">Weight</p>
                  <p className="text-body-sm font-medium text-charcoal-700">{product.weight}</p>
                </div>
              )}
              {product.burnTime && (
                <div className="card-info p-4">
                  <p className="text-caption text-taupe mb-1">Burn Time</p>
                  <p className="text-body-sm font-medium text-charcoal-700">{product.burnTime}</p>
                </div>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            {product.isInStock ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                <div className="flex items-center border border-taupe/30 rounded-luxury">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-charcoal-600 hover:text-charcoal-800 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <HiMinus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-3 text-body-md font-medium text-charcoal-800 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-4 py-3 text-charcoal-600 hover:text-charcoal-800 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1"
                  icon={<HiOutlineShoppingBag className="w-5 h-5" />}
                  id="add-to-cart-btn"
                >
                  Add to Cart
                </Button>
              </div>
            ) : (
              <div className="mb-8">
                <Button variant="secondary" size="lg" disabled fullWidth>Sold Out</Button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 text-body-sm text-taupe">
              <div className="flex items-center gap-2">
                <HiOutlineTruck className="w-5 h-5 text-flame-500" />
                <span>Free shipping above ₹999</span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineSparkles className="w-5 h-5 text-flame-500" />
                <span>100% natural ingredients</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="mt-24 pt-16 border-t border-taupe/15" id="reviews">
            <h2 className="font-serif text-heading-2 text-charcoal-800 mb-10">Customer Reviews</h2>
            <div className="space-y-6 max-w-2xl">
              {reviews.map((review) => (
                <div key={review.id} className="card-info p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <StarRating rating={review.rating} size="sm" />
                      <p className="text-body-sm font-semibold text-charcoal-700 mt-1">{review.reviewerName}</p>
                    </div>
                    <span className="text-caption text-taupe">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.comment && (
                    <p className="text-body-md text-charcoal-500 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetailPage;
