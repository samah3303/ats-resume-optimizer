"use client";

import { useState } from "react";
import { WhiteboardCanvas } from "./WhiteboardCanvas";
import { ArchitectureToolbar } from "./ArchitectureToolbar";
import { AiArchitectureGraderModal } from "./AiArchitectureGraderModal";
import { CanvasNode, CanvasEdge, NodeType, ArchitectureGraph } from "@/lib/whiteboard/types";
import { ARCHITECTURE_BLUEPRINTS } from "@/lib/whiteboard/templates";
import { ArchitectureGradeResult } from "@/lib/ai/architecture-grader";

export function WhiteboardArena() {
  const [nodes, setNodes] = useState<CanvasNode[]>(ARCHITECTURE_BLUEPRINTS.tinyurl.nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(ARCHITECTURE_BLUEPRINTS.tinyurl.edges);
  const [title, setTitle] = useState(ARCHITECTURE_BLUEPRINTS.tinyurl.title);
  const [targetScaleQps, setTargetScaleQps] = useState(ARCHITECTURE_BLUEPRINTS.tinyurl.targetScaleQps);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<ArchitectureGradeResult | null>(null);

  const handleAddNode = (type: NodeType, label: string) => {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      type,
      label,
      x: 200 + Math.random() * 300,
      y: 150 + Math.random() * 200,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleLoadBlueprint = (key: string) => {
    const bp = ARCHITECTURE_BLUEPRINTS[key] || ARCHITECTURE_BLUEPRINTS.tinyurl;
    setNodes(bp.nodes);
    setEdges(bp.edges);
    setTitle(bp.title);
    setTargetScaleQps(bp.targetScaleQps);
    setSelectedNodeId(null);
  };

  const handleGrade = async () => {
    setIsGrading(true);
    const graph: ArchitectureGraph = {
      nodes,
      edges,
      title,
      targetScaleQps,
    };

    try {
      const res = await fetch("/api/whiteboard/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph, targetProblem: title }),
      });

      if (!res.ok) throw new Error("Grading failed");
      const json = await res.json();
      if (json.data) {
        setGradeResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Architecture Controls */}
      <ArchitectureToolbar
        onAddNode={handleAddNode}
        onLoadBlueprint={handleLoadBlueprint}
        onGrade={handleGrade}
        isGrading={isGrading}
      />

      {/* Main Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Canvas (9 cols or full) */}
        <div className={selectedNode ? "lg:col-span-9" : "lg:col-span-12"}>
          <WhiteboardCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </div>

        {/* Node Properties Editor Drawer (3 cols) */}
        {selectedNode && (
          <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h4 className="text-xs font-black text-black">Component Properties</h4>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-xs text-zinc-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Node Label
                </label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    setNodes(nodes.map((n) => (n.id === selectedNode.id ? { ...n, label: newLabel } : n)));
                  }}
                  className="w-full bg-zinc-50 border border-zinc-300 text-xs text-black rounded-xl px-3 py-2 outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Underlying Technology
                </label>
                <input
                  type="text"
                  value={selectedNode.config?.technology || ""}
                  onChange={(e) => {
                    const newTech = e.target.value;
                    setNodes(
                      nodes.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, config: { ...n.config, technology: newTech } }
                          : n
                      )
                    );
                  }}
                  placeholder="e.g. Redis Cluster / Kafka / Envoy"
                  className="w-full bg-zinc-50 border border-zinc-300 text-xs text-black rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  Component Tier
                </label>
                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-mono font-bold text-zinc-700 uppercase">
                  {selectedNode.type}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Grade Modal */}
      {gradeResult && (
        <AiArchitectureGraderModal
          result={gradeResult}
          onClose={() => setGradeResult(null)}
        />
      )}
    </div>
  );
}
