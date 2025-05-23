# API Usage Monitoring Guide

## Overview

GenAI Kitchen includes comprehensive API usage monitoring to track Replicate API calls, estimate costs, and alert on anomalies.

## Features

### Real-time Usage Tracking
- Tracks all API calls to Replicate (generate, inpaint, variation)
- Records success/failure status
- Captures user information (for authenticated requests)
- Estimates costs based on model pricing

### Admin Dashboard
Access the monitoring dashboard at `/admin` (requires admin login).

Features include:
- Total requests and success rate
- Estimated costs and cost per request
- Usage breakdown by endpoint
- Usage breakdown by user
- Daily usage trends
- Automatic alerts for high usage/cost/failure rates

### Alerts
The system automatically checks for:
- **High Usage**: More than 1000 requests per day
- **High Cost**: More than $50 per day
- **High Failure Rate**: More than 20% failure rate

## Setup Instructions

### 1. Enable Monitoring
Monitoring is automatically enabled when Redis is configured. Ensure your environment variables include:
```bash
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 2. Access Admin Dashboard
1. Login with admin credentials:
   - Username: `unoform_admin`
   - Password: `UnoKitchen2024!`
2. Navigate to `/admin` to view usage statistics

### 3. Configure Replicate Webhooks (Optional)
For more accurate tracking, configure Replicate to send webhooks:

1. Go to your Replicate dashboard
2. Navigate to Webhooks settings
3. Add webhook URL: `https://your-domain.com/api/webhooks/replicate`
4. Select events: "prediction.completed"

### 4. Customize Alert Thresholds
Edit `/utils/monitoring.ts` to adjust alert thresholds:
```typescript
const MAX_DAILY_REQUESTS = 1000;  // Adjust as needed
const MAX_DAILY_COST = 50;        // In USD
```

## API Usage Endpoint

### GET /api/admin/usage
Requires admin authentication.

Query parameters:
- `days`: Number of days to include (default: 7)

Response format:
```json
{
  "period": "Last 7 days",
  "summary": {
    "totalRequests": 142,
    "successfulRequests": 138,
    "failedRequests": 4,
    "successRate": "97.2%",
    "estimatedCost": "$7.10",
    "avgCostPerRequest": "$0.050"
  },
  "breakdown": {
    "byEndpoint": {
      "generate": 89,
      "inpaint": 32,
      "variation": 21
    },
    "byUser": {
      "demo_user": 45,
      "design_team": 67,
      "unoform_admin": 30
    },
    "byDay": {
      "2024-01-20": 23,
      "2024-01-21": 18,
      ...
    }
  },
  "alerts": {
    "highUsage": false,
    "highCost": false,
    "highFailureRate": false
  }
}
```

## Cost Estimates

Current model pricing (estimated):
- **Flux Canny Pro**: $0.05 per generation
- **Flux Fill Pro**: $0.05 per inpainting
- **Flux Redux Dev**: $0.03 per variation

These estimates can be updated in `/utils/monitoring.ts`.

## Data Retention

Usage data is automatically retained for 90 days in Redis. After this period, old data is automatically purged.

## Security Considerations

1. Admin dashboard is protected by authentication
2. Only `unoform_admin` user can access usage statistics
3. Webhook endpoint validates payload structure
4. Consider implementing webhook signature verification for production

## Monitoring Best Practices

1. **Review Daily**: Check the admin dashboard daily for anomalies
2. **Set Budget Alerts**: Configure notifications when approaching budget limits
3. **Monitor Failure Rates**: High failure rates may indicate API issues
4. **Track User Patterns**: Identify heavy users or unusual usage patterns
5. **Export Data**: Periodically export usage data for long-term analysis

## Troubleshooting

### No Data Showing
1. Verify Redis is properly configured
2. Check Redis connection in logs
3. Ensure API routes include monitoring calls

### Incorrect Costs
1. Update model pricing in `MODEL_COSTS` object
2. Verify model version detection in tracking code

### Missing User Information
1. Ensure auth token is passed in API requests
2. Check token verification in monitoring code