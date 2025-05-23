import { NextResponse } from "next/server";
import { APIMonitor } from "../../../../utils/monitoring";

// Replicate webhook for tracking completed predictions
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Verify webhook is from Replicate (in production, verify signature)
    if (!data.id || !data.status) {
      return new Response("Invalid webhook payload", { status: 400 });
    }
    
    // Only track completed predictions
    if (data.status !== 'succeeded' && data.status !== 'failed') {
      return NextResponse.json({ received: true });
    }
    
    const monitor = APIMonitor.getInstance();
    
    // Determine endpoint based on model
    let endpoint = 'unknown';
    let modelType = 'unknown';
    
    if (data.version) {
      if (data.version.includes('flux-canny-pro')) {
        endpoint = 'generate';
        modelType = 'flux-canny-pro';
      } else if (data.version.includes('flux-fill-pro')) {
        endpoint = 'inpaint';
        modelType = 'flux-fill-pro';
      } else if (data.version.includes('flux-redux')) {
        endpoint = 'variation';
        modelType = 'flux-redux-dev';
      }
    }
    
    // Track the usage
    await monitor.trackUsage({
      endpoint,
      timestamp: new Date(data.completed_at || data.created_at).getTime(),
      success: data.status === 'succeeded',
      cost: monitor.estimateCost(modelType),
      modelVersion: data.version,
      error: data.error
    });
    
    return NextResponse.json({ 
      received: true,
      tracked: true,
      prediction_id: data.id
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}