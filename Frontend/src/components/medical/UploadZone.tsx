import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloudIcon,
  ImageIcon,
  CheckCircleIcon,
  LoaderIcon,
  AlertCircleIcon,
} from "lucide-react";
import { UploadState, UploadResult } from "./UploadType";

type UploadZoneProps = {
  onFileSelect: (file: File) => void;
  uploadProgress?: number;
  state?: UploadState; 
  result?: UploadResult;
};

export function UploadZone({
  onFileSelect,
  uploadProgress = 0,
  state = "idle", // default value
  result,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  // ✅ استخدمنا النوع الجديد اللي يشمل كل الحالات
  const currentState: UploadState = isDragging ? "dragging" : state;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full h-72
          border-2 border-dashed rounded-2xl cursor-pointer
          transition-all duration-300 ease-out
          ${
            currentState === "dragging"
              ? "border-teal-500 bg-teal-50 scale-[1.02]"
              : currentState === "complete"
              ? "border-emerald-400 bg-emerald-50"
              : currentState === "error"
              ? "border-red-400 bg-red-50"
              : "border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/50"
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="sr-only"
          disabled={state !== "idle"}
        />

        <AnimatePresence mode="wait">
          {currentState === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
                <UploadCloudIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-medium text-slate-700 mb-2">Drag and drop your image here</p>
              <p className="text-slate-500 mb-4">or click to browse</p>
              <span className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium">Select Image</span>
            </motion.div>
          )}

          {currentState === "dragging" && (
            <motion.div key="dragging" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-medium text-teal-700">Drop your image here</p>
            </motion.div>
          )}

          {currentState === "uploading" && (
            <motion.div key="uploading" className="flex flex-col items-center w-full px-12">
              <UploadCloudIcon className="w-10 h-10 text-teal-500 mb-3" />
              <p className="text-lg font-medium text-slate-700 mb-4">Uploading image...</p>
              <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-gradient-to-r from-teal-500 to-cyan-500" />
              </div>
              <p className="text-slate-500 mt-2">{uploadProgress}%</p>
            </motion.div>
          )}

          {currentState === "analyzing" && (
            <motion.div key="analyzing" className="flex flex-col items-center">
              <LoaderIcon className="w-10 h-10 text-teal-500 animate-spin mb-3" />
              <p className="text-lg font-medium text-slate-700">AI analyzing image...</p>
            </motion.div>
          )}

          {currentState === "complete" && (
            <motion.div key="complete" className="flex flex-col items-center">
              <CheckCircleIcon className="w-10 h-10 text-emerald-500 mb-3" />
              <p className="text-lg font-medium text-emerald-700">Analysis complete!</p>

              {result ? (
                <div className="mt-4 text-center">
                  <p className="font-semibold text-slate-900">Pattern Detected: {result.pattern}</p>
                  <p className="text-slate-600">AI Confidence: {result.confidence}%</p>
                </div>
              ) : (
                <p className="text-slate-500 mt-2">No pattern detected.</p>
              )}
            </motion.div>
          )}

          {currentState === "error" && (
            <motion.div key="error" className="flex flex-col items-center">
              <AlertCircleIcon className="w-10 h-10 text-red-500 mb-3" />
              <p className="text-lg font-medium text-red-600">Failed to analyze image. Please try again.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </label>
    </motion.div>
  );
}