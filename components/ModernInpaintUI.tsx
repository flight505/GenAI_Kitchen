import { useState } from 'react';
import MaskDrawingCanvas from './MaskDrawingCanvas';

interface ModernInpaintUIProps {
  imageUrl: string;
  onMaskGenerated: (maskUrl: string, prompt: string) => void;
  isProcessing: boolean;
}

export default function ModernInpaintUI({ 
  imageUrl, 
  onMaskGenerated, 
  isProcessing 
}: ModernInpaintUIProps) {
  const [prompt, setPrompt] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  return (
    <div className="card mt-6 p-0 overflow-hidden">
      <div className="card-header bg-muted/50">
        <h3 className="card-title text-lg">Edit Your Kitchen</h3>
        <p className="card-description">
          Describe what you want to change and draw over the area to modify
        </p>
      </div>
      
      <div className="card-content space-y-4">
        <div className="space-y-2">
          <label htmlFor="inpaint-prompt" className="label">
            What would you like to change?
          </label>
          <input
            id="inpaint-prompt"
            type="text"
            placeholder="e.g., 'make the cabinets white' or 'add marble countertops'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="input-modern"
            disabled={isProcessing}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="label">Draw over the area to change</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDrawing(true)}
                className={`btn-sm ${isDrawing ? 'btn-default' : 'btn-outline'}`}
                disabled={isProcessing}
              >
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                  />
                </svg>
                Draw
              </button>
              <button
                onClick={() => setIsDrawing(false)}
                className={`btn-sm ${!isDrawing ? 'btn-default' : 'btn-outline'}`}
                disabled={isProcessing}
              >
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
                Clear
              </button>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <MaskDrawingCanvas
              imageUrl={imageUrl}
              onMaskGenerated={(maskUrl) => {
                console.log('Mask generated, prompt:', prompt);
                if (prompt.trim()) {
                  onMaskGenerated(maskUrl, prompt);
                } else {
                  alert('Please enter a description of what you want to change');
                }
              }}
              width={1344}
              height={768}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span>Use your mouse or touch to paint over the areas you want to change</span>
        </div>
      </div>

      <div className="card-footer bg-muted/30">
        <button
          onClick={() => {
            if (prompt.trim()) {
              // Trigger the mask generation
              const canvas = document.querySelector('canvas');
              if (canvas) {
                canvas.dispatchEvent(new Event('mouseup'));
              }
            }
          }}
          disabled={!prompt.trim() || isProcessing}
          className="btn-default btn-md w-full"
        >
          {isProcessing ? (
            <span className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          ) : (
            <>
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              Apply Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}