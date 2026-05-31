import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';
import ProductDetailsModal from '../../components/ProductDetailsModal';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, products, user } = useApp();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Get matching products
  const wishlistedProducts = products.filter(p => 
    wishlist.some(w => w.userId === user?.uid && w.productId === p.id)
  );

  if (!user) {
    return (
      <div className="container-fluid pb-5 pt-5 px-3 text-center" style={{ paddingBottom: '90px' }}>
        <div className="py-5 bg-white rounded-4 border max-w-400 mx-auto px-4 shadow-sm">
          <Heart className="text-danger mb-2 mx-auto" size={32} />
          <h4 className="font-heading fw-bold text-success mb-2">Access Denied</h4>
          <p className="text-muted font-body mb-4" style={{ fontSize: '14px' }}>
            Please log in as a customer to see your favorites wishlist items.
          </p>
          <Link to="/login" className="btn btn-organic w-100 py-2">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid pb-5 pt-2 px-3 text-start animate-fade-in-up" style={{ paddingBottom: '90px' }}>
      
      {/* Page Header */}
      <div className="mb-4">
        <h4 className="font-heading fw-bold text-success m-0">My Organic Wishlist</h4>
        <p className="text-muted text-xs font-body m-0">
          Your bookmarked products stored for faster ordering.
        </p>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border px-4 shadow-sm">
          <Heart className="text-muted mb-2 mx-auto" size={40} />
          <h5 className="font-heading fw-bold text-success mb-2">Your Wishlist is Empty</h5>
          <p className="text-muted font-body mb-4" style={{ fontSize: '13.5px' }}>
            You haven't bookmarked any fresh produce yet. Tap the heart icons on the product cards to bookmark them.
          </p>
          <Link to="/" className="btn btn-organic px-4 py-2">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {wishlistedProducts.map(p => (
            <div className="col-6 col-md-4 col-lg-3" key={p.id}>
              <ProductCard product={p} onViewDetails={setSelectedProduct} />
            </div>
          ))}
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

export default Wishlist;
