import { useRef, useState, useEffect } from "react";

interface MaskDrawingCanvasProps {
  imageUrl: string;
  onMaskGenerated: (maskDataUrl: string) => void;
  width: number;
  height: number;
}

const MaskDrawingCanvas: React.FC<MaskDrawingCanvasProps> = ({
  imageUrl,
  onMaskGenerated,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [isEraser, setIsEraser] = useState(false);

  // Initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !maskCtx) return;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    maskCanvas.width = width;
    maskCanvas.height = height;
    
    // Clear mask canvas with black background
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    // Load and draw the background image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageUrl;
  }, [imageUrl, width, height]);

  // Handle drawing
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !maskCtx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Draw on display canvas
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw on mask canvas
    maskCtx.globalCompositeOperation = "source-over";
    maskCtx.fillStyle = isEraser ? "black" : "white";
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearMask = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !maskCtx) return;
    
    // Clear mask canvas
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    // Redraw the background image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageUrl;
  };

  const handleApplyMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    // Get the mask data URL
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    onMaskGenerated(maskDataUrl);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Display canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair border rounded-lg"
          style={{ 
            width: '100%', 
            maxWidth: '672px',
            height: 'auto'
          }}
        />
        {/* Hidden mask canvas */}
        <canvas
          ref={maskCanvasRef}
          style={{ display: 'none' }}
        />
      </div>
      
      <div className="flex flex-wrap justify-center mt-4 gap-3">
        <div className="flex items-center">
          <label htmlFor="brushSize" className="mr-2 text-sm font-medium">Brush Size:</label>
          <input
            id="brushSize"
            type="range"
            min="10"
            max="80"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="ml-2 text-sm">{brushSize}px</span>
        </div>
        
        <button
          onClick={() => setIsEraser(false)}
          className={`btn-sm ${!isEraser ? "btn-primary" : "btn-outline"}`}
        >
          Draw
        </button>
        
        <button
          onClick={() => setIsEraser(true)}
          className={`btn-sm ${isEraser ? "btn-primary" : "btn-outline"}`}
        >
          Erase
        </button>
        
        <button
          onClick={handleClearMask}
          className="btn-sm btn-secondary"
        >
          Clear All
        </button>
        
        <button
          onClick={handleApplyMask}
          className="btn-sm btn-default"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default MaskDrawingCanvas;