import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next"; 

interface Props {
  onCapture: (file: File) => void;
  onClose: () => void;
  answers?: Record<string, string>;
}

export function CameraCapture({ onCapture, onClose }: Props) {
  const { t } = useTranslation(); 
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      setStream(s);
      setPermission("granted");
    } catch (err) {
      console.error(err);
      setPermission("denied");
      alert(t("camera.alertNotWorking", "Camera not working"));
    }
  };

  const isImageBlurry = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let sum = 0;

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sum += gray;
    }

    const avg = sum / (data.length / 4);

    let variance = 0;

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      variance += Math.pow(gray - avg, 2);
    }

    variance /= (data.length / 4);

    return variance < 500;
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    if (isImageBlurry(canvas)) {
      alert(t("camera.alertBlurry", "The image is not clear ❌ Try to steady your hand and take another picture"));
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "image.jpg", { type: "image/jpeg" });

      setPreview(URL.createObjectURL(blob));

      onCapture(file);

    }, "image/jpeg");
  };

  return (
    <div className="bg-white p-4 rounded-xl text-center">

      {permission === "denied" && (
        <p className="text-red-500">{t("camera.accessDenied", "Camera access denied")}</p>
      )}

      {permission === "granted" && !preview && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 bg-black rounded"
          />

          <div className="flex gap-2 justify-center mt-4">
            <button
              onClick={capture}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {t("camera.captureBtn", "Capture")}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-200 rounded"
            >
              {t("camera.closeBtn", "Close")}
            </button>
          </div>
        </>
      )}

      {preview && (
        <>
          <img src={preview} className="rounded mb-4" alt="Captured preview" />

          <p className="text-sm text-gray-500">
            {t("camera.processing", "Processing image...")}
          </p>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}