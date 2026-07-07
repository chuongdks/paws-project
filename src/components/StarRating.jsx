import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 'h-4 w-4' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-icon-faint'}`}
        />
      ))}
    </div>
  );
}
