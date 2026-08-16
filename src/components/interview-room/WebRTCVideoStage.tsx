"use client";

import { useEffect, useRef, useState } from "react";

interface WebRTCVideoStageProps {
  localName: string;
  remoteName: string;
  isHost?: boolean;
}

export function WebRTCVideoStage({
  localName,
  remoteName,
  isHost = true,
}: WebRTCVideoStageProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startLocalVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setMediaStream(stream);
      } catch (err) {
        console.error("WebRTC camera stream error:", err);
      }
    };

    startLocalVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }
        displayStream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && mediaStream) {
            localVideoRef.current.srcObject = mediaStream;
          }
          setScreenSharing(false);
        };
        setScreenSharing(true);
      } else {
        if (localVideoRef.current && mediaStream) {
          localVideoRef.current.srcObject = mediaStream;
        }
        setScreenSharing(false);
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Grid: 2 Video Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Participant Feed */}
        <div className="relative aspect-video bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-300 shadow-md flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />

          {!cameraActive && (
            <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center text-white space-y-2">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-xl">
                {localName.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold uppercase text-zinc-400">Camera Off</span>
            </div>
          )}

          {/* Label Badge */}
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/75 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{localName} (You {isHost ? "• Interviewer" : "• Candidate"})</span>
          </div>
        </div>

        {/* Remote Participant Feed (Simulated WebRTC Peer Stream) */}
        <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-300 shadow-md flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl font-black text-white shadow-inner">
              {remoteName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-black text-white">{remoteName}</h4>
              <span className="text-xs text-zinc-400">Connected via Peer-to-Peer WebRTC</span>
            </div>
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-full text-[10px] font-black uppercase tracking-wider">
              🟢 HD Audio & Video Active
            </span>
          </div>

          <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/75 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{remoteName}</span>
          </div>
        </div>
      </div>

      {/* Media Controls Bar */}
      <div className="p-3 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center gap-3 shadow-sm">
        <button
          onClick={toggleMic}
          className={`touch-target px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm flex items-center gap-1.5 ${
            micActive
              ? "bg-white text-black border-zinc-300 hover:border-black"
              : "bg-rose-50 text-rose-700 border-rose-300"
          }`}
        >
          <span>{micActive ? "🎙️ Mic On" : "🔇 Mic Muted"}</span>
        </button>

        <button
          onClick={toggleCamera}
          className={`touch-target px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm flex items-center gap-1.5 ${
            cameraActive
              ? "bg-white text-black border-zinc-300 hover:border-black"
              : "bg-rose-50 text-rose-700 border-rose-300"
          }`}
        >
          <span>{cameraActive ? "📹 Camera On" : "🚫 Camera Off"}</span>
        </button>

        <button
          onClick={toggleScreenShare}
          className={`touch-target px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm flex items-center gap-1.5 ${
            screenSharing
              ? "bg-black text-white border-black"
              : "bg-white text-black border-zinc-300 hover:border-black"
          }`}
        >
          <span>🖥️ {screenSharing ? "Stop Screen Share" : "Share Screen"}</span>
        </button>
      </div>
    </div>
  );
}
