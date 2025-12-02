import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodePreviewProps {
  value: string;
  size?: number;
  showDownload?: boolean;
}

export function QRCodePreview({ value, size = 120, showDownload = false }: QRCodePreviewProps) {
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

  const handleDownload = useCallback(async () => {
    if (!value) return;
    
    try {
      const dataUrl = await QRCode.toDataURL(value, {
        width: 512,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      });
      
      const link = document.createElement("a");
      link.download = `qr-${value.split("/").pop() || "code"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      console.error("Failed to download QR code");
    }
  }, [value]);

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
    <div className="relative group">
      <canvas
        ref={canvasRef}
        className="rounded-lg"
      />
      {showDownload && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          onClick={handleDownload}
          title="Download QR Code"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
