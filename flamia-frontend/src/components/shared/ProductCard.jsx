import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StarRating from '../ui/StarRating';
import { formatPrice } from '../../utils/formatters';

/**
 * Product Card — Per Design Doc §6.2
 * Image 4:5 ratio, Ivory background, lift on hover,
 * card-product class handles base styles
 */
const ProductCard = ({ product, index = 0 }) => {
  const {
    slug,
    name,
    price,
    compareAtPrice,
    primaryImageUrl,
    averageRating,
    reviewCount,
    shortDescription,
    category,
    isInStock,
  } = product;

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0, 0, 0.2, 1],
      }}
    >
      <Link
        to={`/products/${slug}`}
        className="card-product block group"
        id={`product-card-${slug}`}
      >
        {/* Image Container — 4:5 Aspect Ratio */}
        <div className="relative aspect-[4/5] overflow-hidden bg-charcoal-50">
          {primaryImageUrl ? (
            <img
              src={primaryImageUrl}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-luxury group-hover:scale-[1.08]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream">
              <div className="text-center text-taupe">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                </svg>
                <span className="text-caption">Flamia</span>
              </div>
            </div>
          )}

          {/* Card Shimmer Overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(200,148,74,0.05) 0%, rgba(200,148,74,0) 50%, rgba(200,148,74,0.05) 100%)',
            }}
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-charcoal-800 text-ivory text-caption px-2.5 py-1 rounded-luxury">
              -{discountPercent}%
            </span>
          )}

          {/* Out of Stock Overlay */}
          {!isInStock && (
            <div className="absolute inset-0 bg-charcoal-900/50 flex items-center justify-center">
              <span className="bg-charcoal-800 text-ivory text-body-sm font-medium px-4 py-2 rounded-luxury uppercase tracking-widest">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Category */}
          {category && (
            <p className="overline text-flame-600 mb-1.5">{category.name}</p>
          )}

          {/* Product Name */}
          <h3 className="font-serif text-heading-3 text-charcoal-800 leading-tight mb-2 line-clamp-2">
            {name}
          </h3>

          {/* Scent / Short Description */}
          {shortDescription && (
            <p className="text-body-sm text-taupe mb-3 line-clamp-1">
              {shortDescription}
            </p>
          )}

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={averageRating} size="sm" />
              <span className="text-caption text-taupe">({reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2.5">
            <span className="text-body-lg font-semibold text-charcoal-800">
              {formatPrice(price)}
            </span>
            {hasDiscount && (
              <span className="text-body-sm text-taupe line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
