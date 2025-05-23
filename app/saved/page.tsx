"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getCurrentUser, authenticatedFetch } from "../../utils/auth";

interface SavedImage {
  id: string;
  imageUrl: string;
  originalImageUrl?: string;
  prompt: string;
  designSelections?: any;
  timestamp: number;
  type: 'generated' | 'inpainted' | 'variation';
}

export default function SavedDesignsPage() {
  const [user, setUser] = useState<any>(null);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    fetchSavedImages();
  }, [router]);

  const fetchSavedImages = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch("/api/save");
      const data = await response.json();
      
      if (response.ok) {
        setSavedImages(data.images || []);
      } else {
        setError(data.error || "Failed to load saved designs");
      }
    } catch (error) {
      setError("Failed to load saved designs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inpainted':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'variation':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="loading-dots mb-4">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="text-neutral-600">Loading your saved designs...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            My Saved Designs
          </h1>
          <p className="text-neutral-600">
            {user?.username && `Welcome back, ${user.username}! `}
            View and manage your saved kitchen designs.
          </p>
        </div>

        {error && (
          <div className="card bg-red-50 border border-red-200 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {savedImages.length === 0 ? (
          <div className="card bg-white border border-neutral-200 shadow-soft p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No saved designs yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Start creating kitchen designs and save your favorites to see them here.
            </p>
            <button
              onClick={() => router.push("/dream")}
              className="btn-default hover-lift"
            >
              Create Your First Design
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedImages.map((image) => (
              <div key={image.id} className="card bg-white border border-neutral-200 shadow-soft overflow-hidden hover-lift transition-all duration-200">
                <div className="aspect-square relative">
                  <Image
                    src={image.imageUrl}
                    alt="Saved kitchen design"
                    fill
                    className="object-cover cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                      <span className="text-neutral-600">{getTypeIcon(image.type)}</span>
                      <span className="text-xs font-medium text-neutral-700 capitalize">
                        {image.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                    {image.prompt}
                  </p>
                  <p className="text-xs text-neutral-500 mb-3">
                    {formatDate(image.timestamp)}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="btn-outline btn-sm flex-1 hover-lift"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = image.imageUrl;
                        link.download = `unoform-kitchen-${image.id}.png`;
                        link.click();
                      }}
                      className="btn-secondary btn-sm hover-lift"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Kitchen Design Details
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    {getTypeIcon(selectedImage.type)}
                    <span className="capitalize">{selectedImage.type}</span>
                    <span>•</span>
                    <span>{formatDate(selectedImage.timestamp)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Image
                    src={selectedImage.imageUrl}
                    alt="Kitchen design"
                    width={500}
                    height={500}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-2">Design Prompt</h4>
                    <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                      {selectedImage.prompt}
                    </p>
                  </div>
                  
                  {selectedImage.designSelections && (
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">Design Selections</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedImage.designSelections).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-neutral-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                            </span>
                            <span className="font-medium text-neutral-900">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedImage.imageUrl;
                        link.download = `unoform-kitchen-${selectedImage.id}.png`;
                        link.click();
                      }}
                      className="btn-default flex-1 hover-lift"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={() => router.push("/dream")}
                      className="btn-outline flex-1 hover-lift"
                    >
                      Create New Design
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}