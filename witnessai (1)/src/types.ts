export interface Policy {
  id: string;
  name: string;
  category: "dlp" | "safety" | "compliance";
  description: string;
  enabled: boolean;
  severity: "low" | "medium" | "high" | "critical";
  matchPattern?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  originalPrompt: string;
  redactedPrompt: string;
  modelResponse: string;
  isBlocked: boolean;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  policiesTriggered: string[];
  piiDetected: { type: string; count: number }[];
  latencyMs: number;
  modelUsed: string;
}

export interface AnalyticsData {
  totalPrompts: number;
  totalBlocked: number;
  totalPII: number;
  riskDistribution: {
    Low: number;
    Medium: number;
    High: number;
    Critical: number;
  };
  piiCategories: Record<string, number>;
  logs: AuditLog[];
}
