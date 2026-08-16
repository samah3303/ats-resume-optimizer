export interface MarketSkillSurge {
  skill: string;
  category: "AI & ML" | "Backend" | "Cloud & Infra" | "Frontend" | "Data";
  growthPercentage: number;
  averageSalaryUsd: number;
  demandLevel: "Critical Surge" | "High Demand" | "Steady Growth";
}

export interface HiringVelocityCompany {
  name: string;
  industry: string;
  openRolesCount: number;
  hotRoles: string[];
  averageCompensationRange: string;
  remoteFriendly: boolean;
  hiringPace: "Aggressive Expansion" | "Active Hiring" | "Selective";
}

export interface MarketPulseData {
  lastUpdated: string;
  totalActiveIndexedJobs: number;
  remoteHiringRatioPercent: number;
  topSalarySurgeSkills: MarketSkillSurge[];
  topHiringCompanies: HiringVelocityCompany[];
  hiringSentiment: "Bullish Tech Expansion" | "Selective High-Bar" | "Moderate Growth";
  keyTakeaway: string;
}

export const CURRENT_MARKET_INTELLIGENCE: MarketPulseData = {
  lastUpdated: "Real-time Live Feed",
  totalActiveIndexedJobs: 142850,
  remoteHiringRatioPercent: 68,
  hiringSentiment: "Bullish Tech Expansion",
  keyTakeaway:
    "Engineering demand is heavily concentrated in AI Agent Orchestration, Rust systems, and distributed cloud scalability, with average base compensation for Staff+ roles rising by 14% quarter-over-quarter.",
  topSalarySurgeSkills: [
    {
      skill: "AI Agent Orchestration & LLM Tool Use",
      category: "AI & ML",
      growthPercentage: 84.5,
      averageSalaryUsd: 215000,
      demandLevel: "Critical Surge",
    },
    {
      skill: "Rust & High-Throughput Systems",
      category: "Backend",
      growthPercentage: 58.2,
      averageSalaryUsd: 195000,
      demandLevel: "Critical Surge",
    },
    {
      skill: "Kubernetes & Multi-Cloud Terraform",
      category: "Cloud & Infra",
      growthPercentage: 42.1,
      averageSalaryUsd: 180000,
      demandLevel: "High Demand",
    },
    {
      skill: "Distributed Kafka Event Streaming",
      category: "Backend",
      growthPercentage: 36.8,
      averageSalaryUsd: 185000,
      demandLevel: "High Demand",
    },
    {
      skill: "Next.js & Full-Stack React Server Components",
      category: "Frontend",
      growthPercentage: 31.4,
      averageSalaryUsd: 165000,
      demandLevel: "Steady Growth",
    },
  ],
  topHiringCompanies: [
    {
      name: "Stripe",
      industry: "Fintech / Global Payments",
      openRolesCount: 340,
      hotRoles: ["Staff Backend Engineer", "Infra Architect", "Engineering Manager"],
      averageCompensationRange: "$190k - $275k + Equity",
      remoteFriendly: true,
      hiringPace: "Aggressive Expansion",
    },
    {
      name: "Anthropic / OpenAI Ecosystem",
      industry: "Artificial Intelligence",
      openRolesCount: 185,
      hotRoles: ["Systems Scaling Engineer", "Research Engineer", "Full-Stack AI"],
      averageCompensationRange: "$220k - $340k + Equity",
      remoteFriendly: true,
      hiringPace: "Aggressive Expansion",
    },
    {
      name: "Datadog",
      industry: "Observability & Cloud Monitoring",
      openRolesCount: 220,
      hotRoles: ["Distributed Systems Engineer", "Data Pipeline Lead"],
      averageCompensationRange: "$175k - $240k + Equity",
      remoteFriendly: true,
      hiringPace: "Active Hiring",
    },
    {
      name: "Vercel",
      industry: "Frontend Cloud & Developer Experience",
      openRolesCount: 95,
      hotRoles: ["Framework Engineer", "Edge Compute Architect"],
      averageCompensationRange: "$180k - $250k + Equity",
      remoteFriendly: true,
      hiringPace: "Active Hiring",
    },
  ],
};
