export interface Message {
  id: string;
  sender: "customer" | "agent" | "system";
  text: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  title: string;
  customer: string;
  customerEmail: string;
  status: "open" | "pending" | "resolved";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  createdAt: string;
  description: string;
  messages: Message[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string; // Markdown supported
  views: number;
  helpfulCount: number;
  tags: string[];
  lastUpdated: string;
  type?: "faq" | "troubleshoot" | "doc" | "article";
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResponseTime: string;
  customerSatisfaction: number;
}

export interface AISummaryResult {
  summary: string;
  keyIssues: string[];
  sentiment: string;
  priority: string;
  suggestedCategory: string;
  actionPlan: string[];
}

export interface AppSettings {
  copilotMode: "auto" | "assist" | "manual";
  modelSelection: string;
  apiKeySet: boolean;
  themeColor: string;
  enableNotifications: boolean;
  autoResolutionThreshold: number; // e.g. 85% confidence
  themeMode: "light" | "dark" | "system";
  responseLength: "short" | "medium" | "long";
  language: string;
}

export interface AdvancedSummaryResult {
  issueSummary: string;
  customerConcern: string;
  rootCause: string;
  suggestedResolution: string;
  priorityLevel: "Low" | "Medium" | "High" | "Urgent";
  estimatedResolutionTime: string;
  humanEscalationRecommendation: string;
}

