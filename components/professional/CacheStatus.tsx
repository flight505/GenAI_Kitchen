'use client';

import React, { useState, useEffect } from 'react';
import { Database, Trash2, Info } from 'lucide-react';
import { imageCache } from '@/utils/imageCache';

interface CacheStatusProps {
  className?: string;
}

export function CacheStatus({ className }: CacheStatusProps) {
  const [stats, setStats] = useState(imageCache.getStats());
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    // Update stats every 5 seconds
    const interval = setInterval(() => {
      setStats(imageCache.getStats());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClearCache = () => {
    if (confirm('Clear all cached images? This cannot be undone.')) {
      imageCache.clear();
      setStats(imageCache.getStats());
    }
  };
  
  const getCacheAge = () => {
    if (!stats.oldestEntry) return 'Empty';
    const age = Date.now() - stats.oldestEntry;
    const minutes = Math.floor(age / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Database className="h-3 w-3" />
        <span>{stats.size}/{stats.maxSize} cached</span>
        {stats.size > 0 && (
          <>
            <span className="text-gray-400">•</span>
            <span>Oldest: {getCacheAge()}</span>
            <button
              onClick={handleClearCache}
              className="p-1 hover:bg-gray-100 rounded"
              title="Clear cache"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        )}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Info className="h-3 w-3" />
        </button>
      </div>
      
      {showInfo && (
        <div className="absolute top-6 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-64">
          <h4 className="text-xs font-medium text-gray-900 mb-2">Cache Information</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Images are cached for 1 hour</p>
            <p>• Cache speeds up identical requests</p>
            <p>• Maximum {stats.maxSize} images stored</p>
            <p>• Oldest entries removed when full</p>
          </div>
        </div>
      )}
    </div>
  );
}