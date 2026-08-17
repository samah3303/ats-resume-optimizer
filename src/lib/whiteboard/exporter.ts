import { ArchitectureGraph } from "./types";

/**
 * Converts a KYRO System Design whiteboard graph into Mermaid.js flowchart syntax
 */
export function exportGraphToMermaid(graph: ArchitectureGraph): string {
  const lines: string[] = ["flowchart LR"];

  // Define node styles / classes
  lines.push("  %% Node Definitions");
  graph.nodes.forEach((node) => {
    const cleanId = node.id.replace(/[^a-zA-Z0-9_]/g, "_");
    const tech = node.config?.technology ? `\\n(${node.config.technology})` : "";
    lines.push(`  ${cleanId}["${node.label}${tech}"]`);
  });

  lines.push("\n  %% Connections");
  graph.edges.forEach((edge) => {
    const sId = edge.sourceId.replace(/[^a-zA-Z0-9_]/g, "_");
    const tId = edge.targetId.replace(/[^a-zA-Z0-9_]/g, "_");
    const arrow = edge.isAsync ? "-.->" : "-->";
    const label = edge.label ? `|${edge.label}|` : "";
    lines.push(`  ${sId} ${arrow}${label} ${tId}`);
  });

  return lines.join("\n");
}
