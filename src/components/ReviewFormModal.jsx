import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

export default function ReviewFormModal({ serviceName, onSave, onClose }) {
  const [rating, setRating]           = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment]         = useState('');
  const [error, setError]             = useState(null);

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    onSave({ rating, comment: comment.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-[2200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Write a Review</h2>
          <button onClick={onClose}
            className="text-slate-400 hover:text-slate-700 rounded-lg p-1 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500">
          How was your experience with <span className="font-semibold text-slate-700">{serviceName}</span>?
        </p>

        {/* Clickable star picker */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i} type="button"
              onClick={() => { setRating(i); setError(null); }}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star className={`h-8 w-8 ${
                (hoverRating || rating) >= i ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
              }`} />
            </button>
          ))}
        </div>

        <textarea
          rows={4}
          placeholder="Share details about your experience to help others in the community..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
}
