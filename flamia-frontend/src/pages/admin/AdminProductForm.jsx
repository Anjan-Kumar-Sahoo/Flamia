import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePhoto, HiPlus, HiXMark } from 'react-icons/hi2';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { getProductById, createProduct, updateProduct, getCategories, uploadProductImage } from '../../services/api';
import toast from 'react-hot-toast';

const defaultForm = {
  name: '', description: '', scentNotes: '', price: '', compareAtPrice: '',
  stockQuantity: '', weight: '', burnTime: '', categoryId: '',
  isActive: true, isFeatured: false,
};

const AdminProductForm = () => {
  const { productId } = useParams();
  const isEdit = !!productId;
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEdit) loadProduct();
  }, [productId]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data || res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProduct = async () => {
    try {
      const res = await getProductById(productId);
      const product = res.data || res;
      setForm({
        name: product.name || '',
        description: product.description || '',
        scentNotes: product.scentNotes || '',
        price: product.price || '',
        compareAtPrice: product.compareAtPrice || '',
        stockQuantity: product.stockQuantity || '',
        weight: product.weight || '',
        burnTime: product.burnTime || '',
        categoryId: product.category?.id || '',
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
      });
      setImages(product.images || []);
    } catch (err) {
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stockQuantity) {
      toast.error('Name, price, and stock are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        stockQuantity: parseInt(form.stockQuantity),
      };

      let saved;
      if (isEdit) {
        saved = await updateProduct(productId, payload);
      } else {
        saved = await createProduct(payload);
      }

      const savedProduct = saved.data || saved;

      // Upload new images
      if (newImages.length > 0 && savedProduct?.id) {
        for (const file of newImages) {
          try {
            await uploadProductImage(savedProduct.id, file);
          } catch (err) {
            console.error('Image upload failed:', err);
          }
        }
      }

      toast.success(isEdit ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-heading-1 font-serif text-charcoal-800 mb-1">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h1>
        <p className="text-body-sm text-taupe mb-8">
          {isEdit ? "Update this candle's details" : 'Add a new candle to your collection'}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white rounded-xl border border-charcoal-100 p-6 space-y-5">
          <h2 className="font-serif text-heading-3 text-charcoal-800 mb-2">Basic Information</h2>

          <div>
            <label className="input-label" htmlFor="pf-name">Product Name *</label>
            <input id="pf-name" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="input-field w-full bg-white" placeholder="e.g. Velvet Noir" />
          </div>

          <div>
            <label className="input-label" htmlFor="pf-desc">Description</label>
            <textarea id="pf-desc" value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={4} className="input-field w-full bg-white resize-none" placeholder="Rich, evocative description..." />
          </div>

          <div>
            <label className="input-label" htmlFor="pf-scent">Scent Notes</label>
            <input id="pf-scent" value={form.scentNotes} onChange={(e) => updateField('scentNotes', e.target.value)} className="input-field w-full bg-white" placeholder="e.g. Oud, Black Rose, Musk" />
          </div>

          <div>
            <label className="input-label" htmlFor="pf-category">Category</label>
            <select id="pf-category" value={form.categoryId} onChange={(e) => updateField('categoryId', e.target.value)} className="input-field w-full bg-white">
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Pricing & Stock */}
        <section className="bg-white rounded-xl border border-charcoal-100 p-6 space-y-5">
          <h2 className="font-serif text-heading-3 text-charcoal-800 mb-2">Pricing & Inventory</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="pf-price">Price (₹) *</label>
              <input id="pf-price" type="number" step="0.01" value={form.price} onChange={(e) => updateField('price', e.target.value)} className="input-field w-full bg-white" placeholder="1990" />
            </div>
            <div>
              <label className="input-label" htmlFor="pf-compare">Compare At Price (₹)</label>
              <input id="pf-compare" type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => updateField('compareAtPrice', e.target.value)} className="input-field w-full bg-white" placeholder="Optional" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="input-label" htmlFor="pf-stock">Stock Quantity *</label>
              <input id="pf-stock" type="number" value={form.stockQuantity} onChange={(e) => updateField('stockQuantity', e.target.value)} className="input-field w-full bg-white" placeholder="50" />
            </div>
            <div>
              <label className="input-label" htmlFor="pf-weight">Weight</label>
              <input id="pf-weight" value={form.weight} onChange={(e) => updateField('weight', e.target.value)} className="input-field w-full bg-white" placeholder="250g" />
            </div>
            <div>
              <label className="input-label" htmlFor="pf-burn">Burn Time</label>
              <input id="pf-burn" value={form.burnTime} onChange={(e) => updateField('burnTime', e.target.value)} className="input-field w-full bg-white" placeholder="60+ hours" />
            </div>
          </div>
        </section>

        {/* Media */}
        <section className="bg-white rounded-xl border border-charcoal-100 p-6 space-y-5">
          <h2 className="font-serif text-heading-3 text-charcoal-800 mb-2">Images</h2>

          {/* Existing Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-charcoal-50">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* New Images Preview */}
          {newImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {newImages.map((file, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-charcoal-50 relative group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-charcoal-900/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiXMark className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-charcoal-200 rounded-xl cursor-pointer hover:border-flame-500/50 hover:bg-flame-50/50 transition-all">
            <HiOutlinePhoto className="w-6 h-6 text-taupe" />
            <span className="text-body-sm text-taupe">Click to upload images</span>
            <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
          </label>
        </section>

        {/* Settings */}
        <section className="bg-white rounded-xl border border-charcoal-100 p-6 space-y-4">
          <h2 className="font-serif text-heading-3 text-charcoal-800 mb-2">Settings</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateField('isActive', e.target.checked)}
              className="w-4 h-4 accent-flame-500 rounded"
            />
            <span className="text-body-sm text-charcoal-700">Active (visible in store)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => updateField('isFeatured', e.target.checked)}
              className="w-4 h-4 accent-flame-500 rounded"
            />
            <span className="text-body-sm text-charcoal-700">Featured on homepage</span>
          </label>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" size="lg" isLoading={saving} id="save-product-btn">
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
