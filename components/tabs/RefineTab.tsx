"use client";

import ModernInpaintUI from "../ModernInpaintUI";

interface RefineTabProps {
  restoredImage: string | null;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  inpaintPrompt: string;
  setInpaintPrompt: (prompt: string) => void;
  inpainting: boolean;
  inpaintPhoto: (maskDataUrl: string, promptText?: string) => Promise<void>;
}

export function RefineTab({
  restoredImage,
  editMode,
  setEditMode,
  inpaintPrompt,
  setInpaintPrompt,
  inpainting,
  inpaintPhoto,
}: RefineTabProps) {
  if (!restoredImage) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center p-8">
          <h2 className="text-2xl font-work font-medium text-unoform-gray-dark mb-4">
            Refine Your Design
          </h2>
          <p className="text-unoform-gray mb-6">
            Generate a kitchen design first, then use this tab to refine specific areas.
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
            Refine Your Design
          </h2>
          <p className="text-unoform-gray">
            Click "Edit Areas" to draw on the image and specify what changes you want in those areas.
          </p>
        </div>

        <ModernInpaintUI
          imageUrl={restoredImage}
          onMaskGenerated={async (maskUrl, prompt) => {
            // Set the prompt first, then call inpaintPhoto with both maskUrl and prompt
            setInpaintPrompt(prompt);
            // Need to pass the prompt directly since state might not update immediately
            await inpaintPhoto(maskUrl, prompt);
          }}
          isProcessing={inpainting}
        />
      </div>
    </div>
  );
}