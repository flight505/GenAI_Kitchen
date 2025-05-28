'use client';

import React, { useState } from 'react';
import { 
  FileText,
  Image,
  FileSpreadsheet,
  Presentation,
  Download,
  Check,
  Info,
  Package,
  Layers,
  FileImage
} from 'lucide-react';
import downloadPhoto from '@/utils/downloadPhoto';

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  format: 'image' | 'pdf' | 'presentation' | 'package';
  includes: string[];
  action: (data: ExportData) => void | Promise<void>;
}

export interface ExportData {
  sourceImage?: string;
  resultImage: string;
  scenario: string;
  model: string;
  parameters: Record<string, any>;
  prompt: string;
  timestamp: Date;
  cost?: number;
  processingTime?: number;
  referenceImages?: Array<{ url: string; role?: string }>;
}

interface ExportTemplatesProps {
  data: ExportData;
  onExport?: (template: ExportTemplate) => void;
  className?: string;
}

// Export template configurations
const exportTemplates: ExportTemplate[] = [
  {
    id: 'high-res-image',
    name: 'High Resolution Image',
    description: 'Full quality result image for presentations',
    icon: <Image className="h-5 w-5" />,
    format: 'image',
    includes: ['Result image at full resolution', 'No compression or watermarks'],
    action: (data) => {
      const filename = `unoform-kitchen-${data.scenario}-${Date.now()}.jpg`;
      downloadPhoto(data.resultImage, filename);
    }
  },
  {
    id: 'comparison-sheet',
    name: 'Before/After Comparison',
    description: 'Side-by-side comparison for client presentations',
    icon: <Layers className="h-5 w-5" />,
    format: 'image',
    includes: ['Original and result images', 'Split view comparison', 'Project details overlay'],
    action: async (data) => {
      // Create canvas for side-by-side comparison
      if (!data.sourceImage) return;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Load images
      const img1 = new window.Image();
      const img2 = new window.Image();
      
      img1.crossOrigin = 'anonymous';
      img2.crossOrigin = 'anonymous';
      
      await new Promise((resolve) => {
        let loaded = 0;
        const checkLoaded = () => {
          loaded++;
          if (loaded === 2) resolve(true);
        };
        img1.onload = checkLoaded;
        img2.onload = checkLoaded;
        img1.src = data.sourceImage!;
        img2.src = data.resultImage;
      });
      
      // Set canvas size (double width for side-by-side)
      canvas.width = img1.width * 2;
      canvas.height = img1.height;
      
      // Draw images side by side
      ctx.drawImage(img1, 0, 0);
      ctx.drawImage(img2, img1.width, 0);
      
      // Add labels
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Work Sans';
      ctx.textAlign = 'center';
      ctx.fillText('BEFORE', img1.width / 2, canvas.height - 20);
      ctx.fillText('AFTER', img1.width + (img1.width / 2), canvas.height - 20);
      
      // Download the comparison
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const filename = `unoform-comparison-${Date.now()}.jpg`;
          downloadPhoto(url, filename);
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);
    }
  },
  {
    id: 'project-summary',
    name: 'Project Summary PDF',
    description: 'Comprehensive PDF with all project details',
    icon: <FileText className="h-5 w-5" />,
    format: 'pdf',
    includes: [
      'High-res images',
      'Technical specifications',
      'Design parameters',
      'Cost breakdown',
      'Unoform branding'
    ],
    action: async (data) => {
      // In a real implementation, this would use a PDF library like jsPDF
      // For now, we'll create a detailed summary and trigger print dialog
      const summary = `
        <html>
          <head>
            <title>Unoform Kitchen Design - ${new Date().toLocaleDateString()}</title>
            <style>
              body { 
                font-family: 'Work Sans', sans-serif; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 40px;
                color: #4C4C4C;
              }
              .header { 
                border-bottom: 3px solid #C19A5B; 
                padding-bottom: 20px; 
                margin-bottom: 30px;
              }
              .logo { 
                color: #C19A5B; 
                font-size: 28px; 
                font-weight: 500;
                letter-spacing: 2.63px;
              }
              .section { 
                margin: 30px 0; 
                page-break-inside: avoid;
              }
              .section-title { 
                color: #C19A5B; 
                font-size: 20px; 
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1.5px;
              }
              .detail-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 8px 0;
                border-bottom: 1px solid #eee;
              }
              .images { 
                display: flex; 
                gap: 20px; 
                margin: 20px 0;
              }
              .image-container {
                flex: 1;
                text-align: center;
              }
              .image-container img { 
                width: 100%; 
                height: auto;
                border: 1px solid #ddd;
                border-radius: 8px;
              }
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                color: #999;
                font-size: 12px;
              }
              @media print {
                body { padding: 20px; }
                .section { page-break-inside: avoid; }
                .images img { max-height: 400px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="logo">UNOFORM</h1>
              <h2>Kitchen Design Proposal</h2>
              <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="section">
              <h3 class="section-title">Project Overview</h3>
              <div class="detail-row">
                <span>Scenario:</span>
                <strong>${data.scenario.replace('-', ' ').toUpperCase()}</strong>
              </div>
              <div class="detail-row">
                <span>AI Model:</span>
                <strong>${data.model}</strong>
              </div>
              <div class="detail-row">
                <span>Processing Time:</span>
                <strong>${data.processingTime ? `${data.processingTime}s` : 'N/A'}</strong>
              </div>
              <div class="detail-row">
                <span>Estimated Cost:</span>
                <strong>$${data.cost?.toFixed(3) || '0.000'}</strong>
              </div>
            </div>
            
            <div class="section">
              <h3 class="section-title">Design Visualization</h3>
              <div class="images">
                ${data.sourceImage ? `
                  <div class="image-container">
                    <img src="${data.sourceImage}" alt="Original" />
                    <p>Original Space</p>
                  </div>
                ` : ''}
                <div class="image-container">
                  <img src="${data.resultImage}" alt="Design Result" />
                  <p>Proposed Design</p>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h3 class="section-title">Design Specifications</h3>
              <p><strong>Design Brief:</strong></p>
              <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                ${data.prompt}
              </p>
              
              <p><strong>Technical Parameters:</strong></p>
              ${Object.entries(data.parameters).map(([key, value]) => `
                <div class="detail-row">
                  <span>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                  <strong>${value}</strong>
                </div>
              `).join('')}
            </div>
            
            ${data.referenceImages && data.referenceImages.length > 0 ? `
              <div class="section">
                <h3 class="section-title">Reference Materials</h3>
                <div class="images">
                  ${data.referenceImages.map((ref, i) => `
                    <div class="image-container">
                      <img src="${ref.url}" alt="Reference ${i + 1}" />
                      <p>Reference ${i + 1}${ref.role ? ` (${ref.role})` : ''}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Unoform. All rights reserved.</p>
              <p>This design proposal is confidential and proprietary.</p>
            </div>
          </body>
        </html>
      `;
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(summary);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  },
  {
    id: 'client-presentation',
    name: 'Client Presentation',
    description: 'Ready-to-present slideshow format',
    icon: <Presentation className="h-5 w-5" />,
    format: 'presentation',
    includes: [
      'Cover slide with project info',
      'Before/after comparison',
      'Design details',
      'Material specifications',
      'Next steps'
    ],
    action: (data) => {
      // In production, this would generate a PowerPoint or Google Slides file
      // For now, we'll create an HTML presentation
      const presentation = `
        <html>
          <head>
            <title>Unoform Kitchen Presentation</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: 'Work Sans', sans-serif;
                background: #1a1a1a;
                color: white;
                overflow: hidden;
              }
              .slide {
                width: 100vw;
                height: 100vh;
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 60px;
                box-sizing: border-box;
              }
              .slide.active { display: flex; }
              .slide h1 { 
                font-size: 60px; 
                margin: 0 0 30px 0;
                color: #C19A5B;
                letter-spacing: 3px;
              }
              .slide h2 { 
                font-size: 40px; 
                margin: 0 0 20px 0;
                font-weight: 300;
              }
              .slide img { 
                max-width: 80%; 
                max-height: 70vh; 
                object-fit: contain;
                border-radius: 10px;
                box-shadow: 0 10px 50px rgba(0,0,0,0.5);
              }
              .controls {
                position: fixed;
                bottom: 30px;
                right: 30px;
                display: flex;
                gap: 15px;
                z-index: 100;
              }
              .controls button {
                background: #C19A5B;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .controls button:hover {
                background: #D4B07A;
              }
              .slide-number {
                position: fixed;
                bottom: 30px;
                left: 30px;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <!-- Slide 1: Title -->
            <div class="slide active" data-slide="1">
              <h1>UNOFORM</h1>
              <h2>Your Dream Kitchen Awaits</h2>
              <p style="font-size: 24px; color: #999; margin-top: 40px;">
                ${new Date().toLocaleDateString()}
              </p>
            </div>
            
            <!-- Slide 2: Current Space -->
            ${data.sourceImage ? `
              <div class="slide" data-slide="2">
                <h2>Your Current Space</h2>
                <img src="${data.sourceImage}" alt="Current Kitchen" />
              </div>
            ` : ''}
            
            <!-- Slide 3: Proposed Design -->
            <div class="slide" data-slide="3">
              <h2>Our Vision for Your Kitchen</h2>
              <img src="${data.resultImage}" alt="Proposed Design" />
            </div>
            
            <!-- Slide 4: Design Details -->
            <div class="slide" data-slide="4">
              <h2>Design Highlights</h2>
              <div style="text-align: left; max-width: 800px;">
                <p style="font-size: 24px; line-height: 1.8;">
                  ${data.prompt.split('.').slice(0, 3).join('.<br>')}
                </p>
              </div>
            </div>
            
            <!-- Slide 5: Next Steps -->
            <div class="slide" data-slide="5">
              <h2>Ready to Transform Your Kitchen?</h2>
              <p style="font-size: 28px; margin: 40px 0;">
                Let's make this vision a reality.
              </p>
              <p style="font-size: 20px; color: #C19A5B;">
                Contact your Unoform representative today
              </p>
            </div>
            
            <div class="controls">
              <button onclick="previousSlide()">Previous</button>
              <button onclick="nextSlide()">Next</button>
            </div>
            
            <div class="slide-number">
              <span id="current">1</span> / <span id="total">5</span>
            </div>
            
            <script>
              let currentSlide = 1;
              const totalSlides = document.querySelectorAll('.slide').length;
              document.getElementById('total').textContent = totalSlides;
              
              function showSlide(n) {
                const slides = document.querySelectorAll('.slide');
                if (n > totalSlides) currentSlide = 1;
                if (n < 1) currentSlide = totalSlides;
                
                slides.forEach(slide => slide.classList.remove('active'));
                slides[currentSlide - 1].classList.add('active');
                document.getElementById('current').textContent = currentSlide;
              }
              
              function nextSlide() {
                currentSlide++;
                showSlide(currentSlide);
              }
              
              function previousSlide() {
                currentSlide--;
                showSlide(currentSlide);
              }
              
              // Keyboard navigation
              document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') nextSlide();
                if (e.key === 'ArrowLeft') previousSlide();
              });
            </script>
          </body>
        </html>
      `;
      
      // Open presentation in new window
      const presentWindow = window.open('', '_blank');
      if (presentWindow) {
        presentWindow.document.write(presentation);
        presentWindow.document.close();
      }
    }
  },
  {
    id: 'project-package',
    name: 'Complete Project Package',
    description: 'ZIP file with all assets and documentation',
    icon: <Package className="h-5 w-5" />,
    format: 'package',
    includes: [
      'All images in high resolution',
      'Project specifications (JSON)',
      'PDF summary',
      'Design notes',
      'Readme file'
    ],
    action: async (data) => {
      // This would use a library like JSZip in production
      // For now, we'll show what would be included
      alert(`Project Package would include:
      
• Original image (if available)
• Result image (high resolution)
• ${data.referenceImages?.length || 0} reference images
• project-details.json with all parameters
• design-summary.pdf
• readme.txt with project overview
• Generated on: ${new Date().toLocaleString()}

This feature requires JSZip library for full implementation.`);
    }
  }
];

export function ExportTemplates({ data, onExport, className }: ExportTemplatesProps) {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  
  const handleExport = async (template: ExportTemplate) => {
    setExportingId(template.id);
    
    try {
      await template.action(data);
      setCompletedIds(prev => new Set(prev).add(template.id));
      if (onExport) onExport(template);
      
      // Reset completed state after 3 seconds
      setTimeout(() => {
        setCompletedIds(prev => {
          const next = new Set(prev);
          next.delete(template.id);
          return next;
        });
      }, 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportingId(null);
    }
  };
  
  const getFormatColor = (format: string) => {
    switch (format) {
      case 'image': return 'text-blue-600 bg-blue-100';
      case 'pdf': return 'text-red-600 bg-red-100';
      case 'presentation': return 'text-purple-600 bg-purple-100';
      case 'package': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Export Options</h3>
        <p className="text-xs text-gray-500">Download your design in various formats</p>
      </div>
      
      <div className="space-y-3">
        {exportTemplates.map((template) => {
          const isExporting = exportingId === template.id;
          const isCompleted = completedIds.has(template.id);
          
          return (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getFormatColor(template.format)}`}>
                  {template.icon}
                </div>
                
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {template.description}
                  </p>
                  
                  <div className="space-y-1 mb-3">
                    {template.includes.map((item, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleExport(template)}
                    disabled={isExporting || !data.resultImage}
                    className={`
                      px-3 py-1.5 rounded text-xs font-medium transition-all
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isExporting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-unoform-gold text-white hover:bg-opacity-90'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center gap-2
                    `}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="h-3 w-3" />
                        Exported
                      </>
                    ) : isExporting ? (
                      <>
                        <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        Export
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-amber-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-600 mt-0.5" />
          <div>
            <p className="text-xs text-amber-900 font-medium">Export Requirements</p>
            <p className="text-xs text-amber-700 mt-0.5">
              High-resolution exports work best with stable internet. 
              PDF and presentation formats open in a new window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}