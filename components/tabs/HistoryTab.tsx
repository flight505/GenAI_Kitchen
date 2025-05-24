"use client";

import Image from "next/image";
import { Undo2, Redo2, Download } from "lucide-react";
import downloadPhoto from "../../utils/downloadPhoto";

interface HistoryTabProps {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  getCurrentImage: () => any;
  history: any[];
}

export function HistoryTab({
  canUndo,
  canRedo,
  undo,
  redo,
  getCurrentImage,
  history,
}: HistoryTabProps) {
  const currentImage = getCurrentImage();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-work font-medium text-unoform-gray-dark mb-2">
            Design History
          </h2>
          <p className="text-unoform-gray mb-4">
            Navigate through your design iterations and download any version.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`btn-outline flex items-center space-x-2 ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Undo2 size={18} />
              <span>Undo</span>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`btn-outline flex items-center space-x-2 ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Redo2 size={18} />
              <span>Redo</span>
            </button>
          </div>
        </div>

        {/* Current Image Display */}
        {currentImage && (
          <div className="space-y-4">
            <h3 className="text-lg font-work font-medium text-unoform-gray-dark">
              Current Design
            </h3>
            <div className="relative rounded-lg overflow-hidden border border-unoform-gray-dark">
              <Image
                alt="Current design"
                src={currentImage.url}
                className="w-full"
                width={1344}
                height={768}
              />
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={() => downloadPhoto(currentImage.url, `kitchen-design-${Date.now()}.jpg`)}
                  className="btn-default flex items-center space-x-2 bg-white/90 backdrop-blur"
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
              </div>
            </div>
            {currentImage.prompt && (
              <div className="p-4 bg-unoform-cream rounded-lg">
                <p className="text-sm text-unoform-gray">
                  <span className="font-medium">Type:</span> {currentImage.type}
                </p>
                {currentImage.prompt && (
                  <p className="text-sm text-unoform-gray mt-1">
                    <span className="font-medium">Prompt:</span> {currentImage.prompt}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* History Timeline */}
        {history.length > 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-work font-medium text-unoform-gray-dark">
              Previous Versions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.slice(0, -1).reverse().map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-unoform-gray-light hover:border-unoform-gray-dark transition-colors cursor-pointer">
                    <Image
                      alt={`History ${index + 1}`}
                      src={item.url}
                      className="w-full"
                      width={336}
                      height={192}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  </div>
                  <p className="text-xs text-unoform-gray text-center">
                    {item.type === 'original' ? 'Original' : 
                     item.type === 'inpainted' ? 'Refined' : 'Generated'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length === 0 && (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-unoform-gray">No design history yet. Start by uploading and generating a design.</p>
          </div>
        )}
      </div>
    </div>
  );
}