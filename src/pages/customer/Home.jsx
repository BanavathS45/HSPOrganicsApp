import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';
import ProductDetailsModal from '../../components/ProductDetailsModal';
import { 
  Search, SlidersHorizontal, Sparkles, Flame, Percent, 
  MessageCircle, Mic, HelpCircle, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { products, applyCoupon } = useApp();
  const navigate = useNavigate();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  // Active product details modal state
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Active Promo Banner Slide
  const [activeSlide, setActiveSlide] = useState(0);
  const banners = [
    {
      title: '100% Organic Veggies',
      subtitle: 'Harvested daily, delivered fresh.',
      code: 'ORGANIC20',
      badge: '20% OFF',
      grad: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)',
      img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&auto=format&fit=crop'
    },
    {
      title: 'Pure Cold Pressed Oils',
      subtitle: 'Traditional wood-pressed Kachi Ghani.',
      code: 'FREE50',
      badge: '₹50 FLAT OFF',
      grad: 'linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)',
      img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop'
    }
  ];

  // Carousel timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(s => (s + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Voice Search simulation
  const handleVoiceSearch = () => {
    setVoiceActive(true);
    // Simulating speech synthesis and text capture after 2 seconds
    setTimeout(() => {
      const voiceOptions = ['Spinach', 'Mangoes', 'Coconut Oil', 'Lemonade'];
      const randomWord = voiceOptions[Math.floor(Math.random() * voiceOptions.length)];
      setSearchQuery(randomWord);
      setVoiceActive(false);
      alert(`Voice recognized: "${randomWord}"`);
    }, 2000);
  };

  // Categories list
  const categories = ['All', 'Vegetables', 'Fruits', 'Oils', 'Cool Drinks'];

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesPrice = p.price <= maxPrice;
      const matchesStock = !onlyAvailable || p.stock > 0;
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, maxPrice, onlyAvailable]);

  // Featured and Best Sellers
  const featuredProducts = useMemo(() => products.filter(p => p.featured), [products]);
  const bestSellers = useMemo(() => products.filter(p => p.bestSeller), [products]);

  // WhatsApp Order helper
  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent("Hello HSP Organics! I'd like to place an order for fresh farm-grown vegetables and fruits. Please send me today's price catalog.");
    window.open(`https://wa.me/919999999999?text=${text}`, '_blank');
  };

  return (
    <div className="container-fluid pb-5 pt-2 px-3 animate-fade-in-up" style={{ paddingBottom: '90px' }}>
      
      {/* 1. Header Slogan Banner */}
      <div className="text-center py-2 mb-3 bg-success-subtle rounded-3" style={{ background: 'var(--accent-green-bg)' }}>
        <span className="text-success fw-bold font-heading text-xs">
          🏡 Fresh Handpicked Produce Delivered Right To Your Doorstep!
        </span>
      </div>

      {/* 2. Banner Slider */}
      <div 
        className="position-relative overflow-hidden mb-4 shadow-sm"
        style={{
          borderRadius: '24px',
          height: '170px',
          background: banners[activeSlide].grad,
          color: '#fff',
          transition: 'all 0.5s ease-in-out'
        }}
      >
        <div className="d-flex h-100 align-items-center justify-content-between p-4">
          <div className="text-start flex-grow-1" style={{ maxWidth: '60%' }}>
            <span className="badge bg-warning text-dark font-heading fw-bold mb-2">
              {banners[activeSlide].badge}
            </span>
            <h3 className="font-heading fw-bold m-0" style={{ fontSize: '20px' }}>
              {banners[activeSlide].title}
            </h3>
            <p className="font-body text-xs m-0 opacity-75 mt-1">
              {banners[activeSlide].subtitle}
            </p>
            <div className="mt-2 d-flex align-items-center gap-2">
              <span className="text-xs font-body opacity-90">Code: <strong>{banners[activeSlide].code}</strong></span>
              <button 
                onClick={() => {
                  applyCoupon(banners[activeSlide].code);
                  alert(`Coupon ${banners[activeSlide].code} activated! Go to checkout to save.`);
                }}
                className="btn btn-xs btn-light text-success py-0 px-2 rounded-pill font-heading fw-bold"
                style={{ fontSize: '11px' }}
              >
                Apply
              </button>
            </div>
          </div>
          <div className="h-100 d-flex align-items-center">
            <img 
              src={banners[activeSlide].img} 
              alt={banners[activeSlide].title} 
              className="rounded-4 object-fit-cover shadow-sm" 
              style={{ width: '100px', height: '100px' }}
            />
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="position-absolute bottom-2 start-50 translate-middle-x d-flex gap-1" style={{ bottom: '8px' }}>
          {banners.map((_, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveSlide(idx)}
              className={`rounded-circle cursor-pointer`}
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: idx === activeSlide ? '#fff' : 'rgba(255,255,255,0.4)'
              }}
            />
          ))}
        </div>
      </div>

      {/* 3. Search & Voice Assist */}
      <div className="mb-4">
        <div className="input-group gap-1">
          <div className="position-relative flex-grow-1">
            <span className="position-absolute top-50 translate-middle-y start-3 text-muted" style={{ left: '16px' }}>
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Search spinach, apples, organic oils..." 
              className="form-control form-control-organic w-100 py-2 ps-5 text-dark" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Voice Search button inside bar */}
            <button 
              onClick={handleVoiceSearch} 
              className="position-absolute top-50 translate-middle-y end-3 border-0 bg-transparent text-muted p-1"
              style={{ right: '16px' }}
              title="Voice Search"
            >
              <Mic size={18} className={voiceActive ? 'text-success pulse-animation' : ''} />
            </button>
          </div>
          
          {/* Filters Toggle Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`btn rounded-4 border px-3 d-flex align-items-center justify-content-center transition-normal ${showFilters ? 'btn-success text-white' : 'btn-light text-secondary'}`}
            style={{ borderRadius: '16px' }}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Filter Drawer */}
        {showFilters && (
          <div className="card border-0 glass-card p-3 rounded-4 mt-2 text-start animate-fade-in-up">
            <h6 className="font-heading fw-bold text-success mb-3">Refine Catalog</h6>
            <div className="row g-3">
              <div className="col-6">
                <label className="form-label text-xs text-secondary fw-semibold">Max Price: ₹{maxPrice}</label>
                <input 
                  type="range" 
                  min="30" 
                  max="1000" 
                  step="10" 
                  className="form-range" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))} 
                />
              </div>
              <div className="col-6 d-flex align-items-center">
                <div className="form-check form-switch mt-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="stockSwitch"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                  />
                  <label className="form-check-label text-xs fw-semibold text-secondary" htmlFor="stockSwitch">
                    In Stock Only
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-end gap-2">
              <button 
                onClick={() => {
                  setMaxPrice(1000);
                  setOnlyAvailable(false);
                  setSearchQuery('');
                  setSelectedCategory('All');
                }} 
                className="btn btn-sm btn-light rounded-pill px-3"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilters(false)} 
                className="btn btn-sm btn-success rounded-pill px-3"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Categories Section */}
      <div className="mb-4 text-start">
        <h5 className="font-heading fw-bold text-success mb-3">Explore Categories</h5>
        <div className="d-flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm rounded-pill px-3 py-2 font-heading fw-semibold text-nowrap transition-normal ${isSelected ? 'btn-success text-white' : 'btn-light border text-secondary'}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search results catalog */}
      {searchQuery || selectedCategory !== 'All' || showFilters ? (
        <div className="text-start mb-5 animate-fade-in-up">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="font-heading fw-bold text-success m-0">Filtered Catalog</h5>
            <span className="badge bg-success-subtle text-success">{filteredProducts.length} Results</span>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border">
              <HelpCircle className="text-muted mb-2 mx-auto" size={36} />
              <p className="text-muted m-0">No matching organic products found.</p>
            </div>
          ) : (
            <div className="row g-3">
              {filteredProducts.map(p => (
                <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                  <ProductCard product={p} onViewDetails={setSelectedProduct} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Standard Blinkit Home Structure (Sliders + Bestsellers + Offer items)
        <div className="animate-fade-in-up">
          
          {/* Featured Rows */}
          <div className="text-start mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="font-heading fw-bold text-success m-0 d-flex align-items-center gap-1">
                <Sparkles className="text-warning" size={20} /> Featured Picks
              </h5>
              <button onClick={() => setSelectedCategory('All')} className="btn btn-sm btn-link text-success p-0 d-flex align-items-center text-decoration-none fw-bold" style={{ fontSize: '13px' }}>
                See All <ChevronRight size={14} />
              </button>
            </div>
            <div className="row g-3">
              {featuredProducts.slice(0, 4).map(p => (
                <div className="col-6 col-sm-3" key={p.id}>
                  <ProductCard product={p} onViewDetails={setSelectedProduct} />
                </div>
              ))}
            </div>
          </div>

          {/* Best Sellers Rows */}
          <div className="text-start mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="font-heading fw-bold text-success m-0 d-flex align-items-center gap-1">
                <Flame className="text-danger animate-pulse" size={20} /> Best Sellers
              </h5>
              <button onClick={() => setSelectedCategory('All')} className="btn btn-sm btn-link text-success p-0 d-flex align-items-center text-decoration-none fw-bold" style={{ fontSize: '13px' }}>
                See All <ChevronRight size={14} />
              </button>
            </div>
            <div className="row g-3">
              {bestSellers.slice(0, 4).map(p => (
                <div className="col-6 col-sm-3" key={p.id}>
                  <ProductCard product={p} onViewDetails={setSelectedProduct} />
                </div>
              ))}
            </div>
          </div>

          {/* 5. Special Offer Promo Banner */}
          <div 
            className="p-4 rounded-4 mb-4 text-start text-white position-relative overflow-hidden" 
            style={{
              background: 'linear-gradient(135deg, var(--organic-brown) 0%, var(--organic-brown-light) 100%)',
            }}
          >
            <div className="position-absolute end-0 bottom-0 opacity-25" style={{ transform: 'translate(20px, 20px)' }}>
              <Percent size={120} />
            </div>
            <div className="position-relative z-1" style={{ maxWidth: '75%' }}>
              <span className="badge bg-warning text-dark font-heading fw-bold mb-2">LIMITED DEAL</span>
              <h4 className="font-heading fw-bold mb-2">Wood-Pressed Organic Coconut Oil</h4>
              <p className="font-body text-xs mb-3 text-white-50">
                Extracted from fresh handpicked sulphur-free coconuts using wood mills (Kachi Ghani). Retains complete nutrients.
              </p>
              <button 
                onClick={() => {
                  const o = products.find(p => p.id === 'prod-oil-1');
                  if (o) setSelectedProduct(o);
                }} 
                className="btn btn-sm btn-light text-success rounded-pill fw-bold"
              >
                View Deal
              </button>
            </div>
          </div>

          {/* 6. Premium Brand Promises */}
          <div className="row g-2 mb-4">
            <div className="col-6">
              <div className="p-3 bg-white rounded-4 border text-center h-100">
                <CheckCircle2 className="text-success mb-2 mx-auto" size={24} />
                <h6 className="font-heading fw-bold mb-1" style={{ fontSize: '13px' }}>100% Certified</h6>
                <p className="text-muted text-xs font-body m-0">Zero chemical sprays or synthetics</p>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 bg-white rounded-4 border text-center h-100">
                <Percent className="text-success mb-2 mx-auto" size={24} />
                <h6 className="font-heading fw-bold mb-1" style={{ fontSize: '13px' }}>Direct Sourced</h6>
                <p className="text-muted text-xs font-body m-0">Fair trade pricing with local farmers</p>
              </div>
            </div>
          </div>

          {/* 7. Extra Feature: WhatsApp Ordering and Assistance */}
          <div 
            className="p-3 rounded-4 border d-flex justify-content-between align-items-center mb-5 cursor-pointer hover-expand"
            style={{
              backgroundColor: 'rgba(37, 211, 102, 0.08)',
              borderColor: 'rgba(37, 211, 102, 0.2)'
            }}
            onClick={handleWhatsAppOrder}
          >
            <div className="d-flex align-items-center gap-3 text-start">
              <div className="bg-success text-white p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: '#25D366 !important' }}>
                <MessageCircle size={22} />
              </div>
              <div>
                <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '14px' }}>
                  Order via WhatsApp Support
                </h6>
                <p className="m-0 text-muted font-body text-xs mt-0.5">
                  Send your shopping list directly to our team!
                </p>
              </div>
            </div>
            <ChevronRight className="text-success" size={18} />
          </div>

        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onNavigateToCart={() => {
            setSelectedProduct(null);
            navigate('/cart');
          }}
        />
      )}
    </div>
  );
};

export default Home;
