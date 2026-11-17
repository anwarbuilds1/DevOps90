'use client';

import React from 'react';
import { X, Download } from 'lucide-react';
import { ImageItem } from '@/types/tracker';

interface LightboxModalProps {
  image: ImageItem | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.u;
    link.download = `devops-diagram-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[92vh] flex flex-col items-center justify-center bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Top Controls */}
        <div className="w-full flex items-center justify-between px-3 py-2 text-white">
          <p className="text-xs text-slate-300 font-medium truncate max-w-md">
            {image.c || 'Architecture Diagram / Screenshot'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.u}
          alt={image.c || 'Zoomed diagram'}
          className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg border border-slate-800 bg-white dark:bg-slate-900"
        />

        {/* Caption */}
        {image.c && (
          <p className="mt-2 text-xs text-slate-400 text-center px-4 pb-1">
            {image.c}
          </p>
        )}
      </div>
    </div>
  );
};
