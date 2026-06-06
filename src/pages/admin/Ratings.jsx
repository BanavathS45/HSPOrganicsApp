import React from 'react';
import { useApp } from '../../context/AppContext';
import { Star, MessageCircle, Truck } from 'lucide-react';

const AdminRatings = () => {
  const { ratings } = useApp();

  const avgRating = ratings.length > 0 
    ? (ratings.reduce((acc, curr) => acc + curr.stars, 0) / ratings.length).toFixed(1)
    : 0;

  return (
    <div className="container-fluid animate-fade-in-up">
      <h4 className="font-heading fw-extrabold text-success mb-4 d-flex align-items-center gap-2">
        <Star fill="#F59E0B" stroke="#F59E0B" /> Customer Ratings & Reviews
      </h4>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card glass-card border-0 shadow-sm rounded-4 p-4 text-center h-100">
            <h6 className="font-heading fw-bold text-secondary mb-2">Average Rating</h6>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <Star size={32} fill="#F59E0B" stroke="#F59E0B" />
              <h2 className="m-0 font-heading fw-bold text-dark">{avgRating}</h2>
            </div>
            <p className="text-muted text-xs m-0">out of 5.0</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card glass-card border-0 shadow-sm rounded-4 p-4 text-center h-100">
            <h6 className="font-heading fw-bold text-secondary mb-2">Total Reviews</h6>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <MessageCircle size={32} className="text-success" />
              <h2 className="m-0 font-heading fw-bold text-dark">{ratings.length}</h2>
            </div>
            <p className="text-muted text-xs m-0">submitted by customers</p>
          </div>
        </div>
      </div>

      <div className="card glass-card border-0 shadow-sm rounded-4 p-4">
        <h5 className="font-heading fw-bold text-success mb-4">Recent Reviews</h5>
        {ratings.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted font-body">No ratings have been submitted yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr className="font-heading text-secondary text-xs">
                  <th className="border-0 pb-3">Date</th>
                  <th className="border-0 pb-3">Customer</th>
                  <th className="border-0 pb-3">Order ID</th>
                  <th className="border-0 pb-3">Rating</th>
                  <th className="border-0 pb-3">Delivery Partner</th>
                  <th className="border-0 pb-3">Comment</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map(rating => (
                  <tr key={rating.id}>
                    <td className="text-muted font-body" style={{ fontSize: '13px' }}>
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </td>
                    <td className="font-heading fw-bold" style={{ fontSize: '13.5px' }}>
                      {rating.customerName}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border font-body">#{rating.orderId}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {[...Array(rating.stars)].map((_, i) => (
                          <Star key={i} size={14} fill="#F59E0B" stroke="#F59E0B" />
                        ))}
                      </div>
                    </td>
                    <td>
                      {rating.deliveryBoyName ? (
                        <div className="d-flex align-items-center gap-1.5 text-success" style={{ fontSize: '13px' }}>
                          <Truck size={14} /> {rating.deliveryBoyName}
                        </div>
                      ) : (
                        <span className="text-muted text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="text-muted font-body" style={{ fontSize: '13px', maxWidth: '250px' }}>
                      {rating.comment ? `"${rating.comment}"` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRatings;
