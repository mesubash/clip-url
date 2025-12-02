import { useEffect, useRef } from "react";

interface QRCodePreviewProps {
  value: string;
  size?: number;
}

export function QRCodePreview({ value, size = 120 }: QRCodePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple QR-like pattern generator (placeholder - would use real QR library in production)
    const cellSize = size / 25;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = "hsl(220, 20%, 10%)";
    
    // Generate pseudo-random pattern based on URL hash
    const hash = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Draw finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = "hsl(220, 20%, 10%)";
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(size - cellSize * 7, 0);
    drawFinderPattern(0, size - cellSize * 7);

    // Fill with pattern
    for (let i = 8; i < 17; i++) {
      for (let j = 8; j < 17; j++) {
        if ((hash * (i + 1) * (j + 1)) % 3 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    // Timing patterns
    for (let i = 8; i < 17; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
        ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }, [value, size]);

  if (!value) {
    return (
      <div 
        className="bg-muted rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-muted-foreground">QR Code</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg"
    />
  );
}
