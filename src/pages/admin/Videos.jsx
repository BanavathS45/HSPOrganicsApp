import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { videoService } from '../../firebase/db';
import { useToast } from '../../components/Toast';
import { Video, Plus, Trash2, ExternalLink } from 'lucide-react';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
};

const AdminVideos = () => {
  const { videos } = useApp();
  const { toast, confirm } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    category: 'Cultivation'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const sanitizedUrl = getYouTubeEmbedUrl(formData.url);
      await videoService.add({ ...formData, url: sanitizedUrl });
      setFormData({ title: '', description: '', url: '', thumbnail: '', category: 'Cultivation' });
      setShowAddForm(false);
      toast.success('Video added successfully! 🎬', 'Video Added');
    } catch (err) {
      toast.error(err.message.includes('permissions') ? 'Firebase rules not yet deployed. Please publish rules in Firebase Console.' : 'Error adding video: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm('This video will be permanently removed from the storefront.', {
      title: 'Remove Video?', confirmLabel: 'Remove', cancelLabel: 'Cancel', danger: true,
    });
    if (ok) { await videoService.delete(id); toast.success('Video removed.'); }
  };

  return (
    <div className="container-fluid animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="font-heading fw-extrabold text-success m-0 d-flex align-items-center gap-2">
          <Video size={24} /> Cultivation Videos
        </h4>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-success d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm"
        >
          {showAddForm ? 'Cancel' : <><Plus size={18} /> Add Video</>}
        </button>
      </div>

      {showAddForm && (
        <div className="card glass-card border-0 shadow-sm p-4 rounded-4 mb-4">
          <h5 className="font-heading fw-bold text-success mb-3">Add New Video</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label font-heading text-xs fw-bold">Video Title</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Organic Spinach Harvesting"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label font-heading text-xs fw-bold">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Cultivation">Cultivation</option>
                  <option value="Processing">Processing</option>
                  <option value="Harvest">Harvest</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label font-heading text-xs fw-bold">YouTube Embed URL</label>
                <input
                  type="url"
                  className="form-control"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
              <div className="col-md-6">
                <label className="form-label font-heading text-xs fw-bold">Thumbnail URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div className="col-12">
                <label className="form-label font-heading text-xs fw-bold">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the video content..."
                ></textarea>
              </div>
              <div className="col-12 text-end mt-3">
                <button type="submit" className="btn btn-success rounded-pill px-4" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Video'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="row g-4">
        {videos.map((vid) => (
          <div key={vid.id} className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="position-relative" style={{ height: '200px' }}>
                <iframe
                  src={getYouTubeEmbedUrl(vid.url)}
                  title={vid.title}
                  className="w-100 h-100 border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="font-heading fw-bold text-success m-0">{vid.title}</h6>
                  <span className="badge bg-light text-dark border">{vid.category}</span>
                </div>
                <p className="text-muted font-body text-xs mb-3">{vid.description}</p>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <span className="text-muted" style={{ fontSize: '11px' }}>
                    Added: {new Date(vid.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(vid.id)}
                    className="btn btn-outline-danger btn-sm rounded-pill d-flex align-items-center gap-1 px-3 py-1"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <div className="col-12 text-center py-5">
            <p className="text-muted font-body">No videos uploaded yet. Click "Add Video" to add some!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVideos;
