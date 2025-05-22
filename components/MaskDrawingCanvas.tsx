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
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isEraser, setIsEraser] = useState(false);

  // Load the background image when the component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear the canvas with a transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create an image element to load the background
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageUrl;
  }, [imageUrl, width, height]);

  // Handle mouse events for drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    
    if (isEraser) {
      // For eraser, we're revealing the original image
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      // For brush, we're masking (painting white)
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
    }
    
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleClearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw the background image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageUrl;
  };

  const handleApplyMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a new canvas for the mask only
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    
    // Set background to black
    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    // Copy the white parts from the drawing canvas
    maskCtx.globalCompositeOperation = "source-over";
    
    // Get the original canvas data
    const originalCanvas = canvasRef.current;
    if (!originalCanvas) return;
    const originalCtx = originalCanvas.getContext('2d');
    if (!originalCtx) return;
    
    const imageData = originalCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Create a new ImageData for the mask
    const maskImageData = maskCtx.createImageData(canvas.width, canvas.height);
    const maskData = maskImageData.data;
    
    // For each pixel, if it's not the background image color, make it white in the mask
    for (let i = 0; i < data.length; i += 4) {
      // If pixel has any transparency (was drawn on), make it white in the mask
      if (data[i + 3] < 255) {
        maskData[i] = 255;     // R
        maskData[i + 1] = 255; // G
        maskData[i + 2] = 255; // B
        maskData[i + 3] = 255; // A
      }
    }
    
    // Put the mask data on the mask canvas
    maskCtx.putImageData(maskImageData, 0, 0);
    
    // Get the data URL of the mask canvas
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    
    // Call the callback with the mask data URL
    onMaskGenerated(maskDataUrl);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair"
          style={{ 
            width: `${width}px`, 
            height: `${height}px`,
            background: "transparent" 
          }}
        />
      </div>
      
      <div className="flex flex-wrap justify-center mt-4 gap-3">
        <div className="flex items-center">
          <label htmlFor="brushSize" className="mr-2 text-sm">Brush Size:</label>
          <input
            id="brushSize"
            type="range"
            min="5"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="ml-1 text-sm">{brushSize}px</span>
        </div>
        
        <button
          onClick={() => setIsEraser(false)}
          className={`px-3 py-1 text-sm rounded-md ${
            !isEraser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Brush
        </button>
        
        <button
          onClick={() => setIsEraser(true)}
          className={`px-3 py-1 text-sm rounded-md ${
            isEraser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Eraser
        </button>
        
        <button
          onClick={handleClearMask}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md"
        >
          Clear
        </button>
        
        <button
          onClick={handleApplyMask}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded-md"
        >
          Apply Inpaint
        </button>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        Paint over the areas you want to change
      </div>
    </div>
  );
};

export default MaskDrawingCanvas; 