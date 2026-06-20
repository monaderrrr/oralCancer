import React, { useEffect, useState } from 'react';
import { Download, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  fileName?: string;
}

export function FilePreviewModal({ isOpen, onClose, filePath, fileName }: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [useImageFallback, setUseImageFallback] = useState(false);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

  const buildFileUrl = (path: string) => {
    const trimmedPath = path.trim();

    if (/^https?:\/\//i.test(trimmedPath)) {
      return trimmedPath.replace(/\/\/+uploads\//i, '/uploads/');
    }

    const normalizedPath = trimmedPath.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/\/+/, '/');
    const uploadPath = normalizedPath.startsWith('uploads/')
      ? normalizedPath
      : `uploads/${normalizedPath}`;

    return `${apiBaseUrl}/${uploadPath}`;
  };

  const fileUrl = buildFileUrl(filePath);
  const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
  const isPdf = extension === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
  const fileType = isPdf ? 'PDF' : isImage ? 'IMAGE' : 'UNSUPPORTED';

  useEffect(() => {
    if (isOpen) {
      setLoading(isPdf || isImage);
      setError(null);
      setZoom(1);
      setUseImageFallback(false);
    }
  }, [isOpen, filePath, isPdf, isImage]);

  useEffect(() => {
    if (!isOpen || (!isPdf && !isImage)) return;

    let isActive = true;

    const verifyFileExists = async () => {
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });

        if (!isActive) return;

        if (!response.ok) {
          setLoading(false);
          setError('Document not found or unavailable.');
        }
      } catch {
        if (!isActive) return;
        setLoading(false);
        setError('Document not found or unavailable.');
      }
    };

    verifyFileExists();

    return () => {
      isActive = false;
    };
  }, [isOpen, isPdf, isImage, fileUrl]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (!isOpen) return;

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    if (isImage && !useImageFallback) {
      setUseImageFallback(true);
      setLoading(true);
      return;
    }

    setLoading(false);
    setError('Document not found or unavailable.');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || filePath.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));

  const zoomClass = zoom <= 0.75
    ? 'scale-75'
    : zoom <= 1
      ? 'scale-100'
      : zoom <= 1.25
        ? 'scale-125'
        : zoom <= 1.5
          ? 'scale-150'
          : zoom <= 1.75
            ? 'scale-175'
            : zoom <= 2
              ? 'scale-200'
              : zoom <= 2.5
                ? 'scale-250'
                : 'scale-300';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {fileName || filePath.split('/').pop() || 'Document Preview'}
            </h3>
            <span className="text-sm text-gray-500">({fileType})</span>
          </div>

          <div className="flex items-center gap-2">
            {isImage && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}

            {!error && (isImage || isPdf) && (
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative overflow-auto max-h-[calc(90vh-80px)] bg-gray-50">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
              <span className="ml-2 text-gray-600">Loading document...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-red-500 mb-2">Document unavailable</div>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!error && isPdf && (
            <div className="w-full h-[70vh]">
              <iframe
                src={fileUrl}
                width="100%"
                height="700"
                className="border-0"
                title={fileName || 'Document Preview'}
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          )}

          {!error && isImage && !useImageFallback && (
            <div className="w-full h-[70vh]">
              <iframe
                src={fileUrl}
                width="100%"
                height="700"
                className="border-0"
                title={fileName || 'Document Preview'}
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          )}

          {!error && isImage && useImageFallback && (
            <div className="flex justify-center p-4">
              <img
                src={fileUrl}
                alt="Document"
                className={`max-w-full max-h-[80vh] object-contain transition-transform duration-200 ease-in-out ${zoomClass}`}
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          )}

          {!error && !isImage && !isPdf && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-600">Preview is available for JPG, JPEG, PNG, WebP, and PDF files.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
