import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { getAdminProducts, deleteProduct } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { page, size: 15 };
      if (search) params.search = search;
      const res = await getAdminProducts(params);
      const data = res.data || res;
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      toast.success(`"${name}" deleted`);
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading-1 font-serif text-charcoal-800">Products</h1>
          <p className="text-body-sm text-taupe mt-1">Manage your candle catalog</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/products/new')}
          icon={<HiPlus className="w-4 h-4" />}
          id="admin-add-product"
        >
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80 mb-6">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="input-field w-full pl-10 bg-white"
          id="admin-product-search"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-charcoal-100 overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-body-md text-taupe">No products found.</p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/admin/products/new')}>
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50/50">
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold">Product</th>
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold">Category</th>
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold text-right">Price</th>
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold text-center">Stock</th>
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold text-center">Status</th>
                  <th className="px-6 py-3 text-caption text-taupe uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-charcoal-50 hover:bg-charcoal-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg overflow-hidden bg-charcoal-50 flex-shrink-0">
                          {product.primaryImageUrl ? (
                            <img src={product.primaryImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-taupe/30 text-[10px]">F</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-body-sm font-medium text-charcoal-800 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-[11px] text-taupe font-mono">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-charcoal-600">{product.category?.name || '—'}</td>
                    <td className="px-6 py-4 text-body-sm font-medium text-charcoal-800 text-right">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-body-sm font-medium ${product.stockQuantity <= 5 ? 'text-error' : 'text-charcoal-600'}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${product.isActive ? 'bg-success' : 'bg-charcoal-300'}`} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/products/${product.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg text-charcoal-400 hover:bg-charcoal-50 hover:text-charcoal-600 transition-colors"
                          title="View"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="p-2 rounded-lg text-charcoal-400 hover:bg-flame-50 hover:text-flame-500 transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencilSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 rounded-lg text-charcoal-400 hover:bg-red-50 hover:text-error transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-charcoal-100">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-caption font-medium transition-all
                  ${page === i ? 'bg-flame-500 text-ivory' : 'text-charcoal-500 hover:bg-charcoal-50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminProducts;
