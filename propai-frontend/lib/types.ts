export type Context = {
  tenant_name: string;
  unit: string;
  address: string;
  hotline?: string;
  portal_url?: string;
  property_name?: string;
  tenant_phone?: string;
};

export type SmsMsg = {
  sid: string;
  direction: "inbound" | "outbound";
  to: string;
  from_: string;
  body?: string;
  media_urls: string[];
  status: string;
  created_at: string;
  category?: string;
  priority?: string;
  action?: string;
  confidence?: number;
  entities?: Record<string, unknown>; // Changed from 'any' to 'unknown'
  ai_reply?: string;
};

export type ClassifyResult = {
  category: "maintenance" | "rent" | "general" | "emergency" | "other";
  priority: "low" | "normal" | "high" | "critical";
  entities: Record<string, unknown>; // Changed from 'any' to 'unknown'
  action: "route_to_pm" | "auto_reply" | "escalate" | "ask_clarify";
  reply: string;
  confidence: number;
};

export type Property = {
  id: string;
  name: string;
  photo: string;
  phone: string;
  context: Context;
};