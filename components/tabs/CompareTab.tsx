"use client";

import Image from "next/image";
import { CompareSlider } from "../CompareSlider";

interface CompareTabProps {
  originalPhoto: string | null;
  restoredImage: string | null;
  sideBySide: boolean;
  setSideBySide: (value: boolean) => void;
}

export function CompareTab({
  originalPhoto,
  restoredImage,
  sideBySide,
  setSideBySide,
}: CompareTabProps) {
  if (!originalPhoto || !restoredImage) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center p-8">
          <h2 className="text-2xl font-work font-medium text-unoform-gray-dark mb-4">
            Compare Designs
          </h2>
          <p className="text-unoform-gray mb-6">
            Generate a kitchen design first to compare it with the original photo.
          </p>
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
            Go to Design Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-work font-medium text-unoform-gray-dark mb-2">
            Compare Your Designs
          </h2>
          <p className="text-unoform-gray mb-4">
            Compare your original kitchen with the AI-generated design.
          </p>
          
          <label className="inline-flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={sideBySide}
              onChange={(e) => setSideBySide(e.target.checked)}
              className="rounded border-unoform-gray-dark"
            />
            <span>Show side-by-side comparison</span>
          </label>
        </div>

        {sideBySide ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-center font-work font-medium text-unoform-gray-dark">Original</h3>
              <div className="rounded-lg overflow-hidden border border-unoform-gray-dark">
                <Image
                  alt="Original photo"
                  src={originalPhoto}
                  className="w-full"
                  width={1344}
                  height={768}
                />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-center font-work font-medium text-unoform-gray-dark">Generated</h3>
              <div className="rounded-lg overflow-hidden border border-unoform-gray-dark">
                <Image
                  alt="Generated photo"
                  src={restoredImage}
                  className="w-full"
                  width={1344}
                  height={768}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <CompareSlider
              original={originalPhoto}
              restored={restoredImage}
            />
          </div>
        )}
      </div>
    </div>
  );
}