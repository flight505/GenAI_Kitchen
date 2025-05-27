import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/server-auth';
import Replicate from 'replicate';
import { MODEL_CONFIGS } from '@/constants/models';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY as string,
});

interface BatchOperation {
  id: string;
  modelId: string;
  parameters: Record<string, any>;
  input: Record<string, any>;
}

interface BatchResult {
  id: string;
  status: 'success' | 'failed';
  output?: string;
  error?: string;
  cost: number;
  processingTime: number;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyToken(token);

    const { operations, options } = await request.json();

    if (!Array.isArray(operations) || operations.length === 0) {
      return NextResponse.json({ error: 'No operations provided' }, { status: 400 });
    }

    // Limit batch size to prevent abuse
    if (operations.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 operations per batch' }, { status: 400 });
    }

    const results: BatchResult[] = [];
    const startTime = Date.now();

    // Process operations
    for (const operation of operations) {
      try {
        const result = await processOperation(operation);
        results.push(result);
        
        // Add delay between operations to respect rate limits
        if (operations.indexOf(operation) < operations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        results.push({
          id: operation.id,
          status: 'failed',
          error: error.message || 'Operation failed',
          cost: 0,
          processingTime: 0
        });
      }
    }

    const totalTime = Date.now() - startTime;
    const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
    const successCount = results.filter(r => r.status === 'success').length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: operations.length,
        successful: successCount,
        failed: operations.length - successCount,
        totalCost,
        totalTime: Math.round(totalTime / 1000),
      }
    });

  } catch (error: any) {
    console.error('Batch processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Batch processing failed' },
      { status: 500 }
    );
  }
}

async function processOperation(operation: BatchOperation): Promise<BatchResult> {
  const startTime = Date.now();
  
  try {
    const modelConfig = MODEL_CONFIGS[operation.modelId];
    if (!modelConfig) {
      throw new Error(`Unknown model: ${operation.modelId}`);
    }

    // Merge default parameters with operation parameters
    const input = {
      ...modelConfig.parameters.defaults,
      ...operation.parameters,
      ...operation.input
    };

    // Run the model
    const modelIdentifier = `${modelConfig.replicateId}:${modelConfig.version}` as `${string}/${string}:${string}`;
    const output = await replicate.run(
      modelIdentifier,
      { input }
    );

    // Extract result URL
    const resultUrl = Array.isArray(output) ? output[0] : output;

    const processingTime = (Date.now() - startTime) / 1000;

    return {
      id: operation.id,
      status: 'success',
      output: resultUrl,
      cost: modelConfig.costPerRun,
      processingTime
    };

  } catch (error: any) {
    const processingTime = (Date.now() - startTime) / 1000;
    
    return {
      id: operation.id,
      status: 'failed',
      error: error.message || 'Processing failed',
      cost: 0,
      processingTime
    };
  }
}

// GET endpoint to check batch status (if using async processing)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyToken(token);

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID required' }, { status: 400 });
    }

    // In a real implementation, you would fetch batch status from a database
    // For now, return a mock response
    return NextResponse.json({
      batchId,
      status: 'completed',
      message: 'Batch processing status would be fetched from database'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get batch status' },
      { status: 500 }
    );
  }
}