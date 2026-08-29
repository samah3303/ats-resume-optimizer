"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

// Force graph uses canvas which doesn't support SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export function CareerKnowledgeGraph() {
  const [data, setData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/graph/generate");
        const json = await res.json();
        if (json.nodes && json.links) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load graph data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getNodeColor = (node: any) => {
    switch (node.group) {
      case "user":
        return "#f59e0b"; // amber
      case "skill":
        return "#3b82f6"; // blue
      case "job":
        return "#10b981"; // emerald
      case "analysis_jd":
        return "#a855f7"; // purple
      case "resume":
        return "#ec4899"; // pink
      case "target_role":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const handleNodeClick = useCallback(
    (node: any) => {
      // Center and zoom in on the clicked node
      const distance = 100;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z || 0);

      fgRef.current?.centerAt(node.x, node.y, 1000);
      fgRef.current?.zoom(4, 2000);
    },
    []
  );

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-[#09090b] border border-[#27272A] rounded-xl">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (data.nodes.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-[#09090b] border border-[#27272A] rounded-xl flex-col gap-4 text-zinc-400">
        <svg className="w-12 h-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p>No career data found. Build your resume and analyze jobs to see your graph.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-[#09090b] border border-[#27272A] rounded-xl overflow-hidden relative shadow-[0_0_40px_rgba(245,158,11,0.05)]">
      <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap max-w-sm">
        {/* Legend */}
        {[
          { label: "You", color: "bg-amber-500" },
          { label: "Skill", color: "bg-blue-500" },
          { label: "Tracked Job", color: "bg-emerald-500" },
          { label: "Target JD", color: "bg-purple-500" },
          { label: "Target Role", color: "bg-red-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-[#27272A] px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300">
            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
            {item.label}
          </div>
        ))}
      </div>

      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        {ForceGraph2D && (
          <ForceGraph2D
            ref={fgRef}
            graphData={data}
            nodeLabel="label"
            nodeColor={getNodeColor}
            nodeRelSize={6}
            linkColor={() => "rgba(161, 161, 170, 0.2)"} // zinc-400 at 20% opacity
            linkWidth={1.5}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            onNodeClick={handleNodeClick}
            backgroundColor="#09090b"
            width={800} // This will be responsive via CSS but we need initial
            height={600}
            cooldownTicks={100}
            onEngineStop={() => fgRef.current?.zoomToFit(400, 50)}
          />
        )}
      </div>
    </div>
  );
}
