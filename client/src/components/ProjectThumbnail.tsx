'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';

interface ProjectThumbnailProps {
  src?: string | null;
  alt: string;
  className?: string;
  children?: React.ReactNode; 
}

export default function ProjectThumbnail({ src, alt, className, children }: ProjectThumbnailProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`${className} relative overflow-hidden bg-gray-100 group`}>
      {!src || imageError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 border-b border-gray-100">
          <ImageIcon className="text-gray-300 w-8 h-8 opacity-50" />
        </div>
      ) : (
        <Image 
          src={src} 
          alt={alt} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      )}
      
      {/* This renders your custom overlays (Gradient, Status, Buttons) */}
      {children}
    </div>
  );
}