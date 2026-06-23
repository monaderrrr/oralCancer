import React, { useState } from 'react';
import { FilePreviewModal } from '../components/FilePreviewModal';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next'; 

export function FilePreviewDemo() {
  const { t } = useTranslation(); 
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    filePath: '',
    fileName: '',
  });

  const openPreview = (filePath: string, fileName: string) => {
    setPreviewModal({
      isOpen: true,
      filePath,
      fileName,
    });
  };

  const closePreview = () => {
    setPreviewModal({
      isOpen: false,
      filePath: '',
      fileName: '',
    });
  };

  const sampleFiles = [
    { path: 'uploads/1776552024022-731564266.jpg', name: t('demo.files.jpg', 'Sample Image (JPG)') },
    { path: 'uploads/sample.pdf', name: t('demo.files.pdf', 'Sample PDF Document') },
    { path: 'uploads/sample.txt', name: t('demo.files.txt', 'Sample Text File (Unsupported)') },
  ];

  return (
    <div className="container mx-auto px-4 py-8 text-left" dir="ltr">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('demo.title', 'File Preview Modal Demo')}</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('demo.testTitle', 'Test File Previews')}</h2>
          <p className="text-gray-600 mb-6">
            {t('demo.description', 'Click the buttons below to test different file types in the preview modal. The modal supports images (JPG, PNG), PDFs, and shows appropriate messages for unsupported files.')}
          </p>

          <div className="space-y-3">
            {sampleFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({file.path})</span>
                </div>
                <Button
                  onClick={() => openPreview(file.path, file.name)}
                  variant="outline"
                  size="sm"
                >
                  {t('demo.btnPreview', 'Preview File')}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">{t('demo.features.title', 'Features:')}</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('demo.features.overlay', 'Modal overlay with dark background')}</li>
              <li>• {t('demo.features.close', 'Close button and ESC key support')}</li>
              <li>• {t('demo.features.zoom', 'Image zoom controls (zoom in/out)')}</li>
              <li>• {t('demo.features.download', 'Download button for all files')}</li>
              <li>• {t('demo.features.loading', 'Loading states and error handling')}</li>
              <li>• {t('demo.features.responsive', 'Responsive design')}</li>
              <li>• {t('demo.features.detection', 'File type detection and appropriate viewers')}</li>
            </ul>
          </div>
        </div>
      </div>

      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        filePath={previewModal.filePath}
        fileName={previewModal.fileName}
      />
    </div>
  );
}