import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

export const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Important for CORS
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      const fileUrl = URL.createObjectURL(blob);
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    }, 'image/jpeg');
  });
};

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropCompleteWrapper = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    setError(null);
    try {
      const base64Image = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(base64Image);
    } catch (e: any) {
      console.error(e);
      setError("Failed to crop image. It might be blocked by CORS rules from the image host.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col h-[80vh]">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold">Crop Image</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>
        
        <div className="relative flex-grow bg-gray-900 w-full min-h-[300px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteWrapper}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="p-6 bg-white border-t border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            
            {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
            
            <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={onCancel} 
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold text-gray-700"
                >
                    Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleCrop} 
                  disabled={isProcessing}
                  className="px-6 py-2 bg-spirit-900 text-white rounded-lg hover:bg-spirit-800 font-bold min-w-[120px]"
                >
                    {isProcessing ? 'Processing...' : 'Apply Crop'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
