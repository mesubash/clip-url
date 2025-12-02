import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRCodePreviewProps {
  value: string;
  size?: number;
}

export function QRCodePreview({ value, size = 120 }: QRCodePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    
    setError(false);
    
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: {
        dark: "#0f172a", // slate-900
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    }).catch(() => {
      setError(true);
    });
  }, [value, size]);

  if (!value || error) {
    return (
      <div 
        className="bg-muted rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-muted-foreground">
          {error ? "Error" : "QR Code"}
        </span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg"
    />
  );
}
