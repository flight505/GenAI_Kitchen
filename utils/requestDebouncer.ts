/**
 * Request debouncer and batcher for optimizing API calls
 */

interface PendingRequest<T> {
  id: string;
  request: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  timestamp: number;
}

interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number;
  key: (request: any) => string;
}

class RequestDebouncer {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private timers = new Map<string, NodeJS.Timeout>();
  private defaultDelay = 500; // 500ms default debounce
  
  /**
   * Debounce a request - if same request is made within delay, 
   * cancel previous and use latest
   */
  debounce<T>(
    key: string,
    request: () => Promise<T>,
    delay: number = this.defaultDelay
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Clear existing timer if any
      const existingTimer = this.timers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
        
        // Reject the previous request
        const existingRequest = this.pendingRequests.get(key);
        if (existingRequest) {
          existingRequest.reject(new Error('Request cancelled by newer request'));
        }
      }
      
      // Store the new request
      this.pendingRequests.set(key, {
        id: key,
        request,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      // Set new timer
      const timer = setTimeout(async () => {
        const pending = this.pendingRequests.get(key);
        if (!pending) return;
        
        try {
          const result = await pending.request();
          pending.resolve(result);
        } catch (error) {
          pending.reject(error);
        } finally {
          this.pendingRequests.delete(key);
          this.timers.delete(key);
        }
      }, delay);
      
      this.timers.set(key, timer);
    });
  }
  
  /**
   * Cancel a pending debounced request
   */
  cancel(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    
    const pending = this.pendingRequests.get(key);
    if (pending) {
      pending.reject(new Error('Request cancelled'));
      this.pendingRequests.delete(key);
    }
  }
  
  /**
   * Clear all pending requests
   */
  clearAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.pendingRequests.forEach(request => {
      request.reject(new Error('All requests cancelled'));
    });
    
    this.timers.clear();
    this.pendingRequests.clear();
  }
}

/**
 * Request batcher for combining multiple requests into one
 */
class RequestBatcher<T> {
  private batches = new Map<string, Array<PendingRequest<T>>>();
  private batchTimers = new Map<string, NodeJS.Timeout>();
  
  /**
   * Add a request to a batch
   */
  batch(
    batchKey: string,
    requestId: string,
    request: () => Promise<T>,
    config: Partial<BatchConfig> = {}
  ): Promise<T> {
    const { 
      maxBatchSize = 5, 
      maxWaitTime = 1000 
    } = config;
    
    return new Promise((resolve, reject) => {
      // Get or create batch
      let batch = this.batches.get(batchKey) || [];
      
      // Add request to batch
      batch.push({
        id: requestId,
        request,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.batches.set(batchKey, batch);
      
      // Process batch if it's full
      if (batch.length >= maxBatchSize) {
        this.processBatch(batchKey);
        return;
      }
      
      // Set timer if this is the first request in batch
      if (batch.length === 1) {
        const timer = setTimeout(() => {
          this.processBatch(batchKey);
        }, maxWaitTime);
        
        this.batchTimers.set(batchKey, timer);
      }
    });
  }
  
  /**
   * Process all requests in a batch
   */
  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) return;
    
    // Clear timer
    const timer = this.batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }
    
    // Remove batch from map
    this.batches.delete(batchKey);
    
    // Process all requests in parallel
    await Promise.all(
      batch.map(async (pending) => {
        try {
          const result = await pending.request();
          pending.resolve(result);
        } catch (error) {
          pending.reject(error);
        }
      })
    );
  }
}

// Export singleton instances
export const requestDebouncer = new RequestDebouncer();
export const requestBatcher = new RequestBatcher();

// Export types
export type { PendingRequest, BatchConfig };