'use client';

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ProjectThumbnailProps {
  src?: string | null;
  alt: string;
  className?: string;
  children?: React.ReactNode; // For overlays like Delete button or Status badge
}

export default function ProjectThumbnail({ src, alt, className, children }: ProjectThumbnailProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`${className} relative overflow-hidden bg-gray-100`}>
      {!src || imageError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 border-b border-gray-100">
          <ImageIcon className="text-gray-300 w-8 h-8 opacity-50" />
        </div>
      ) : (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      )}
      
      {/* Overlays (Gradient, Badges, Buttons) */}
      {children}
    </div>
  );
}