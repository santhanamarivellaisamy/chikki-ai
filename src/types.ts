export type TierType = "fast" | "balanced" | "powerful";

export interface ProviderConfig {
  id: string;
  isConfigured: boolean;
  models: { id: string; name: string }[];
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
  imageUrl?: string;
  bullets?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  time: string;
  category: "Productivity" | "Creative" | "Technical" | "All";
  tag: string;
  iconType: "assistant" | "code" | "travel" | "workflow";
  providerId?: string;
  modelId?: string;
  messages: Message[];
}

export interface UserProfile {
  email: string;
  name: string;
  avatarUrl: string; // we will repurpose this or ignore if using initials
  isPro: boolean;
}

export const PROVIDER_CATALOG = [
  {
    id: "gemini",
    label: "Google Gemini",
    color: "#4285F4",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-500",
    borderClass: "border-blue-500/20",
    icon: "G",
    models: [
      { id: "gemini-3.8-flash",        name: "Gemini 3.8 Flash",       tier: "fast",     ctx: "1M" },
      { id: "gemini-3.1-pro-preview",  name: "Gemini 3.1 Pro",         tier: "powerful", ctx: "2M" },
      { id: "gemini-3.1-flash-lite",   name: "Gemini 3.1 Flash Lite",  tier: "fast",     ctx: "1M" },
      { id: "gemini-flash-latest",     name: "Gemini Flash Latest",    tier: "balanced", ctx: "1M" },
    ]
  },
  {
    id: "claude",
    label: "Anthropic Claude",
    color: "#D97706",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-500",
    borderClass: "border-amber-500/20",
    icon: "A",
    models: [
      { id: "claude-opus-4-5",         name: "Claude Opus 4.5",           tier: "powerful", ctx: "200K" },
      { id: "claude-sonnet-4-5",       name: "Claude Sonnet 4.5",         tier: "balanced", ctx: "200K" },
      { id: "claude-haiku-3-5",        name: "Claude Haiku 3.5",          tier: "fast",     ctx: "200K" },
      { id: "claude-opus-4-0",         name: "Claude Opus 4",             tier: "powerful", ctx: "200K" },
      { id: "claude-sonnet-4-0",       name: "Claude Sonnet 4",           tier: "balanced", ctx: "200K" },
      { id: "claude-3-7-sonnet",       name: "Claude 3.7 Sonnet",         tier: "balanced", ctx: "200K" },
      { id: "claude-3-5-haiku",        name: "Claude 3.5 Haiku",          tier: "fast",     ctx: "200K" },
      { id: "claude-3-opus",           name: "Claude 3 Opus",             tier: "powerful", ctx: "200K" },
    ]
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    color: "#06B6D4",
    bgClass: "bg-cyan-500/10",
    textClass: "text-cyan-500",
    borderClass: "border-cyan-500/20",
    icon: "D",
    models: [
      { id: "deepseek-chat",         name: "DeepSeek V3 (Chat)",     tier: "balanced", ctx: "64K" },
      { id: "deepseek-reasoner",     name: "DeepSeek R1 (Reasoner)", tier: "powerful", ctx: "64K" },
      { id: "deepseek-v3-0324",      name: "DeepSeek V3 0324",       tier: "balanced", ctx: "64K" },
      { id: "deepseek-r1-0528",      name: "DeepSeek R1 0528",       tier: "powerful", ctx: "64K" },
      { id: "deepseek-coder-v2",     name: "DeepSeek Coder V2",      tier: "balanced", ctx: "128K" },
      { id: "deepseek-r1-distill-qwen-32b", name: "R1 Distill Qwen 32B", tier: "fast", ctx: "64K" },
    ]
  },
  {
    id: "glm",
    label: "Zhipu GLM",
    color: "#8B5CF6",
    bgClass: "bg-violet-500/10",
    textClass: "text-violet-500",
    borderClass: "border-violet-500/20",
    icon: "Z",
    models: [
      { id: "glm-4-plus",      name: "GLM-4 Plus",       tier: "powerful", ctx: "128K" },
      { id: "glm-4-air",       name: "GLM-4 Air",        tier: "balanced", ctx: "128K" },
      { id: "glm-4-airx",      name: "GLM-4 AirX",       tier: "fast",     ctx: "8K" },
      { id: "glm-4-flash",     name: "GLM-4 Flash",      tier: "fast",     ctx: "128K" },
      { id: "glm-4-long",      name: "GLM-4 Long",       tier: "balanced", ctx: "1M" },
      { id: "glm-4v-plus",     name: "GLM-4V Plus",      tier: "powerful", ctx: "8K" },
      { id: "glm-z1-flash",    name: "GLM-Z1 Flash",     tier: "fast",     ctx: "128K" },
      { id: "glm-z1-air",      name: "GLM-Z1 Air",       tier: "balanced", ctx: "128K" },
    ]
  }
] as const;
