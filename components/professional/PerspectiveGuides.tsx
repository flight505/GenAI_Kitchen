'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Eye, Grid3x3, Move } from 'lucide-react';

interface PerspectiveGuidesProps {
  imageUrl: string;
  visible: boolean;
  onToggle: () => void;
  className?: string;
}

export function PerspectiveGuides({ 
  imageUrl, 
  visible, 
  onToggle,
  className = '' 
}: PerspectiveGuidesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vanishingPoint, setVanishingPoint] = useState({ x: 0.5, y: 0.3 });
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw perspective lines
      ctx.strokeStyle = '#C19A5B';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);

      const vpX = canvas.width * vanishingPoint.x;
      const vpY = canvas.height * vanishingPoint.y;

      // Draw lines from corners to vanishing point
      const corners = [
        { x: 0, y: 0 },
        { x: canvas.width, y: 0 },
        { x: 0, y: canvas.height },
        { x: canvas.width, y: canvas.height }
      ];

      corners.forEach(corner => {
        ctx.beginPath();
        ctx.moveTo(corner.x, corner.y);
        ctx.lineTo(vpX, vpY);
        ctx.stroke();
      });

      // Draw additional guide lines
      const divisions = 4;
      for (let i = 1; i < divisions; i++) {
        // Vertical divisions
        const x = (canvas.width / divisions) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(vpX, vpY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(vpX, vpY);
        ctx.stroke();

        // Horizontal divisions
        const y = (canvas.height / divisions) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(vpX, vpY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(canvas.width, y);
        ctx.lineTo(vpX, vpY);
        ctx.stroke();
      }

      // Draw grid if enabled
      if (showGrid) {
        ctx.strokeStyle = 'rgba(193, 154, 91, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 4]);

        const gridSize = 40;
        
        // Vertical lines
        for (let x = 0; x <= canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Draw vanishing point
      ctx.fillStyle = '#C19A5B';
      ctx.beginPath();
      ctx.arc(vpX, vpY, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw center cross
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(vpX - 6, vpY);
      ctx.lineTo(vpX + 6, vpY);
      ctx.moveTo(vpX, vpY - 6);
      ctx.lineTo(vpX, vpY + 6);
      ctx.stroke();
    };

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        draw();
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [visible, vanishingPoint, showGrid]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Check if click is near vanishing point
    const vpX = vanishingPoint.x;
    const vpY = vanishingPoint.y;
    const distance = Math.sqrt(Math.pow(x - vpX, 2) + Math.pow(y - vpY, 2));

    if (distance < 0.05) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setVanishingPoint({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!visible) return null;

  return (
    <div className={`absolute inset-0 ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-move z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg transition-colors ${
            showGrid 
              ? 'bg-unoform-gold text-white' 
              : 'bg-white/90 text-gray-700 hover:bg-white'
          }`}
          title="Toggle grid"
        >
          <Grid3x3 className="h-4 w-4" />
        </button>
        
        <button
          onClick={onToggle}
          className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
          title="Hide guides"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 z-20">
        <p className="text-xs text-gray-700 flex items-center gap-2">
          <Move className="h-3 w-3" />
          Drag the vanishing point to adjust perspective
        </p>
      </div>
    </div>
  );
}