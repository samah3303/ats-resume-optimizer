"use client";

import { useEffect, useRef } from "react";

interface AudioWaveformVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
}

export function AudioWaveformVisualizer({
  isListening,
  isSpeaking,
  isThinking,
}: AudioWaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw subtle baseline
      ctx.beginPath();
      ctx.strokeStyle = "#E4E4E7";
      ctx.lineWidth = 1;
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      const numBars = 48;
      const barWidth = 4;
      const gap = (width - numBars * barWidth) / (numBars + 1);

      for (let i = 0; i < numBars; i++) {
        const x = gap + i * (barWidth + gap);
        let amplitude = 4; // idle baseline

        if (isSpeaking) {
          // Dynamic wave for AI speaking
          amplitude = 8 + Math.sin(phase * 0.08 + i * 0.3) * 22 + Math.cos(phase * 0.05 + i * 0.1) * 12;
        } else if (isListening) {
          // Dynamic pulse for user speaking
          amplitude = 10 + Math.sin(phase * 0.12 + i * 0.4) * 26 + Math.sin(phase * 0.03 + i) * 8;
        } else if (isThinking) {
          // Traveling ripple for thinking
          amplitude = 6 + Math.sin(phase * 0.15 - i * 0.25) * 18;
        }

        amplitude = Math.max(3, Math.min(height * 0.45, Math.abs(amplitude)));

        ctx.fillStyle = isListening
          ? "#000000"
          : isSpeaking
          ? "#18181B"
          : isThinking
          ? "#71717A"
          : "#D4D4D8";

        // Draw rounded vertical bar
        ctx.beginPath();
        ctx.roundRect(x, centerY - amplitude, barWidth, amplitude * 2, [3]);
        ctx.fill();
      }

      phase++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isSpeaking, isThinking]);

  return (
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={480}
        height={90}
        className="w-full max-w-md h-[75px]"
      />
    </div>
  );
}
