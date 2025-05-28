'use client';

import React, { useState } from 'react';
import { UnoformCatalog, CatalogImage } from './UnoformCatalog';
import { 
  ArrowRight,
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface TestResult {
  catalogImage: CatalogImage;
  customerImage: string;
  resultImage?: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  processingTime?: number;
  model?: string;
}

export function StyleTransferTest() {
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogImage | null>(null);
  const [customerImage, setCustomerImage] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Sample customer kitchen images for testing
  const sampleCustomerImages = [
    {
      id: 'customer-1',
      url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop',
      description: 'Traditional kitchen needing update'
    },
    {
      id: 'customer-2',
      url: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=600&fit=crop',
      description: 'Dated kitchen with good bones'
    },
    {
      id: 'customer-3',
      url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop',
      description: 'Modern kitchen for style variation'
    }
  ];
  
  const runStyleTransferTest = async () => {
    if (!selectedCatalog || !customerImage) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    // Create test result entry
    const newTest: TestResult = {
      catalogImage: selectedCatalog,
      customerImage,
      status: 'processing',
      model: 'interior-design'
    };
    
    setTestResults(prev => [newTest, ...prev]);
    
    try {
      // Call the style transfer API
      const response = await fetch('/api/style-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceImage: customerImage,
          referenceImage: selectedCatalog.url,
          scenario: 'style-transfer',
          model: 'interior-specialized',
          parameters: {
            prompt: `Transform this kitchen to match the ${selectedCatalog.name} style from Unoform catalog. Apply ${selectedCatalog.materials.join(', ')} materials and ${selectedCatalog.description}. Maintain the original kitchen layout and structure.`,
            guidance_scale: 7.5,
            prompt_strength: 0.8,
            num_inference_steps: 30
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Style transfer failed');
      }
      
      const result = await response.json();
      const processingTime = (Date.now() - startTime) / 1000;
      
      // Update test result with success
      setTestResults(prev => prev.map((test, index) => 
        index === 0 
          ? {
              ...test,
              resultImage: result.imageUrl || result,
              status: 'success',
              processingTime
            }
          : test
      ));
      
    } catch (error) {
      // Update test result with error
      setTestResults(prev => prev.map((test, index) => 
        index === 0 
          ? {
              ...test,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : test
      ));
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Style Transfer Testing</h2>
        <p className="text-gray-600">Test how Unoform catalog styles apply to customer kitchens</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Customer Image Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">1. Select Customer Kitchen</h3>
          <div className="space-y-2">
            {sampleCustomerImages.map((img) => (
              <button
                key={img.id}
                onClick={() => setCustomerImage(img.url)}
                className={`
                  w-full text-left p-2 rounded-lg border transition-all
                  ${customerImage === img.url 
                    ? 'border-unoform-gold bg-unoform-gold/5' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={img.url} 
                    alt={img.description}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <p className="text-xs text-gray-600">{img.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Catalog Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">2. Select Unoform Style</h3>
          <UnoformCatalog
            onSelect={setSelectedCatalog}
            selectedId={selectedCatalog?.id}
            className="max-h-[400px] overflow-y-auto"
          />
        </div>
        
        {/* Test Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">3. Run Test</h3>
          
          {customerImage && selectedCatalog && (
            <div className="mb-4 space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src={customerImage} 
                  alt="Customer"
                  className="w-20 h-16 object-cover rounded"
                />
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <img 
                  src={selectedCatalog.url} 
                  alt={selectedCatalog.name}
                  className="w-20 h-16 object-cover rounded"
                />
              </div>
              
              <div className="text-xs text-gray-600">
                <p><strong>Style:</strong> {selectedCatalog.name}</p>
                <p><strong>Materials:</strong> {selectedCatalog.materials.join(', ')}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={runStyleTransferTest}
            disabled={!customerImage || !selectedCatalog || isProcessing}
            className={`
              w-full py-2 px-4 rounded-lg font-medium text-sm
              flex items-center justify-center gap-2
              transition-all
              ${(!customerImage || !selectedCatalog || isProcessing)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-unoform-gold text-white hover:bg-opacity-90'
              }
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Run Style Transfer
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Test Results */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Results</h3>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tests run yet. Select images above and run a test.</p>
        ) : (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium text-sm">
                      {result.catalogImage.name} Style Transfer
                    </span>
                    {result.processingTime && (
                      <span className="text-xs text-gray-500">
                        ({result.processingTime.toFixed(1)}s)
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Model: {result.model}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Customer Kitchen</p>
                    <img 
                      src={result.customerImage} 
                      alt="Customer"
                      className="w-full aspect-video object-cover rounded"
                    />
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Unoform Catalog</p>
                    <img 
                      src={result.catalogImage.url} 
                      alt={result.catalogImage.name}
                      className="w-full aspect-video object-cover rounded"
                    />
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Result</p>
                    {result.status === 'processing' ? (
                      <div className="w-full aspect-video bg-gray-100 rounded flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : result.status === 'success' && result.resultImage ? (
                      <img 
                        src={result.resultImage} 
                        alt="Result"
                        className="w-full aspect-video object-cover rounded"
                      />
                    ) : result.status === 'error' ? (
                      <div className="w-full aspect-video bg-red-50 rounded flex items-center justify-center p-4">
                        <p className="text-xs text-red-600 text-center">{result.error}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                {result.status === 'success' && (
                  <div className="mt-3 p-3 bg-green-50 rounded">
                    <p className="text-xs text-green-800">
                      <strong>Success:</strong> Style transfer completed. The {result.catalogImage.name} style 
                      has been successfully applied while maintaining the original kitchen structure.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}