export type NodeType =
  | "client"
  | "cdn"
  | "load_balancer"
  | "api_gateway"
  | "service"
  | "cache"
  | "database"
  | "queue"
  | "storage"
  | "search_index";

export interface NodeMetadata {
  type: NodeType;
  label: string;
  category: "Client" | "Network" | "Compute" | "Data" | "Messaging";
  icon: string;
  color: string;
}

export interface CanvasNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config?: {
    technology?: string; // e.g. "Redis", "Kafka", "PostgreSQL"
    throughputRps?: number;
    replicationFactor?: number;
  };
}

export interface CanvasEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string; // e.g. "gRPC", "HTTPS", "Pub/Sub"
  isAsync?: boolean;
}

export interface ArchitectureGraph {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  title: string;
  targetScaleQps: number;
}
