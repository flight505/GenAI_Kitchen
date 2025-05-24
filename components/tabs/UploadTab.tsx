"use client";

import { UrlBuilder } from "@bytescale/sdk";
import { UploadWidgetConfig } from "@bytescale/upload-widget";
import { UploadDropzone } from "@bytescale/upload-widget-react";
import Image from "next/image";

interface UploadTabProps {
  originalPhoto: string | null;
  setOriginalPhoto: (url: string) => void;
  setPhotoName: (name: string) => void;
  addToHistory: (image: { url: string; type: string }) => void;
  setToast: (toast: { message: string; type: 'info' | 'success' | 'warning' | 'error' }) => void;
}

const options: UploadWidgetConfig = {
  apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      : "free",
  maxFileCount: 1,
  mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  maxFileSizeBytes: 5 * 1024 * 1024, // 5MB max file size
  editor: { images: { crop: false } },
  styles: {
    colors: {
      primary: "#C19A5B", // Unoform gold - Primary buttons & links
      error: "#D8594C", // Unoform red - Error messages
      shade100: "#000000", // Unoform black - Standard text
      shade200: "#FFFFFF", // White - Secondary button text
      shade300: "#FFFFFF", // White - Secondary button text (hover)
      shade400: "#4C4C4C", // Unoform gray-dark - Welcome text
      shade500: "#999999", // Unoform gray - Modal close button
      shade600: "#4C4C4C", // Unoform gray-dark - Border
      shade700: "#F2F2E5", // Unoform cream - Progress indicator background
      shade800: "#F2F2E5", // Unoform cream - File item background
      shade900: "#CCCCCC", // Unoform gray-light - Various (draggable crop buttons, etc.)
    },
    fontFamilies: {
      base: "Work Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    fontSizes: {
      base: 14,
    },
  },
};

export function UploadTab({
  originalPhoto,
  setOriginalPhoto,
  setPhotoName,
  addToHistory,
  setToast,
}: UploadTabProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-work font-medium text-unoform-gray-dark mb-2">
            Upload Your Kitchen Photo
          </h2>
          <p className="text-unoform-gray">
            Start by uploading a photo of your current kitchen. We'll maintain its structure while transforming the style.
          </p>
        </div>

        {!originalPhoto && (
          <UploadDropzone
            options={options}
            onUpdate={({ uploadedFiles }) => {
              if (uploadedFiles.length !== 0) {
                const image = uploadedFiles[0];
                const imageName = image.originalFile.originalFileName;
                const imageUrl = UrlBuilder.url({
                  accountId: image.accountId,
                  filePath: image.filePath,
                  options: {
                    transformation: "image",
                    transformationParams: {
                      "w": 1344,
                      "h": 768,
                      "f": "jpg",
                      "fit": "scale-down"
                    }
                  }
                });
                setPhotoName(imageName);
                setOriginalPhoto(imageUrl);
                // Add original photo to history
                addToHistory({
                  url: imageUrl,
                  type: 'original'
                });
                // Show notification about image processing
                const fileSize = image.originalFile.size;
                if (fileSize > 3 * 1024 * 1024) { // Over 3MB
                  setToast({
                    message: 'Large image uploaded. It will be automatically resized to 1344x768 pixels for optimal processing.',
                    type: 'info'
                  });
                } else {
                  setToast({
                    message: 'Image uploaded successfully! Your image will be optimized to 16:9 aspect ratio.',
                    type: 'success'
                  });
                }
              }
            }}
            width="100%"
            height="350px"
          />
        )}

        {originalPhoto && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-unoform-gray-dark">
              <Image
                alt="Original photo"
                src={originalPhoto}
                className="w-full"
                width={1344}
                height={768}
              />
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setOriginalPhoto(null)}
                className="btn-outline"
              >
                Replace Image
              </button>
              <button
                onClick={() => {
                  // Switch to design tab
                  const url = new URL(window.location.href);
                  url.searchParams.set('tab', 'design');
                  window.history.pushState({}, '', url);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="btn-default"
              >
                Continue to Design
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}