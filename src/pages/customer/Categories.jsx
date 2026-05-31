import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';
import ProductDetailsModal from '../../components/ProductDetailsModal';
import { useNavigate } from 'react-router-dom';
import { Grid, Sparkles } from 'lucide-react';

const Categories = () => {
  const { products } = useApp();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('Vegetables');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['Vegetables', 'Fruits', 'Oils', 'Cool Drinks'];

  const categoryProducts = products.filter(p => p.category === activeCategory);

  return (
    <div className="container-fluid pb-5 pt-2 px-3 animate-fade-in-up" style={{ paddingBottom: '90px' }}>
      
      {/* Page Title */}
      <div className="text-start mb-4">
        <h4 className="font-heading fw-bold text-success m-0 d-flex align-items-center gap-2">
          <Grid size={20} /> Shop by Category
        </h4>
        <p className="text-muted text-xs font-body m-0">
          Fresh, certified organic products harvested straight from the local soil.
        </p>
      </div>

      {/* Category Tabs Layout */}
      <div className="row g-3">
        {/* Category Pills Menu */}
        <div className="col-12">
          <div className="d-flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`btn rounded-pill px-4 py-2 font-heading fw-bold text-nowrap transition-normal ${isSelected ? 'btn-success text-white shadow-sm' : 'btn-light border text-secondary'}`}
                  style={{ fontSize: '13px' }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-12 mt-3">
          <div className="text-start mb-3">
            <h5 className="font-heading fw-bold text-secondary m-0" style={{ fontSize: '16px' }}>
              Fresh {activeCategory} <span className="text-muted text-xs fw-normal font-body">({categoryProducts.length} Items)</span>
            </h5>
          </div>

          {categoryProducts.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border">
              <p className="text-muted m-0">No products found in this category.</p>
            </div>
          ) : (
            <div className="row g-3">
              {categoryProducts.map((p) => (
                <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                  <ProductCard product={p} onViewDetails={setSelectedProduct} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

export default Categories;
