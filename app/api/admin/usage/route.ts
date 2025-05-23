import { NextResponse } from "next/server";
import { APIMonitor } from "../../../../utils/monitoring";
import { verifyToken } from "../../../../utils/server-auth";

export async function GET(request: Request) {
  try {
    // Verify admin access
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = await verifyToken(token);
    
    // Only allow admin users to view usage stats
    if (payload.username !== 'unoform_admin') {
      return new Response("Forbidden - Admin access required", { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');
    
    // Get usage summary
    const monitor = APIMonitor.getInstance();
    const summary = await monitor.getUsageSummary(days);
    
    // Calculate additional metrics
    const successRate = summary.totalRequests > 0 
      ? ((summary.successfulRequests / summary.totalRequests) * 100).toFixed(1)
      : '0';
    
    const avgCostPerRequest = summary.totalRequests > 0
      ? (summary.estimatedCost / summary.totalRequests).toFixed(3)
      : '0';
    
    const response = {
      period: `Last ${days} days`,
      summary: {
        totalRequests: summary.totalRequests,
        successfulRequests: summary.successfulRequests,
        failedRequests: summary.failedRequests,
        successRate: `${successRate}%`,
        estimatedCost: `$${summary.estimatedCost.toFixed(2)}`,
        avgCostPerRequest: `$${avgCostPerRequest}`
      },
      breakdown: {
        byEndpoint: summary.byEndpoint,
        byUser: summary.byUser,
        byDay: summary.byDay
      },
      alerts: {
        highUsage: summary.totalRequests > (days * 100), // More than 100 requests per day average
        highCost: summary.estimatedCost > (days * 10), // More than $10 per day average
        highFailureRate: parseFloat(successRate) < 80
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return new Response("Failed to fetch usage statistics", { status: 500 });
  }
}