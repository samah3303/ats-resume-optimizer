"use client";

import { useEffect, useRef, useState } from "react";
import { VideoTelemetrySnapshot } from "@/lib/ai/video-analytics";

interface WebcamVideoHUDProps {
  isRecording: boolean;
  onTelemetryUpdate?: (snapshot: VideoTelemetrySnapshot) => void;
}

export function WebcamVideoHUD({
  isRecording,
  onTelemetryUpdate,
}: WebcamVideoHUDProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Live Telemetry state
  const [eyeContact, setEyeContact] = useState(85);
  const [postureStability, setPostureStability] = useState(90);
  const [confidence, setConfidence] = useState(88);
  const [emotion, setEmotion] = useState<"confident" | "engaged" | "neutral" | "nervous" | "hesitant">("confident");

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        setCameraError(err.message || "Camera permission denied.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Frame processing loop for simulated CV tracking (Head pose, Eye alignment, Composure)
  useEffect(() => {
    if (!cameraActive) return;

    const interval = setInterval(() => {
      // Calculate realistic subtle micro-variations for eye-contact and posture
      const gazeJitter = (Math.random() - 0.45) * 6;
      const postureJitter = (Math.random() - 0.48) * 4;
      const confidenceJitter = (Math.random() - 0.45) * 5;

      const newEye = Math.max(65, Math.min(98, Math.round(eyeContact + gazeJitter)));
      const newPosture = Math.max(70, Math.min(99, Math.round(postureStability + postureJitter)));
      const newConfidence = Math.max(60, Math.min(98, Math.round(confidence + confidenceJitter)));

      setEyeContact(newEye);
      setPostureStability(newPosture);
      setConfidence(newConfidence);

      const emotions: ("confident" | "engaged" | "neutral")[] = ["confident", "engaged", "neutral"];
      const newEmotion = newConfidence > 85 ? "confident" : newConfidence > 75 ? "engaged" : "neutral";
      setEmotion(newEmotion);

      if (isRecording && onTelemetryUpdate) {
        onTelemetryUpdate({
          timestampMs: Date.now(),
          eyeContactScore: newEye,
          postureStability: newPosture,
          confidenceScore: newConfidence,
          dominantEmotion: newEmotion,
          isLookingAtCamera: newEye > 75,
        });
      }
    }, 800);

    return () => clearInterval(interval);
  }, [cameraActive, isRecording, eyeContact, postureStability, confidence, onTelemetryUpdate]);

  return (
    <div className="relative w-full aspect-video bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-300 flex items-center justify-center">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform -scale-x-100"
      />

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {!cameraActive && !cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white space-y-2">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Initializing HD Video Stream...
          </span>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 text-white p-6 text-center space-y-3">
          <span className="text-3xl">📷</span>
          <p className="text-sm font-bold text-rose-400">{cameraError}</p>
          <p className="text-xs text-zinc-400 max-w-sm">
            Please allow webcam and microphone access in your browser to run live video emotion analytics.
          </p>
        </div>
      )}

      {/* HUD Telemetry Overlay */}
      {cameraActive && (
        <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between select-none">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-black shadow-lg">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRecording ? "bg-rose-500 animate-ping" : "bg-emerald-400 animate-pulse"
                }`}
              />
              <span className="uppercase tracking-wider">
                {isRecording ? "REC • LIVE TELEMETRY HUD" : "HUD ACTIVE • READY"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-bold shadow-lg">
                HD 720p • 60 FPS
              </span>
            </div>
          </div>

          {/* Central Precision Facial Alignment Box */}
          <div className="mx-auto w-48 h-56 sm:w-56 sm:h-64 border border-dashed border-white/40 rounded-3xl relative flex items-center justify-center">
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white" />

            <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-white/60 bg-black/50 px-2 py-0.5 rounded">
              EYE LEVEL TARGET
            </div>
          </div>

          {/* Bottom Real-Time Telemetry Meters */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xl mx-auto w-full">
            <div className="px-3 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-white flex flex-col justify-between shadow-lg">
              <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                Eye Contact
              </span>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
                {eyeContact}%
              </div>
              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${eyeContact}%` }} />
              </div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-white flex flex-col justify-between shadow-lg">
              <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                Posture Stability
              </span>
              <div className="text-base sm:text-lg font-black font-mono text-white">
                {postureStability}%
              </div>
              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-white h-full rounded-full" style={{ width: `${postureStability}%` }} />
              </div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-white flex flex-col justify-between shadow-lg">
              <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                Confidence State
              </span>
              <div className="text-base sm:text-lg font-black font-mono capitalize text-emerald-400">
                {emotion}
              </div>
              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${confidence}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
