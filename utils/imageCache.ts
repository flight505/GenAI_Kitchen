/**
 * Simple in-memory cache for generated images to avoid redundant API calls
 */

interface CacheEntry {
  key: string;
  value: string;
  timestamp: number;
  metadata?: {
    model: string;
    prompt: string;
    parameters: Record<string, any>;
  };
}

class ImageCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 50; // Maximum number of entries
  private maxAge: number = 3600000; // 1 hour in milliseconds
  
  /**
   * Generate a cache key from request parameters
   */
  generateKey(params: {
    sourceImage: string;
    prompt: string;
    model: string;
    parameters: Record<string, any>;
    referenceImages?: string[];
  }): string {
    const sortedParams = Object.keys(params.parameters)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params.parameters[key];
        return acc;
      }, {} as Record<string, any>);
    
    const keyData = {
      source: params.sourceImage,
      prompt: params.prompt,
      model: params.model,
      params: JSON.stringify(sortedParams),
      refs: params.referenceImages?.sort().join(',') || ''
    };
    
    // Create a simple hash from the key data
    return btoa(JSON.stringify(keyData))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
  }
  
  /**
   * Get a cached image if it exists and is still valid
   */
  get(key: string): string | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (LRU behavior)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }
  
  /**
   * Store an image in the cache
   */
  set(
    key: string, 
    value: string, 
    metadata?: CacheEntry['metadata']
  ): void {
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      key,
      value,
      timestamp: Date.now(),
      metadata
    });
  }
  
  /**
   * Check if a similar request was made recently (for debouncing)
   */
  hasRecentRequest(key: string, threshold: number = 2000): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    return Date.now() - entry.timestamp < threshold;
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    let oldest: number | null = null;
    let newest: number | null = null;
    
    this.cache.forEach(entry => {
      if (!oldest || entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }
      if (!newest || entry.timestamp > newest) {
        newest = entry.timestamp;
      }
    });
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      oldestEntry: oldest,
      newestEntry: newest
    };
  }
}

// Export singleton instance
export const imageCache = new ImageCache();

// Export type for use in components
export type { CacheEntry };