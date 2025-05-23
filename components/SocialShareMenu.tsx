import { useState } from 'react';
import downloadPhoto from '../utils/downloadPhoto';

interface SocialShareMenuProps {
  imageUrl: string;
  kitchenPrompt: string;
  onClose?: () => void;
}

export default function SocialShareMenu({ imageUrl, kitchenPrompt, onClose }: SocialShareMenuProps) {
  const [isGeneratingWatermark, setIsGeneratingWatermark] = useState(false);

  // Social media dimensions
  const socialDimensions = [
    { name: 'Instagram Square', width: 1080, height: 1080, ratio: '1:1' },
    { name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16' },
    { name: 'Twitter/X Post', width: 1200, height: 675, ratio: '16:9' },
    { name: 'Facebook Post', width: 1200, height: 630, ratio: '1.91:1' },
    { name: 'LinkedIn Post', width: 1200, height: 627, ratio: '1.91:1' },
  ];

  // Generate sharing text
  const getShareText = (platform: 'instagram' | 'twitter' | 'linkedin') => {
    const baseText = `Just designed my dream kitchen with Unoform! ${kitchenPrompt}`;
    
    switch (platform) {
      case 'instagram':
        return `${baseText} #UnoformKitchen #KitchenDesign #DanishDesign #ScandinavianStyle #KitchenInspiration #InteriorDesign`;
      case 'twitter':
        return `${baseText} @Unoform #UnoformKitchen #KitchenDesign #DanishDesign #AI`;
      case 'linkedin':
        return `${baseText} Experience the future of kitchen design with Unoform's AI-powered design tool.`;
      default:
        return baseText;
    }
  };

  // Add Unoform watermark to image
  const addWatermarkToImage = async (originalImageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        const watermarkText = 'Designed with Unoform';
        const fontSize = Math.max(16, img.width / 40);
        
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        
        // Position watermark in bottom right
        const padding = fontSize;
        const textWidth = ctx.measureText(watermarkText).width;
        const x = img.width - textWidth - padding;
        const y = img.height - padding;
        
        // Add background for better readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - padding/2, y - fontSize - padding/2, textWidth + padding, fontSize + padding);
        
        // Draw watermark text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillText(watermarkText, x, y);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = originalImageUrl;
    });
  };

  // Download with watermark
  const handleDownloadWithWatermark = async () => {
    setIsGeneratingWatermark(true);
    try {
      const watermarkedImage = await addWatermarkToImage(imageUrl);
      
      // Create download link
      const link = document.createElement('a');
      link.href = watermarkedImage;
      link.download = `unoform-kitchen-design-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to add watermark:', error);
      // Fallback to regular download
      downloadPhoto(imageUrl, `unoform-kitchen-design-${Date.now()}`);
    }
    setIsGeneratingWatermark(false);
  };

  // Resize image for social media
  const resizeImageForSocial = (width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        
        // Calculate scaling to cover the entire canvas while maintaining aspect ratio
        const scale = Math.max(width / img.width, height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center the image
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        
        // Fill background with Unoform brand color
        ctx.fillStyle = '#FAFAFA';
        ctx.fillRect(0, 0, width, height);
        
        // Draw the scaled image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Add Unoform branding
        const brandText = 'Designed with Unoform';
        const fontSize = Math.max(14, width / 50);
        
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        
        const padding = fontSize;
        const textWidth = ctx.measureText(brandText).width;
        const textX = width - textWidth - padding;
        const textY = height - padding;
        
        ctx.fillText(brandText, textX, textY);
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  };

  // Share on Instagram (opens Instagram with image)
  const shareOnInstagram = () => {
    // Instagram doesn't support direct URL sharing, so we'll copy text and show instructions
    navigator.clipboard.writeText(getShareText('instagram'));
    alert('Caption copied to clipboard! Now download the image and share it on Instagram.');
  };

  // Share on Twitter/X
  const shareOnTwitter = () => {
    const text = encodeURIComponent(getShareText('twitter'));
    const url = encodeURIComponent(window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  // Share on LinkedIn
  const shareOnLinkedIn = () => {
    const text = encodeURIComponent(getShareText('linkedin'));
    const url = encodeURIComponent(window.location.href);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  // Download for specific social platform
  const downloadForSocial = async (dimension: typeof socialDimensions[0]) => {
    try {
      const resizedImage = await resizeImageForSocial(dimension.width, dimension.height);
      
      const link = document.createElement('a');
      link.href = resizedImage;
      link.download = `unoform-kitchen-${dimension.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to resize image:', error);
    }
  };

  return (
    <div className="card mt-6">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title text-lg">Share Your Design</h3>
            <p className="card-description">
              Share your beautiful kitchen design with the world
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="btn-ghost btn-sm"
              aria-label="Close sharing menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="card-content space-y-6">
        {/* Quick Social Sharing */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Share on Social Media</h4>
          <div className="flex gap-3">
            <button
              onClick={shareOnInstagram}
              className="btn-outline btn-sm flex items-center gap-2 hover:bg-pink-50 hover:border-pink-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </button>
            <button
              onClick={shareOnTwitter}
              className="btn-outline btn-sm flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter/X
            </button>
            <button
              onClick={shareOnLinkedIn}
              className="btn-outline btn-sm flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Download for Social Media</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {socialDimensions.map((dimension) => (
              <button
                key={dimension.name}
                onClick={() => downloadForSocial(dimension)}
                className="btn-outline btn-sm text-left flex items-center justify-between"
              >
                <span>{dimension.name}</span>
                <span className="text-xs text-muted-foreground">{dimension.ratio}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Watermark Option */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Branded Download</h4>
          <button
            onClick={handleDownloadWithWatermark}
            disabled={isGeneratingWatermark}
            className="btn-secondary btn-md w-full"
          >
            {isGeneratingWatermark ? (
              <span className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download with Unoform Watermark
              </>
            )}
          </button>
        </div>

        {/* Share Text Preview */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Share Text</h4>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">{getShareText('instagram')}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(getShareText('instagram'))}
            className="btn-ghost btn-sm"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}