import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMagnifyingGlass, HiAdjustmentsHorizontal, HiXMark } from 'react-icons/hi2';
import ProductCard from '../components/shared/ProductCard';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { getProducts, getCategories } from '../services/api';
import { staggerContainerVariants } from '../hooks/useScrollAnimation';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '0');
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSearch = searchParams.get('search') || '';

  useEffect(() => {
    loadProducts();
  }, [currentPage, currentCategory, currentSort, currentSearch]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: 12,
        sort: currentSort,
      };
      if (currentCategory) params.category = currentCategory;
      if (currentSearch) params.search = currentSearch;

      const res = await getProducts(params);
      const data = res.data;
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'name_asc', label: 'Name: A–Z' },
  ];

  return (
    <main className="pt-[72px] min-h-screen bg-cream">
      {/* Page Header */}
      <section className="py-16 md:py-20 text-center">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          >
            <p className="overline mb-3">The Collection</p>
            <h1 className="font-serif text-heading-1 md:text-display-md text-charcoal-800">
              Our Candles
            </h1>
          </motion.div>
        </div>
      </section>

      <div className="section-container pb-24">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe" />
            <input
              type="text"
              placeholder="Search candles..."
              value={currentSearch}
              onChange={(e) => setFilter('search', e.target.value)}
              className="input-field w-full pl-12"
              id="shop-search-input"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Category Filter (mobile toggle) */}
            <button
              className="btn-icon border border-taupe/30 rounded-luxury lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
              id="shop-filter-toggle"
            >
              <HiAdjustmentsHorizontal className="w-5 h-5 text-charcoal-600" />
            </button>

            {/* Sort */}
            <select
              value={currentSort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="input-field text-body-sm py-2.5 pr-8"
              id="shop-sort-select"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters — Desktop */}
          <aside className={`
            ${showFilters ? 'fixed inset-0 z-40 bg-cream p-6 overflow-y-auto' : 'hidden'}
            lg:block lg:relative lg:w-56 lg:flex-shrink-0 lg:p-0
          `}>
            {showFilters && (
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <h3 className="font-serif text-heading-3">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="btn-icon" aria-label="Close filters">
                  <HiXMark className="w-6 h-6" />
                </button>
              </div>
            )}

            <div className="mb-8">
              <h4 className="input-label mb-3">Category</h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => setFilter('category', '')}
                  className={`block w-full text-left px-3 py-2 rounded-luxury text-body-sm transition-colors
                    ${!currentCategory ? 'bg-flame-500/10 text-flame-600 font-medium' : 'text-charcoal-600 hover:bg-charcoal-50'}`}
                  id="category-all"
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setFilter('category', cat.id); setShowFilters(false); }}
                    className={`block w-full text-left px-3 py-2 rounded-luxury text-body-sm transition-colors
                      ${currentCategory === cat.id ? 'bg-flame-500/10 text-flame-600 font-medium' : 'text-charcoal-600 hover:bg-charcoal-50'}`}
                    id={`category-${cat.slug}`}
                  >
                    {cat.name}
                    {cat.productCount > 0 && (
                      <span className="text-taupe ml-1">({cat.productCount})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/5] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-taupe/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <h3 className="font-serif text-heading-3 text-charcoal-600 mb-2">No candles found</h3>
                <p className="text-body-md text-taupe">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainerVariants}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-16">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setFilter('page', i.toString())}
                        className={`w-10 h-10 rounded-full text-body-sm font-medium transition-all duration-200
                          ${currentPage === i
                            ? 'bg-flame-500 text-ivory'
                            : 'text-charcoal-600 hover:bg-charcoal-50'}`}
                        id={`page-${i}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ShopPage;
