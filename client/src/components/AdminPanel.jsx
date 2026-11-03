import React, { useState, useEffect, useMemo } from 'react';
import './AdminPanel.css';
import { resolveImageUrl } from '../utils/imageHelper';

const CATEGORIES = [
  'Plasticizers',
  'Petrochemical',
  'Paints, Inks & Coatings',
  'Industrial Acids',
  'Food & Beverages',
  'Soap & Detergents',
  'Rubber & Tyres',
  'PVC & Compounding',
  'Home and Personal Care',
  'Water Treatment',
  'Fertilizers & Animal Feed',
  'Others',
];

const IMAGE_PRESETS = [
  { label: 'Soda Ash Light', file: 'Soda-Ash-Light.webp' },
  { label: 'Calcium Carbonate', file: 'Calcium-carbonate.webp' },
  { label: 'PVC Resin', file: 'PVC-Resins.webp' },
  { label: 'LABSA', file: 'Linear-Alkyl-Benzene-Sulphonic-Acid-LABSA.webp' },
  { label: 'Toluene', file: 'Toluene.webp' },
  { label: 'DOTP', file: 'Dioctyl-Terephthalate-DOTP.webp' },
  { label: 'Stearic Acid', file: 'Stearic-Acid.webp' },
  { label: 'Soap Noodles', file: 'Soap-Noodles.webp' },
  { label: 'Talc', file: 'Talc.webp' },
  { label: 'Sodium Sulphate', file: 'Sodium-Sulphate-Anhydrous.webp' },
  { label: 'Stabilizer', file: 'Stabilizers-1.jpg' },
];

const API_BASE = '/api';

export default function AdminPanel({ onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    detail: '',
    category: 'Water Treatment',
    image: 'Soda-Ash-Light.webp',
    price: '',
    description: '',
    published: true,
  });

  // Active Tab: 'products' | 'content'
  const [activeTab, setActiveTab] = useState('products');
  const [activeContentSection, setActiveContentSection] = useState('hero');

  // CMS Content State
  const [contentData, setContentData] = useState({
    hero: {
      kicker: '',
      title: '',
      copy: '',
      buttonText: '',
      buttonLink: '',
    },
    advantages: [],
    stories: [],
    faqs: [],
    companyInfo: {
      address: '',
      plants: '',
      upcomingPlant: '',
      phone: '',
      email: '',
      copyrightYear: '',
    },
  });
  const [contentLoading, setContentLoading] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);
  const [contentDirty, setContentDirty] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      showToast('Backend connection error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    setContentLoading(true);
    try {
      let res = await fetch(`${API_BASE}/content`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('http://localhost:5000/api/content');
      }
      if (res.ok) {
        const data = await res.json();
        setContentData(data);
        setContentDirty(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Could not load site content: ' + err.message, 'error');
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchContent();
  }, []);

  const handleHeroChange = (field, value) => {
    setContentData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }));
    setContentDirty(true);
  };

  const handleCompanyChange = (field, value) => {
    setContentData((prev) => ({
      ...prev,
      companyInfo: {
        ...prev.companyInfo,
        [field]: value,
      },
    }));
    setContentDirty(true);
  };

  const handleAdvantageChange = (index, field, value) => {
    setContentData((prev) => {
      const updated = [...(prev.advantages || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, advantages: updated };
    });
    setContentDirty(true);
  };

  const handleStoryChange = (index, field, value) => {
    setContentData((prev) => {
      const updated = [...(prev.stories || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, stories: updated };
    });
    setContentDirty(true);
  };

  const addStory = () => {
    setContentData((prev) => ({
      ...prev,
      stories: [
        ...(prev.stories || []),
        {
          company: 'New Client Partner',
          quote: 'Shivtek provided exceptional chemical quality and rapid turnaround for our industrial requirements.',
          name: 'Executive Director',
          role: 'PROCUREMENT HEAD',
          color: 'blue',
          image: 'WhatsApp-Image-2026-10-12-at-12.48.50-PM.webp',
        },
      ],
    }));
    setContentDirty(true);
  };

  const removeStory = (index) => {
    if (!window.confirm('Are you sure you want to delete this customer story?')) return;
    setContentData((prev) => ({
      ...prev,
      stories: prev.stories.filter((_, i) => i !== index),
    }));
    setContentDirty(true);
  };

  const handleFaqChange = (index, field, value) => {
    setContentData((prev) => {
      const updated = [...(prev.faqs || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
    setContentDirty(true);
  };

  const addFaq = () => {
    setContentData((prev) => ({
      ...prev,
      faqs: [
        ...(prev.faqs || []),
        {
          question: 'New Frequently Asked Question?',
          answer: 'Provide a clear, detailed response regarding our manufacturing standards, chemical grades, or dispatch logistics.',
        },
      ],
    }));
    setContentDirty(true);
  };

  const removeFaq = (index) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    setContentData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
    setContentDirty(true);
  };

  const saveContent = async () => {
    setContentSaving(true);
    try {
      let res = await fetch(`${API_BASE}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('http://localhost:5000/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contentData),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      const result = await res.json();
      setContentData(result.content);
      setContentDirty(false);
      showToast('✨ Homepage content updated successfully! Changes are live on the website.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setContentSaving(false);
    }
  };

  const resetContent = async () => {
    if (!window.confirm('Reset all homepage content back to default factory settings? Any custom text will be replaced.')) {
      return;
    }
    setContentSaving(true);
    try {
      let res = await fetch(`${API_BASE}/content/reset`, { method: 'POST' }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('http://localhost:5000/api/content/reset', { method: 'POST' });
      }
      if (res.ok) {
        const result = await res.json();
        setContentData(result.content);
        setContentDirty(false);
        showToast('Homepage content has been reset to defaults.');
      }
    } catch (err) {
      showToast('Reset failed: ' + err.message, 'error');
    } finally {
      setContentSaving(false);
    }
  };


  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      detail: '',
      category: 'Water Treatment',
      image: 'Soda-Ash-Light.webp',
      price: '',
      description: '',
      published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      detail: product.detail || '',
      category: product.category || 'Others',
      image: product.image || '',
      price: product.price || '',
      description: product.description || '',
      published: product.published !== undefined ? product.published : true,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a product name', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const endpoint = editingProduct
        ? `${API_BASE}/products/${editingProduct._id}`
        : `${API_BASE}/products`;

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? Number(formData.price) : 0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Request failed');
      }

      showToast(
        editingProduct
          ? 'Product updated successfully!'
          : 'Product added to website successfully!'
      );
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the website?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast(`Deleted "${name}" successfully.`);
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleTogglePublish = async (product) => {
    try {
      const updatedStatus = !product.published;
      const res = await fetch(`${API_BASE}/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: updatedStatus }),
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      showToast(
        `"${product.name}" is now ${updatedStatus ? 'Published' : 'Hidden from site'}.`
      );
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Do you want to sync/seed default Shivtek chemical products into MongoDB?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/seed?force=true`, {
        method: 'POST',
      });
      const data = await res.json();
      showToast(data.message || 'Seeded products successfully!');
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.detail && p.detail.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const publishedCount = products.filter((p) => p.published !== false).length;
  const categoriesCount = new Set(products.map((p) => p.category)).size;

  return (
    <div className="admin-wrapper">
      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="admin-nav-brand">
          <img
            src="https://shivtekspechemi.com/wp-content/uploads/2026/07/shivtekspechemi-Logo.svg"
            alt="Shivtek Spechemi"
          />
          <span className="admin-badge-role">Admin Studio</span>
        </div>

        {/* Top Navigation Tabs */}
        <nav className="admin-nav-tabs" aria-label="Admin Navigation Tabs">
          <button
            type="button"
            className={`admin-nav-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <svg
              className="admin-tab-icon-svg"
              width="16"
              height="16"
              viewBox="0 0 512 512"
              fill="currentColor"
              aria-hidden="true"
            >
              <g>
                <path
                  d="M491.729 112.971 259.261.745a7.5 7.5 0 0 0-6.521 0L20.271 112.971a7.5 7.5 0 0 0-4.239 6.754v272.549a7.5 7.5 0 0 0 4.239 6.754l232.468 112.226a7.5 7.5 0 0 0 6.522 0l232.468-112.226a7.5 7.5 0 0 0 4.239-6.754V119.726a7.5 7.5 0 0 0-4.239-6.755M256 15.828l215.217 103.897-62.387 30.118a7.4 7.4 0 0 0-1.27-.8L193.805 45.853zm-79.133 38.505 214.904 103.746-44.015 21.249L132.941 75.624zm219.932 117.974v78.546l-41.113 19.848v-78.546zm84.169 215.261L263.5 492.55V236.658l51.873-25.042a7.5 7.5 0 1 0-6.522-13.508L256 223.623l-20.796-10.04a7.5 7.5 0 0 0-10.015 3.493 7.5 7.5 0 0 0 3.493 10.015l19.818 9.567V492.55L31.032 387.566V131.674l165.6 79.945a7.5 7.5 0 0 0 3.255.748 7.5 7.5 0 0 0 3.266-14.256l-162.37-78.386 74.505-35.968L340.582 192.52c.033.046.07.087.104.132v89.999a7.502 7.502 0 0 0 10.761 6.754l56.113-27.089a7.5 7.5 0 0 0 4.239-6.754v-90.495l69.169-33.392z"
                  fill="currentColor"
                />
                <path
                  d="M92.926 358.479 58.811 342.01a7.5 7.5 0 0 0-6.522 13.508l34.115 16.469a7.5 7.5 0 0 0 3.255.748 7.5 7.5 0 0 0 6.759-4.241 7.5 7.5 0 0 0-3.492-10.015M124.323 338.042l-65.465-31.604a7.501 7.501 0 0 0-6.521 13.509l65.465 31.604a7.5 7.5 0 0 0 3.255.748 7.5 7.5 0 0 0 3.266-14.257"
                  fill="currentColor"
                />
              </g>
            </svg>
            <span>Products</span>
            <span className="admin-tab-count">{products.length}</span>
          </button>
          <button
            type="button"
            className={`admin-nav-tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('content');
              if (!contentData.hero?.title) fetchContent();
            }}
          >
            <svg
              className="admin-tab-icon-svg"
              width="16"
              height="16"
              viewBox="0 0 512 512"
              fill="currentColor"
              aria-hidden="true"
            >
              <g>
                <path
                  d="M506.555 208.064 263.859 30.367a13.3 13.3 0 0 0-15.716 0L5.445 208.064c-5.928 4.341-7.216 12.665-2.875 18.593s12.666 7.214 18.593 2.875L256 57.588l234.837 171.943a13.24 13.24 0 0 0 7.848 2.57c4.096 0 8.138-1.885 10.744-5.445 4.342-5.927 3.054-14.251-2.874-18.592"
                  fill="currentColor"
                />
                <path
                  d="M442.246 232.543c-7.346 0-13.303 5.956-13.303 13.303v211.749H322.521V342.009c0-36.68-29.842-66.52-66.52-66.52s-66.52 29.842-66.52 66.52v115.587H83.058V245.847c0-7.347-5.957-13.303-13.303-13.303s-13.303 5.956-13.303 13.303V470.9c0 7.347 5.957 13.303 13.303 13.303h133.029c6.996 0 12.721-5.405 13.251-12.267.032-.311.052-.651.052-1.036V342.01c0-22.009 17.905-39.914 39.914-39.914s39.914 17.906 39.914 39.914V470.9c0 .383.02.717.052 1.024.524 6.867 6.251 12.279 13.251 12.279h133.029c7.347 0 13.303-5.956 13.303-13.303V245.847c-.001-7.348-5.957-13.304-13.304-13.304"
                  fill="currentColor"
                />
              </g>
            </svg>
            <span>Home Page CMS</span>
            {contentDirty && <span className="admin-tab-dirty-indicator" title="Unsaved changes">●</span>}
          </button>
        </nav>

        <div className="admin-nav-actions">
          <div className="admin-status-indicator">
            <span className="admin-status-dot" />
            <span>MongoDB Connected</span>
          </div>

          {activeTab === 'products' ? (
            <button
              type="button"
              className="admin-btn-primary"
              onClick={openCreateModal}
            >
              <span>+</span>
              <span>Add Product</span>
            </button>
          ) : (
            <button
              type="button"
              className={`admin-btn-primary ${contentDirty ? 'admin-btn-pulse' : ''}`}
              onClick={saveContent}
              disabled={contentSaving || !contentDirty}
            >
              <span>💾</span>
              <span>{contentSaving ? 'Saving...' : 'Save CMS Changes'}</span>
            </button>
          )}

          <button type="button" className="admin-btn-back" onClick={onBack}>
            <span>🌐</span>
            <span>View Live Website</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="admin-container">
        {activeTab === 'products' ? (
          <>
            {/* Metric Cards */}
            <section className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-info">
                  <h4>Total Products</h4>
                  <span>{products.length}</span>
                </div>
                <div className="stat-icon" style={{ background: '#eff6ff', color: '#0061FE' }}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <g>
                      <path
                        d="M491.729 112.971 259.261.745a7.5 7.5 0 0 0-6.521 0L20.271 112.971a7.5 7.5 0 0 0-4.239 6.754v272.549a7.5 7.5 0 0 0 4.239 6.754l232.468 112.226a7.5 7.5 0 0 0 6.522 0l232.468-112.226a7.5 7.5 0 0 0 4.239-6.754V119.726a7.5 7.5 0 0 0-4.239-6.755M256 15.828l215.217 103.897-62.387 30.118a7.4 7.4 0 0 0-1.27-.8L193.805 45.853zm-79.133 38.505 214.904 103.746-44.015 21.249L132.941 75.624zm219.932 117.974v78.546l-41.113 19.848v-78.546zm84.169 215.261L263.5 492.55V236.658l51.873-25.042a7.5 7.5 0 1 0-6.522-13.508L256 223.623l-20.796-10.04a7.5 7.5 0 0 0-10.015 3.493 7.5 7.5 0 0 0 3.493 10.015l19.818 9.567V492.55L31.032 387.566V131.674l165.6 79.945a7.5 7.5 0 0 0 3.255.748 7.5 7.5 0 0 0 3.266-14.256l-162.37-78.386 74.505-35.968L340.582 192.52c.033.046.07.087.104.132v89.999a7.502 7.502 0 0 0 10.761 6.754l56.113-27.089a7.5 7.5 0 0 0 4.239-6.754v-90.495l69.169-33.392z"
                        fill="currentColor"
                      />
                      <path
                        d="M92.926 358.479 58.811 342.01a7.5 7.5 0 0 0-6.522 13.508l34.115 16.469a7.5 7.5 0 0 0 3.255.748 7.5 7.5 0 0 0 6.759-4.241 7.5 7.5 0 0 0-3.492-10.015M124.323 338.042l-65.465-31.604a7.501 7.501 0 0 0-6.521 13.509l65.465 31.604a7.5 7.5 0 0 0 3.255.748 7.5 7.5 0 0 0 3.266-14.257"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-info">
                  <h4>Live On Website</h4>
                  <span>{publishedCount}</span>
                </div>
                <div className="stat-icon" style={{ background: '#eff6ff', color: '#0061FE' }}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 520 520"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <g>
                      <path
                        d="M79.423 240.755a47.529 47.529 0 0 0-36.737 77.522l120.73 147.894a43.14 43.14 0 0 0 36.066 16.009c14.654-.787 27.884-8.626 36.319-21.515L486.588 56.773a6 6 0 0 1 .128-.2c2.353-3.613 1.59-10.773-3.267-15.271a13.32 13.32 0 0 0-19.362 1.343q-.135.166-.278.327L210.887 328.736a10.96 10.96 0 0 1-15.585.843l-83.94-76.386a47.32 47.32 0 0 0-31.939-12.438"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-info">
                  <h4>Active Categories</h4>
                  <span>{categoriesCount}</span>
                </div>
                <div className="stat-icon" style={{ background: '#eff6ff', color: '#0061FE' }}>
                  🏷️
                </div>
              </div>
            </section>

            {/* Controls Bar: Search, Category Filter, Actions */}
            <section className="admin-controls-card">
              <div className="admin-search-box">
                <svg
                  className="admin-search-icon-svg"
                  width="16"
                  height="16"
                  viewBox="0 0 612.01 612.01"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <g>
                    <path
                      d="M606.209 578.714 448.198 423.228C489.576 378.272 515 318.817 515 253.393 514.98 113.439 399.704 0 257.493 0S.006 113.439.006 253.393s115.276 253.393 257.487 253.393c61.445 0 117.801-21.253 162.068-56.586l158.624 156.099c7.729 7.614 20.277 7.614 28.006 0a19.29 19.29 0 0 0 .018-27.585M257.493 467.8c-120.326 0-217.869-95.993-217.869-214.407S137.167 38.986 257.493 38.986c120.327 0 217.869 95.993 217.869 214.407S377.82 467.8 257.493 467.8"
                      fill="currentColor"
                    />
                  </g>
                </svg>
                <input
                  type="text"
                  placeholder="Search products by name or grade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="admin-filter-group">
                <select
                  className="admin-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories ({products.length})</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={handleSeedDefaults}
                  title="Populate official Shivtek chemical products if database is empty"
                >
                  ⚡ Sync Defaults
                </button>

                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={openCreateModal}
                >
                  <span>+</span>
                  <span>Add New Product</span>
                </button>
              </div>
            </section>

            {/* Table of Products */}
            <section className="admin-table-container">
              {loading ? (
                <div className="admin-empty-state">
                  <p>Loading products from database...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="admin-empty-state">
                  <svg
                    className="admin-empty-state-svg"
                    width="54"
                    height="54"
                    viewBox="0 0 64 64"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <g>
                      <path
                        d="M48 32c-7.72 0-14 6.28-14 14s6.28 14 14 14c2.75 0 5.43-.8 7.73-2.33.46-.3.59-.92.28-1.38a.99.99 0 0 0-1.38-.28C52.65 57.31 50.36 58 48 58c-6.62 0-12-5.38-12-12s5.38-12 12-12 12 5.38 12 12c0 2.76-.92 5.36-2.65 7.5a1.002 1.002 0 1 0 1.56 1.26C60.93 52.25 62 49.23 62 46c0-7.72-6.28-14-14-14"
                        fill="currentColor"
                      />
                      <path
                        d="M53.71 40.29a.996.996 0 0 0-1.41 0l-4.29 4.29-4.29-4.29a.996.996 0 1 0-1.41 1.41l4.29 4.29-4.29 4.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l4.29-4.29 4.29 4.29c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-4.29-4.29 4.29-4.29a.996.996 0 0 0 0-1.41zM20 32a1.008 1.008 0 0 0 1-1v-8.34l23.77-10.19c.37-.16.61-.53.61-.93s-.25-.77-.63-.92l-7.24-2.9c-.25-.1-.52-.1-.77 0l-8.92 3.82c-.51.22-.74.81-.53 1.31.22.51.81.74 1.31.53l8.54-3.66 4.62 1.85-22.16 9.5c-.37.16-.61.52-.61.92v7.48l-5-2.14v-7.68l10.02-4.3c.51-.22.74-.81.52-1.31a.994.994 0 0 0-1.31-.52l-10.63 4.56c-.37.16-.61.52-.61.92v9c0 .4.24.76.61.92l7 3c.13.05.26.08.39.08z"
                        fill="currentColor"
                      />
                      <path
                        d="M31.53 50.51 29 51.52V25.67l23-9.2v13.28c0 .55.45 1 1 1s1-.45 1-1V14.99c0-.12-.03-.24-.07-.35-.01-.03-.03-.06-.05-.1a1 1 0 0 0-.14-.2c-.02-.03-.05-.05-.07-.08a.8.8 0 0 0-.24-.16c-.02 0-.03-.02-.05-.03l-3.37-1.35a.994.994 0 0 0-1.3.56.99.99 0 0 0 .56 1.3l1.05.42-22.31 8.92-2.13-.85a1 1 0 0 0-1.3.56c-.21.51.04 1.09.56 1.3l1.87.75v25.85l-11.63-4.65a.987.987 0 0 0-1.3.56c-.21.51.04 1.09.56 1.3l13 5.2c.12.05.25.07.37.07s.25-.02.37-.07l3.9-1.56c.51-.21.76-.79.56-1.3-.21-.51-.79-.76-1.3-.56zM11.37 45.27 4 42.32V16.47l4.63 1.85a1.005 1.005 0 0 0 1.3-.56.994.994 0 0 0-.56-1.3l-3.68-1.47L28 6.08l3.52 1.4c.51.2 1.1-.05 1.3-.56s-.05-1.09-.56-1.3l-3.89-1.55c-.24-.1-.5-.09-.74 0l-25 10c-.02 0-.03.02-.04.03-.09.04-.18.1-.25.17-.03.02-.05.05-.07.08a.8.8 0 0 0-.14.21c-.02.03-.03.06-.05.1-.04.11-.07.23-.07.35v28a1 1 0 0 0 .63.93l8 3.2a1.005 1.005 0 0 0 1.3-.56.994.994 0 0 0-.56-1.3z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                  <h3>No products found</h3>
                  <p>Try clearing your search or add a new chemical product to the site.</p>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    style={{ marginTop: '14px' }}
                    onClick={openCreateModal}
                  >
                    + Add Product Now
                  </button>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Industry / Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div className="product-row-info">
                            <img
                              src={resolveImageUrl(product.image)}
                              alt={product.name}
                              className="product-thumb"
                              onError={(e) => {
                                e.target.src =
                                  'https://shivtekspechemi.com/wp-content/uploads/2026/07/card-image-30.webp';
                              }}
                            />
                            <div>
                              <div className="product-meta-name">{product.name}</div>
                              <div className="product-meta-detail">
                                {product.detail || 'Standard Specification'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="badge-category">{product.category}</span>
                        </td>

                        <td style={{ color: '#475569', fontWeight: 500 }}>
                          {product.price > 0 ? `₹${product.price}` : 'Quote on request'}
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(product)}
                            className={`badge-status ${
                              product.published !== false ? 'published' : 'draft'
                            }`}
                            title="Click to toggle published status on live site"
                          >
                            <span>●</span>
                            <span>
                              {product.published !== false ? 'Published' : 'Hidden'}
                            </span>
                          </button>
                        </td>

                        <td>
                          <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => openEditModal(product)}
                              title="Edit product"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-delete"
                              onClick={() => handleDelete(product._id, product.name)}
                              title="Delete from website"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        ) : (
          /* Dynamic Home Page Content CMS */
          <div className="admin-cms-wrapper">
            {/* CMS Section Pills */}
            <div className="admin-cms-nav">
              <button
                type="button"
                className={`admin-cms-nav-item ${activeContentSection === 'hero' ? 'active' : ''}`}
                onClick={() => setActiveContentSection('hero')}
              >
                <span>🚀</span>
                <span>Hero Banner</span>
              </button>

              <button
                type="button"
                className={`admin-cms-nav-item ${activeContentSection === 'advantages' ? 'active' : ''}`}
                onClick={() => setActiveContentSection('advantages')}
              >
                <span>⭐</span>
                <span>Why Choose Us (6 Cards)</span>
              </button>

              <button
                type="button"
                className={`admin-cms-nav-item ${activeContentSection === 'stories' ? 'active' : ''}`}
                onClick={() => setActiveContentSection('stories')}
              >
                <span>💬</span>
                <span>Customer Stories ({contentData.stories?.length || 0})</span>
              </button>

              <button
                type="button"
                className={`admin-cms-nav-item ${activeContentSection === 'faqs' ? 'active' : ''}`}
                onClick={() => setActiveContentSection('faqs')}
              >
                <span>❓</span>
                <span>FAQs ({contentData.faqs?.length || 0})</span>
              </button>

              <button
                type="button"
                className={`admin-cms-nav-item ${activeContentSection === 'company' ? 'active' : ''}`}
                onClick={() => setActiveContentSection('company')}
              >
                <span>🏢</span>
                <span>Company &amp; Footer</span>
              </button>
            </div>

            {/* CMS Panes */}
            {contentLoading ? (
              <div className="admin-cms-loading">
                <span className="admin-status-dot" /> Loading content from database...
              </div>
            ) : (
              <div className="admin-cms-content">
                {/* 1. HERO BANNER PANE */}
                {activeContentSection === 'hero' && (
                  <div className="admin-cms-pane">
                    <div className="cms-pane-header">
                      <div>
                        <h3>Hero Banner Content</h3>
                        <p>Configure the top introduction badge, main headline, description copy, and CTA button.</p>
                      </div>
                    </div>

                    <div className="cms-hero-layout">
                      <div className="cms-form-col">
                        <div className="admin-form-group">
                          <label>Highlight Kicker / Badge Text</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={contentData.hero?.kicker || ''}
                            onChange={(e) => handleHeroChange('kicker', e.target.value)}
                            placeholder="e.g. India’s first green biodegradable plasticizers"
                          />
                          <small className="field-hint">Displays alongside the Ashoka Chakra icon above the headline.</small>
                        </div>

                        <div className="admin-form-group">
                          <label>Main Headline</label>
                          <textarea
                            rows={3}
                            className="admin-textarea"
                            value={contentData.hero?.title || ''}
                            onChange={(e) => handleHeroChange('title', e.target.value)}
                            placeholder="e.g. Trusted specialty chemicals in 75+ countries"
                          />
                          <small className="field-hint">Press Enter to create line breaks in the headline.</small>
                        </div>

                        <div className="admin-form-group">
                          <label>Subtitle / Description Copy</label>
                          <textarea
                            rows={4}
                            className="admin-textarea"
                            value={contentData.hero?.copy || ''}
                            onChange={(e) => handleHeroChange('copy', e.target.value)}
                            placeholder="Detailed value proposition..."
                          />
                        </div>

                        <div className="cms-two-col">
                          <div className="admin-form-group">
                            <label>Call-to-Action Button Text</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={contentData.hero?.buttonText || ''}
                              onChange={(e) => handleHeroChange('buttonText', e.target.value)}
                              placeholder="e.g. Talk to an Expert"
                            />
                          </div>

                          <div className="admin-form-group">
                            <label>Button Target Link</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={contentData.hero?.buttonLink || ''}
                              onChange={(e) => handleHeroChange('buttonLink', e.target.value)}
                              placeholder="e.g. #contact"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live Hero Banner Preview */}
                      <div className="cms-preview-col">
                        <h4>Live Banner Preview</h4>
                        <div className="cms-hero-preview-box">
                          <span className="cms-preview-kicker">
                            <img src="/ashoka-chakra.png" alt="" />
                            {contentData.hero?.kicker || 'India’s first green biodegradable plasticizers'}
                          </span>
                          <h2 className="cms-preview-title">
                            {(contentData.hero?.title || 'Trusted specialty\nchemicals in 75+ countries')
                              .split('\n')
                              .map((line, i) => (
                                <span key={i}>
                                  {line}
                                  <br />
                                </span>
                              ))}
                          </h2>
                          <p className="cms-preview-copy">
                            {contentData.hero?.copy || 'For 38 years, Shivtek has supported industries globally with specialty chemical and petrochemical solutions...'}
                          </p>
                          <button type="button" className="cms-preview-btn">
                            {contentData.hero?.buttonText || 'Talk to an Expert'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. WHY CHOOSE SHIVTEK (ADVANTAGES) PANE */}
                {activeContentSection === 'advantages' && (
                  <div className="admin-cms-pane">
                    <div className="cms-pane-header">
                      <div>
                        <h3>Why Choose Shivtek (6 Capability Cards)</h3>
                        <p>Customize the headline and detail descriptions for each capability card. The corresponding custom vector SVGs are linked to each card position.</p>
                      </div>
                    </div>

                    <div className="cms-advantages-grid">
                      {(contentData.advantages || []).map((adv, index) => {
                        const iconNames = [
                          '38+ Years Expertise (#D65CFF)',
                          'Quality Assurance (#DCB809)',
                          'Research & Development (#1D710F)',
                          'Sustainable Innovation (#188172)',
                          'Two Star Export House (#6B2B0F)',
                          '400,000 MTPA Capacity (#24A6BC)',
                        ];

                        return (
                          <div className="cms-advantage-card" key={index}>
                            <div className="cms-adv-header">
                              <span className="cms-adv-index">Card #{index + 1}</span>
                              <span className="cms-adv-icon-tag">{iconNames[index] || adv.key}</span>
                            </div>

                            <div className="admin-form-group">
                              <label>Card Title</label>
                              <input
                                type="text"
                                className="admin-input"
                                value={adv.title || ''}
                                onChange={(e) => handleAdvantageChange(index, 'title', e.target.value)}
                              />
                            </div>

                            <div className="admin-form-group">
                              <label>Card Detail / Description</label>
                              <textarea
                                rows={3}
                                className="admin-textarea"
                                value={adv.detail || ''}
                                onChange={(e) => handleAdvantageChange(index, 'detail', e.target.value)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. CUSTOMER STORIES PANE */}
                {activeContentSection === 'stories' && (
                  <div className="admin-cms-pane">
                    <div className="cms-pane-header">
                      <div>
                        <h3>Customer Testimonials &amp; Quotes</h3>
                        <p>Manage customer reviews, testimonials, company names, and design accent colors displayed on the homepage slider.</p>
                      </div>
                      <button type="button" className="admin-btn-primary" onClick={addStory}>
                        + Add Story
                      </button>
                    </div>

                    <div className="cms-stories-grid">
                      {(contentData.stories || []).map((story, index) => (
                        <div className={`cms-story-card theme-${story.color || 'blue'}`} key={index}>
                          <div className="cms-story-top">
                            <span className="cms-story-num">Story #{index + 1}</span>
                            <button
                              type="button"
                              className="btn-story-delete"
                              onClick={() => removeStory(index)}
                              title="Delete Story"
                            >
                              ✕ Delete
                            </button>
                          </div>

                          <div className="admin-form-group">
                            <label>Company Name</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={story.company || ''}
                              onChange={(e) => handleStoryChange(index, 'company', e.target.value)}
                              placeholder="e.g. Ddev Plastiks"
                            />
                          </div>

                          <div className="admin-form-group">
                            <label>Customer Quote</label>
                            <textarea
                              rows={5}
                              className="admin-textarea"
                              value={story.quote || ''}
                              onChange={(e) => handleStoryChange(index, 'quote', e.target.value)}
                              placeholder="Customer testimonial quote..."
                            />
                          </div>

                          <div className="cms-two-col">
                            <div className="admin-form-group">
                              <label>Author / Contact Name</label>
                              <input
                                type="text"
                                className="admin-input"
                                value={story.name || ''}
                                onChange={(e) => handleStoryChange(index, 'name', e.target.value)}
                                placeholder="e.g. Shri R.K Kothari"
                              />
                            </div>

                            <div className="admin-form-group">
                              <label>Role / Designation</label>
                              <input
                                type="text"
                                className="admin-input"
                                value={story.role || ''}
                                onChange={(e) => handleStoryChange(index, 'role', e.target.value)}
                                placeholder="e.g. Managing Partner"
                              />
                            </div>
                          </div>

                          <div className="admin-form-group">
                            <label>Card Color Accent</label>
                            <div className="color-radio-group">
                              {['green', 'blue', 'pink'].map((col) => (
                                <button
                                  key={col}
                                  type="button"
                                  className={`color-choice-btn color-${col} ${
                                    story.color === col ? 'selected' : ''
                                  }`}
                                  onClick={() => handleStoryChange(index, 'color', col)}
                                >
                                  {col.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. FAQS PANE */}
                {activeContentSection === 'faqs' && (
                  <div className="admin-cms-pane">
                    <div className="cms-pane-header">
                      <div>
                        <h3>Frequently Asked Questions (FAQs)</h3>
                        <p>Manage the interactive accordion questions and answers displayed in the contact section.</p>
                      </div>
                      <button type="button" className="admin-btn-primary" onClick={addFaq}>
                        + Add FAQ
                      </button>
                    </div>

                    <div className="cms-faqs-list">
                      {(contentData.faqs || []).map((faq, index) => (
                        <div className="cms-faq-item" key={index}>
                          <div className="cms-faq-header">
                            <span className="cms-faq-num">Q{index + 1}</span>
                            <button
                              type="button"
                              className="btn-story-delete"
                              onClick={() => removeFaq(index)}
                              title="Delete FAQ"
                            >
                              ✕ Remove
                            </button>
                          </div>

                          <div className="admin-form-group">
                            <label>Question</label>
                            <input
                              type="text"
                              className="admin-input"
                              value={faq.question || ''}
                              onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                              placeholder="e.g. Do you offer custom manufacturing solutions?"
                            />
                          </div>

                          <div className="admin-form-group">
                            <label>Answer</label>
                            <textarea
                              rows={3}
                              className="admin-textarea"
                              value={faq.answer || ''}
                              onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                              placeholder="Detailed response..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. COMPANY & FOOTER PANE */}
                {activeContentSection === 'company' && (
                  <div className="admin-cms-pane">
                    <div className="cms-pane-header">
                      <div>
                        <h3>Company Information &amp; Footer</h3>
                        <p>Manage corporate headquarters address, manufacturing plant locations, support phone, and inquiry email.</p>
                      </div>
                    </div>

                    <div className="cms-company-grid">
                      <div className="admin-form-group">
                        <label>Registered Office Address</label>
                        <textarea
                          rows={3}
                          className="admin-textarea"
                          value={contentData.companyInfo?.address || ''}
                          onChange={(e) => handleCompanyChange('address', e.target.value)}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Manufacturing Plants</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={contentData.companyInfo?.plants || ''}
                          onChange={(e) => handleCompanyChange('plants', e.target.value)}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Upcoming Plant Locations</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={contentData.companyInfo?.upcomingPlant || ''}
                          onChange={(e) => handleCompanyChange('upcomingPlant', e.target.value)}
                        />
                      </div>

                      <div className="cms-two-col">
                        <div className="admin-form-group">
                          <label>Primary Phone</label>
                          <input
                            type="text"
                            className="admin-input"
                            value={contentData.companyInfo?.phone || ''}
                            onChange={(e) => handleCompanyChange('phone', e.target.value)}
                          />
                        </div>

                        <div className="admin-form-group">
                          <label>Inquiry Email</label>
                          <input
                            type="email"
                            className="admin-input"
                            value={contentData.companyInfo?.email || ''}
                            onChange={(e) => handleCompanyChange('email', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label>Copyright Year</label>
                        <input
                          type="text"
                          style={{ maxWidth: '160px' }}
                          className="admin-input"
                          value={contentData.companyInfo?.copyrightYear || '2026'}
                          onChange={(e) => handleCompanyChange('copyrightYear', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sticky CMS Action Bar */}
            <div className="admin-cms-action-bar">
              <div className="cms-save-status">
                {contentDirty ? (
                  <span className="status-dirty">
                    <span className="dot dot-dirty" /> Unsaved changes in CMS
                  </span>
                ) : (
                  <span className="status-saved">
                    <span className="dot dot-saved" /> All changes published live
                  </span>
                )}
              </div>

              <div className="cms-action-buttons">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={resetContent}
                  disabled={contentSaving}
                >
                  ↺ Reset Defaults
                </button>

                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={saveContent}
                  disabled={contentSaving || !contentDirty}
                >
                  {contentSaving ? 'Saving Changes...' : '💾 Save & Publish Live'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product to Website'}</h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-modal-body">
                {/* Form Inputs (Left side) */}
                <div className="admin-form-fields">
                  <div className="admin-form-group">
                    <label>
                      Product Brand Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. ShivaSOL™ Soda Ash Light"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Technical Grade / Subtitle</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Soda Ash Light (Industrial Grade)"
                      value={formData.detail}
                      onChange={(e) =>
                        setFormData({ ...formData, detail: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>
                      Industry / Category <span>*</span>
                    </label>
                    <select
                      className="admin-input"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Product Image (Preset or Custom URL)</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Filename (e.g. Soda-Ash-Light.webp) or full URL"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                    />

                    <div className="preset-chips-label">Quick Pick Official Packaging Images:</div>
                    <div className="preset-chips">
                      {IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.file}
                          type="button"
                          className={`preset-chip-btn ${
                            formData.image === preset.file ? 'active' : ''
                          }`}
                          onClick={() =>
                            setFormData({ ...formData, image: preset.file })
                          }
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Indicative Price (₹/MT or Quote)</label>
                    <input
                      type="number"
                      className="admin-input"
                      placeholder="0 for 'Quote on Request'"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Brief Description &amp; Applications</label>
                    <textarea
                      className="admin-textarea"
                      placeholder="Enter chemical specifications, purity level, or packaging type..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="switch-label">
                      <span className="switch-toggle">
                        <input
                          type="checkbox"
                          checked={formData.published}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              published: e.target.checked,
                            })
                          }
                        />
                        <span className="slider" />
                      </span>
                      <span>Publish on Website Immediately</span>
                    </label>
                  </div>
                </div>

                {/* Live Card Preview (Right side) */}
                <div className="preview-pane">
                  <h4>Live Website Preview</h4>
                  <div className="mock-card">
                    <img
                      src={resolveImageUrl(formData.image)}
                      alt="Preview"
                      className="mock-card-img"
                      onError={(e) => {
                        e.target.src =
                          'https://shivtekspechemi.com/wp-content/uploads/2026/07/card-image-30.webp';
                      }}
                    />
                    <div className="mock-card-body">
                      <span className="mock-card-category">{formData.category}</span>
                      <h4 className="mock-card-title">
                        {formData.name || 'Product Brand Name'}
                      </h4>
                      <span className="mock-card-detail">
                        {formData.detail || 'Technical Specification'}
                      </span>
                      <div className="mock-card-footer">
                        <span>{formData.price > 0 ? `₹${formData.price}` : 'Request Quote'}</span>
                        <span>Explore →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : editingProduct
                    ? 'Update Product'
                    : 'Save & Publish to Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
