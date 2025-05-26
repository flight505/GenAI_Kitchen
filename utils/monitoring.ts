import redis from './redis';

export interface APIUsageMetrics {
  endpoint: string;
  userId?: string;
  timestamp: number;
  success: boolean;
  cost?: number;
  modelVersion?: string;
  error?: string;
}

export interface UsageSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  estimatedCost: number;
  byEndpoint: Record<string, number>;
  byUser: Record<string, number>;
  byDay: Record<string, number>;
}

// Cost estimates per model (in USD)
const MODEL_COSTS = {
  'flux-canny-pro': 0.05,      // $0.05 per generation
  'flux-fill-pro': 0.05,        // $0.05 per inpainting (legacy)
  'flux-dev': 0.05,             // $0.05 per flux-dev inpainting
  'flux-redux-dev': 0.03,       // $0.03 per variation
};

export class APIMonitor {
  private static instance: APIMonitor;
  
  private constructor() {}
  
  static getInstance(): APIMonitor {
    if (!APIMonitor.instance) {
      APIMonitor.instance = new APIMonitor();
    }
    return APIMonitor.instance;
  }

  async trackUsage(metrics: APIUsageMetrics): Promise<void> {
    if (!redis) {
      console.warn('Redis not configured - skipping usage tracking');
      return;
    }

    try {
      const key = `api_usage:${new Date().toISOString().split('T')[0]}`;
      const data = JSON.stringify(metrics);
      
      // Store in a sorted set with timestamp as score
      await redis.zadd(key, {
        score: metrics.timestamp,
        member: data
      });
      
      // Set expiration to 90 days
      await redis.expire(key, 90 * 24 * 60 * 60);
      
      // Track daily counters
      await this.updateDailyCounters(metrics);
      
      // Check for alerts
      await this.checkAlerts(metrics);
    } catch (error) {
      console.error('Failed to track API usage:', error);
    }
  }

  private async updateDailyCounters(metrics: APIUsageMetrics): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const counterKey = `api_counters:${date}`;
    
    // Increment total requests
    await redis?.hincrby(counterKey, 'total', 1);
    
    // Increment success/failure counters
    if (metrics.success) {
      await redis?.hincrby(counterKey, 'success', 1);
    } else {
      await redis?.hincrby(counterKey, 'failed', 1);
    }
    
    // Increment endpoint-specific counter
    await redis?.hincrby(counterKey, `endpoint:${metrics.endpoint}`, 1);
    
    // Increment user-specific counter if userId is provided
    if (metrics.userId) {
      await redis?.hincrby(counterKey, `user:${metrics.userId}`, 1);
    }
    
    // Update cost estimate
    if (metrics.cost && redis) {
      const currentCostResult = await redis.hget(counterKey, 'cost');
      const currentCost = typeof currentCostResult === 'string' ? parseFloat(currentCostResult) : 0;
      const newCost = currentCost + metrics.cost;
      await redis.hset(counterKey, { cost: newCost.toFixed(2) });
    }
    
    // Set expiration
    await redis?.expire(counterKey, 90 * 24 * 60 * 60);
  }

  private async checkAlerts(metrics: APIUsageMetrics): Promise<void> {
    // Check daily usage limits
    const date = new Date().toISOString().split('T')[0];
    const counterKey = `api_counters:${date}`;
    
    const dailyTotalResult = await redis?.hget(counterKey, 'total');
    const dailyCostResult = await redis?.hget(counterKey, 'cost');
    
    const dailyTotalStr = typeof dailyTotalResult === 'string' ? dailyTotalResult : null;
    const dailyCostStr = typeof dailyCostResult === 'string' ? dailyCostResult : null;
    
    // Alert thresholds
    const MAX_DAILY_REQUESTS = 1000;
    const MAX_DAILY_COST = 50; // $50
    
    if (dailyTotalStr) {
      const dailyTotal = parseInt(dailyTotalStr);
      if (dailyTotal > MAX_DAILY_REQUESTS) {
        console.error(`ALERT: Daily request limit exceeded! ${dailyTotal} requests`);
        // In production, this would send an email/Slack notification
      }
    }
    
    if (dailyCostStr) {
      const dailyCost = parseFloat(dailyCostStr);
      if (dailyCost > MAX_DAILY_COST) {
        console.error(`ALERT: Daily cost limit exceeded! $${dailyCost}`);
        // In production, this would send an email/Slack notification
      }
    }
    
    // Check for high failure rate
    const failedResult = await redis?.hget(counterKey, 'failed');
    const successResult = await redis?.hget(counterKey, 'success');
    
    const failedStr = typeof failedResult === 'string' ? failedResult : null;
    const successStr = typeof successResult === 'string' ? successResult : null;
    
    if (failedStr && successStr) {
      const failed = parseInt(failedStr);
      const success = parseInt(successStr);
      const failureRate = failed / (failed + success);
      if (failureRate > 0.2) { // 20% failure rate
        console.error(`ALERT: High failure rate detected! ${(failureRate * 100).toFixed(1)}%`);
      }
    }
  }

  async getUsageSummary(days: number = 7): Promise<UsageSummary> {
    const summary: UsageSummary = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      estimatedCost: 0,
      byEndpoint: {},
      byUser: {},
      byDay: {}
    };

    if (!redis) {
      return summary;
    }

    try {
      // Get data for the last N days
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const counterKey = `api_counters:${dateStr}`;
        
        const counters = await redis.hgetall(counterKey);
        if (!counters || typeof counters !== 'object') continue;
        
        // Aggregate totals
        const totalValue = counters.total;
        const dayTotal = typeof totalValue === 'string' ? parseInt(totalValue) : 0;
        summary.totalRequests += dayTotal;
        
        const successValue = counters.success;
        summary.successfulRequests += typeof successValue === 'string' ? parseInt(successValue) : 0;
        
        const failedValue = counters.failed;
        summary.failedRequests += typeof failedValue === 'string' ? parseInt(failedValue) : 0;
        
        const costValue = counters.cost;
        summary.estimatedCost += typeof costValue === 'string' ? parseFloat(costValue) : 0;
        
        // Store daily totals
        summary.byDay[dateStr] = dayTotal;
        
        // Aggregate by endpoint
        Object.entries(counters).forEach(([key, value]) => {
          if (key.startsWith('endpoint:') && typeof value === 'string') {
            const endpoint = key.replace('endpoint:', '');
            summary.byEndpoint[endpoint] = (summary.byEndpoint[endpoint] || 0) + parseInt(value);
          }
          // Aggregate by user
          if (key.startsWith('user:') && typeof value === 'string') {
            const user = key.replace('user:', '');
            summary.byUser[user] = (summary.byUser[user] || 0) + parseInt(value);
          }
        });
      }
    } catch (error) {
      console.error('Failed to get usage summary:', error);
    }

    return summary;
  }

  estimateCost(modelType: string): number {
    return MODEL_COSTS[modelType as keyof typeof MODEL_COSTS] || 0.05;
  }
}