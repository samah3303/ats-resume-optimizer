"use client";

import { CanvasNode, NodeType } from "@/lib/whiteboard/types";
import { ARCHITECTURE_BLUEPRINTS } from "@/lib/whiteboard/templates";

interface ArchitectureToolbarProps {
  onAddNode: (type: NodeType, label: string) => void;
  onLoadBlueprint: (key: string) => void;
  onGrade: () => void;
  isGrading?: boolean;
}

export function ArchitectureToolbar({
  onAddNode,
  onLoadBlueprint,
  onGrade,
  isGrading = false,
}: ArchitectureToolbarProps) {
  const NODE_BUTTONS: { type: NodeType; label: string; icon: string }[] = [
    { type: "client", label: "Client App", icon: "📱" },
    { type: "cdn", label: "Edge CDN", icon: "🌐" },
    { type: "load_balancer", label: "Load Balancer", icon: "⚖️" },
    { type: "api_gateway", label: "API Gateway", icon: "🚪" },
    { type: "service", label: "Microservice", icon: "⚙️" },
    { type: "cache", label: "Redis Cache", icon: "⚡" },
    { type: "database", label: "SQL/NoSQL DB", icon: "🗄️" },
    { type: "queue", label: "Kafka Queue", icon: "📬" },
    { type: "storage", label: "Object Storage", icon: "📦" },
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Top Action Bar: Blueprints & Grade */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
            Architecture Blueprint:
          </span>
          <select
            onChange={(e) => onLoadBlueprint(e.target.value)}
            defaultValue="tinyurl"
            className="bg-zinc-50 border border-zinc-300 text-xs font-bold text-black rounded-xl px-3 py-1.5 outline-none shadow-sm cursor-pointer"
          >
            <option value="tinyurl">TinyURL Global URL Shortener</option>
            <option value="uber">Uber Geospatial Ride Dispatch</option>
            <option value="streaming">Netflix/YouTube Video Transcoding</option>
          </select>
        </div>

        <button
          onClick={onGrade}
          disabled={isGrading}
          className="touch-target px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isGrading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Architecture...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>AI Architecture Grade & SPOF Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Component Palette Grid */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
          Add Distributed Component Nodes:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {NODE_BUTTONS.map((btn) => (
            <button
              key={btn.type}
              onClick={() => onAddNode(btn.type, btn.label)}
              className="touch-target px-3.5 py-2 bg-zinc-50 hover:bg-black hover:text-white border border-zinc-200 hover:border-black rounded-xl text-xs font-bold text-zinc-900 transition-all flex items-center gap-1.5 shadow-xs active:scale-95 group"
            >
              <span>{btn.icon}</span>
              <span>+ {btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
