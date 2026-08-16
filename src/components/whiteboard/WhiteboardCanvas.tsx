"use client";

import { useState, useRef } from "react";
import { CanvasNode, CanvasEdge, NodeType } from "@/lib/whiteboard/types";

interface WhiteboardCanvasProps {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onNodesChange: (nodes: CanvasNode[]) => void;
  onEdgesChange: (edges: CanvasEdge[]) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

export function WhiteboardCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  selectedNodeId,
  onSelectNode,
}: WhiteboardCanvasProps) {
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const canvasRef = useRef<SVGSVGElement>(null);

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case "client": return "📱";
      case "cdn": return "🌐";
      case "load_balancer": return "⚖️";
      case "api_gateway": return "🚪";
      case "service": return "⚙️";
      case "cache": return "⚡";
      case "database": return "🗄️";
      case "queue": return "📬";
      case "storage": return "📦";
      case "search_index": return "🔍";
      default: return "📦";
    }
  };

  const handleMouseDown = (e: React.MouseEvent, node: CanvasNode) => {
    e.stopPropagation();
    onSelectNode(node.id);

    if (connectingSourceId) {
      if (connectingSourceId !== node.id) {
        // Create new edge
        const newEdge: CanvasEdge = {
          id: `edge-${Date.now()}`,
          sourceId: connectingSourceId,
          targetId: node.id,
          label: "gRPC / HTTPS",
        };
        onEdgesChange([...edges, newEdge]);
      }
      setConnectingSourceId(null);
      return;
    }

    setDraggingNodeId(node.id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(1400, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(20, Math.min(700, e.clientY - rect.top - dragOffset.y));

    onNodesChange(
      nodes.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const deleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onNodesChange(nodes.filter((n) => n.id !== id));
    onEdgesChange(edges.filter((ed) => ed.sourceId !== id && ed.targetId !== id));
    if (selectedNodeId === id) onSelectNode(null);
  };

  return (
    <div className="relative w-full h-[580px] bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm select-none">
      {/* Subtle Grid Background Pattern */}
      <svg
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => {
          onSelectNode(null);
          setConnectingSourceId(null);
        }}
        className="w-full h-full cursor-crosshair"
      >
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#E4E4E7" />
          </pattern>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#000000" />
          </marker>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Render Connection Edges */}
        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.sourceId);
          const targetNode = nodes.find((n) => n.id === edge.targetId);
          if (!sourceNode || !targetNode) return null;

          const sx = sourceNode.x + 90;
          const sy = sourceNode.y + 40;
          const tx = targetNode.x + 90;
          const ty = targetNode.y + 40;
          const midX = (sx + tx) / 2;
          const midY = (sy + ty) / 2;

          return (
            <g key={edge.id} className="group cursor-pointer">
              <path
                d={`M ${sx} ${sy} Q ${midX} ${midY - 10} ${tx} ${ty}`}
                fill="none"
                stroke={edge.isAsync ? "#71717A" : "#000000"}
                strokeWidth="2"
                strokeDasharray={edge.isAsync ? "5,5" : "none"}
                markerEnd="url(#arrowhead)"
              />
              {edge.label && (
                <text
                  x={midX}
                  y={midY - 12}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-bold fill-zinc-600 bg-white"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Render Interactive Architecture Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isSource = connectingSourceId === node.id;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseDown={(e) => handleMouseDown(e, node)}
              className="cursor-move group"
            >
              {/* Node Card Box */}
              <rect
                width="180"
                height="80"
                rx="18"
                className={`transition-all ${
                  isSelected
                    ? "fill-white stroke-black stroke-2"
                    : isSource
                    ? "fill-emerald-50 stroke-emerald-500 stroke-2"
                    : "fill-white stroke-zinc-200 stroke-1 hover:stroke-black"
                }`}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.04))"
              />

              {/* Node Icon */}
              <text x="16" y="32" className="text-xl">
                {getNodeIcon(node.type)}
              </text>

              {/* Node Title */}
              <text
                x="44"
                y="28"
                className="text-xs font-black fill-black select-none pointer-events-none"
              >
                {node.label.length > 16 ? `${node.label.slice(0, 15)}...` : node.label}
              </text>

              {/* Node Subtitle / Tech config */}
              <text
                x="44"
                y="46"
                className="text-[10px] font-mono font-bold fill-zinc-500 select-none pointer-events-none"
              >
                {node.config?.technology || node.type.toUpperCase()}
              </text>

              {/* Connect Cable Port (Right) */}
              <circle
                cx="180"
                cy="40"
                r="6"
                onClick={(e) => {
                  e.stopPropagation();
                  setConnectingSourceId(node.id);
                }}
                className="fill-black hover:fill-emerald-500 cursor-pointer transition-colors"
              >
                <title>Click to draw connection cable</title>
              </circle>

              {/* Delete Node (Top Right) */}
              <text
                x="165"
                y="20"
                onClick={(e) => deleteNode(node.id, e)}
                className="text-xs fill-zinc-300 hover:fill-rose-600 cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
              >
                ✕
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Instructions Pill */}
      <div className="absolute bottom-4 left-4 px-3.5 py-1.5 bg-black/80 backdrop-blur-md text-white text-[11px] font-bold rounded-xl border border-white/20 shadow-md pointer-events-none">
        {connectingSourceId ? (
          <span className="text-emerald-400">Click a target node to connect cable</span>
        ) : (
          <span>Drag nodes to arrange • Click black port on node edge to connect</span>
        )}
      </div>
    </div>
  );
}
