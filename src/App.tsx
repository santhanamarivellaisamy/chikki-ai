import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Menu,
  Search,
  Sparkles,
  Code,
  Plane,
  FileText,
  Plus,
  Download,
  Mic,
  MicOff,
  Radio,
  Volume2,
  Send,
  ChevronRight,
  Award,
  Moon,
  Bell,
  Globe,
  HelpCircle,
  Shield,
  Info,
  LogOut,
  CheckCircle,
  User as UserIcon,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Lock,
  Key,
  Zap,
  Brain,
  Cpu
} from "lucide-react";

// ─── Static Model Catalog ───────────────────────────────────────────────────
// All pre-built provider/model definitions. isConfigured is merged at runtime
// from the live API config. Models remain visible so users know what's available.
const PROVIDER_CATALOG = [
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

function UserAvatar({ name, size = 8 }: { name: string, size?: number }) {
  const getInitials = (n: string) => {
    if (!n) return "U";
    const parts = n.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.substring(0, 2).toUpperCase();
  };
  const getBgColor = (n: string) => {
    if (!n) return 'bg-neutral-500';
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];
    let hash = 0;
    for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold text-xs ${getBgColor(name)}`}>
      {getInitials(name)}
    </div>
  );
}

type TierType = "fast" | "balanced" | "powerful";

const TIER_META: Record<TierType, { label: string; color: string; Icon: React.ElementType }> = {
  fast:     { label: "Fast",     color: "text-emerald-500 bg-emerald-500/10", Icon: Zap },
  balanced: { label: "Balanced", color: "text-cyan-500 bg-cyan-500/10",       Icon: Brain },
  powerful: { label: "Powerful", color: "text-purple-500 bg-purple-500/10",   Icon: Cpu },
};

// Types
interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
  imageUrl?: string;
  bullets?: string[];
}

interface Conversation {
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

export interface ProviderConfig {
  id: string;
  isConfigured: boolean;
  models: { id: string; name: string }[];
}

interface UserProfile {
  email: string;
  name: string;
  avatarUrl: string;
  isPro: boolean;
}

export default function App() {
  const { t, i18n } = useTranslation();
  // Auth / User State
  const [emailInput, setEmailInput] = useState("");
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("pab_ai_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Active Chat State
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [originalChatId, setOriginalChatId] = useState<string>("");
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Continuous Voice-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  // Navigation & UI State
  const [screen, setScreen] = useState<"login" | "history" | "chat" | "settings">("login");
  const [screenStack, setScreenStack] = useState<string[]>(["login"]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"All" | "Productivity" | "Creative" | "Technical">("All");
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // AI Providers Configuration State
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("gemini");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.8-flash");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBottomModelOpen, setIsBottomModelOpen] = useState(false);

  // Fetch AI Config on Mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/ai/config");
        const data = await response.json();
        if (data.success && data.config) {
          setProviders(data.config);
          // Set initial selection if currently selected provider isn't configured
          const currentProv = data.config.find((p: ProviderConfig) => p.id === selectedProvider);
          if (!currentProv || !currentProv.isConfigured) {
            const firstConfigured = data.config.find((p: ProviderConfig) => p.isConfigured);
            if (firstConfigured) {
              setSelectedProvider(firstConfigured.id);
              if (firstConfigured.models.length > 0) {
                setSelectedModel(firstConfigured.models[0].id);
              }
            }
          } else {
            const modelExists = currentProv.models.some((m: any) => m.id === selectedModel);
            if (!modelExists && currentProv.models.length > 0) {
              setSelectedModel(currentProv.models[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch AI configuration:", err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    setScreenStack(prev => {
      if (screen === "login") return ["login"];
      if (prev[prev.length - 1] === screen) return prev;
      if (prev.length > 1 && prev[prev.length - 2] === screen) {
        return prev.slice(0, -1);
      }
      return [...prev, screen];
    });
  }, [screen]);

  const handleBack = () => {
    if (screen === "login") {
      setEmailInput("");
      return;
    }

    if (screen === "settings") {
      setScreen("chat");
      if (originalChatId) {
        setActiveChatId(originalChatId);
      }
    } else if (screen === "chat") {
      if (activeChatId !== originalChatId && originalChatId) {
        setActiveChatId(originalChatId);
      } else {
        // Toggle side-menu drawer because all conversations are shown in the Hamburger side-menu
        setDrawerOpen(prev => !prev);
      }
    }
  };

  // The back button appears when the user is in settings or in a different chat room from the original
  const showBackButton = screen === "settings" || (screen === "chat" && activeChatId !== originalChatId && originalChatId !== "");

  // Chat scroll anchor
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial Seed Data for Conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem("pab_ai_conversations");
    if (saved) {
      try {
        const parsed: Conversation[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(c => {
            if (
              !c.modelId ||
              c.modelId.startsWith("gemini-2.") ||
              c.modelId.startsWith("gemini-1.") ||
              c.modelId === "gemini-2.5-flash"
            ) {
              return { ...c, modelId: "gemini-3.8-flash" };
            }
            return c;
          });
        }
      } catch (e) {
        console.error("Failed to parse conversations from localStorage", e);
      }
    }

    return [
      {
        id: "chat-1",
        title: "Modern UI Layout Strategy",
        lastMessage: "Can you help me design a bento grid for a...",
        time: "2m ago",
        category: "Creative",
        tag: "Design Assistant",
        iconType: "assistant",
        messages: [
          {
            id: "m-1",
            sender: "ai",
            text: "Hello! I'm your professional assistant. How can I help you optimize your workflow today?",
            time: "09:41 AM"
          },
          {
            id: "m-2",
            sender: "user",
            text: "Can you help me draft a project proposal for the new mobile application? I need it to focus on user experience and glassmorphism design.",
            time: "09:42 AM"
          },
          {
            id: "m-3",
            sender: "ai",
            text: "Certainly. I've outlined a few key sections for your proposal. Here's a mood board concept for the glassmorphism approach:",
            time: "09:43 AM",
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyIvjMkF0IubYZzbPj7z5QcK_myBO_pUy1z26Ug0GgowkBkmTM-soFpmLdiDVe5CI1YhKzyGTUz_CKd3es0NhN6g2f7ka35wzdex6TsLcpP3Tr0dAqIo4LdlrZp_2klA0hDu2eQEzy-KNRAd7JV0TJ67oxsLw7Q-G1VePNcTd4W5bIzjcK_IukFSDphD1yYF3VM8AW6IvJr3u-H6DHQLvRbjbtOi61kw7YOSZFk4cLOrKbXrvWyZ1vq32Zo9OzhIEpdFgVJgkfk9xS",
            bullets: [
              "Layered depth with backdrop blurs",
              "Vibrant gradient accents"
            ]
          }
        ]
      },
      {
        id: "chat-2",
        title: "Python Scripting for Data",
        lastMessage: "The regex for matching the email addresses...",
        time: "3h ago",
        category: "Technical",
        tag: "Code Helper",
        iconType: "code",
        messages: [
          {
            id: "m-4",
            sender: "user",
            text: "What regex pattern is best for validating dynamic email addresses with multiple subdomains?",
            time: "02:15 PM"
          },
          {
            id: "m-5",
            sender: "ai",
            text: "The regex for matching the email addresses needs to be more robust for subdomains. I suggest using the RFC 5322 compliant standards. Would you like a Python script featuring this?",
            time: "02:16 PM"
          }
        ]
      },
      {
        id: "chat-3",
        title: "Vacation Planning - Japan 2024",
        lastMessage: "What are the best hidden gems in Kyoto for...",
        time: "Yesterday",
        category: "Creative",
        tag: "Travel Concierge",
        iconType: "travel",
        messages: [
          {
            id: "m-6",
            sender: "user",
            text: "Suggest architectural marvels in Kyoto.",
            time: "Yesterday"
          },
          {
            id: "m-7",
            sender: "ai",
            text: "What are the best hidden gems in Kyoto for someone who loves architecture? I recommend visiting the Tofuku-ji Hojo gardens and the traditional machiya townhouses.",
            time: "Yesterday"
          }
        ]
      },
      {
        id: "chat-4",
        title: "Daily Standup Summary",
        lastMessage: "Summarize the meeting notes from this...",
        time: "Oct 24",
        category: "Productivity",
        tag: "Work Flow",
        iconType: "workflow",
        messages: [
          {
            id: "m-8",
            sender: "user",
            text: "Summarize the morning standup notes.",
            time: "10:00 AM"
          },
          {
            id: "m-9",
            sender: "ai",
            text: "Summarize the meeting notes from this morning and extract the action items. Here are the main action items:\n\n- Alex: Finish UI setting adjustments\n- Sam: Run deployment compile diagnostics\n- Chloe: Review backend payload streams",
            time: "10:02 AM"
          }
        ]
      }
    ];
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("pab_ai_conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("pab_ai_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pab_ai_user");
    }
  }, [user]);

  function ProfileModal({ user, onClose }: { user: any, onClose: () => void }) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-semibold">Profile Settings</h3>
            <button onClick={onClose} className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <UserAvatar name={user.name} size={16} />
              <div>
                <button className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer">Upload Photo</button>
                <button className="px-3 py-1.5 text-red-500 text-sm font-medium ml-2 hover:underline cursor-pointer">Remove</button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Full Name</label>
              <input type="text" defaultValue={user.name} className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 outline-none focus:ring-1 focus:ring-cyan-accent" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email (Read Only)</label>
              <input type="email" defaultValue={user.email} disabled className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Change Password</label>
              <input type="password" placeholder="New password" className="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 outline-none focus:ring-1 focus:ring-cyan-accent" />
            </div>
          </div>
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg cursor-pointer">Cancel</button>
            <button onClick={onClose} className="px-4 py-2 bg-cyan-accent text-white text-sm font-medium rounded-lg hover:bg-cyan-accent/90 cursor-pointer">Save Changes</button>
          </div>
        </div>
      </div>
    );
  }

  // Format dynamic time (e.g. 11:24 AM)
  function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 12 instead of 0
    return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  }

  // Handle auto routing on mount if user exists (refresh reset to a new chat)
  // Handle auto routing on mount if user exists
  useEffect(() => {
    if (user && screen === "login") {
      setScreen("chat");
      setActiveChatId("");
      setOriginalChatId("");
    }
  }, [user]);

  // Scroll to bottom of active chat on change
  useEffect(() => {
    if (screen === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [screen, activeChatId, conversations, isGenerating]);

  // Close bottom model panel on outside click
  useEffect(() => {
    if (!isBottomModelOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const panel = document.getElementById("bottom-model-panel");
      const btn = document.getElementById("bottom-model-selector-btn");
      if (
        panel && !panel.contains(e.target as Node) &&
        btn && !btn.contains(e.target as Node)
      ) {
        setIsBottomModelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBottomModelOpen]);

  // Central Login Helper to initialize user and start a fresh chat session
  const performLogin = (email: string, name: string, avatar: string) => {
    setUser({
      email,
      name,
      avatarUrl: avatar,
      isPro: true
    });
    setActiveChatId("");
    setOriginalChatId("");
    setScreen("chat");
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    // Simulate login loading state
    const button = document.getElementById("login-submit-btn") as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.innerHTML = `
        <div class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      `;
    }

    setTimeout(() => {
      // Set the logged in user based on email
      const displayName = emailInput.split("@")[0];
      const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      const email = emailInput;
      const name = capitalizedName || "Alex Johnson";
      const avatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Hy6QpwLLs-BCxg0kTh-vt0lNCsZ3fJvICpPsVqFQANPT6IyccJOwMIi6of3-wD16Q7vkRWN6uQOZrV0a6BWJ_FxW-yf0isgMwWoTRR68CVJbO5l-dgOz8XniprMf0EDXk4_17u9uk5zflnjC5BD9ne-acnlkGpMSZYoHQLtIDQA1xT3HTJjnq3221IAxapD2f9-Y4Lz4QrS87GkUOXvCY7d1aPXXLKZj8fTmgcxzu0KgSI2n6U4TTDYaoeXstE248ktZWtYQcLFv";

      performLogin(email, name, avatar);
    }, 1500);
  };

  // Sign out handler
  const handleLogout = () => {
    setUser(null);
    setScreen("login");
    setDrawerOpen(false);
    setEmailInput("");
  };

  // Render Lucide Icon based on icon string
  const renderCategoryIcon = (iconType: string, className = "w-4 h-4 text-primary") => {
    switch (iconType) {
      case "assistant":
        return <Sparkles className={className} />;
      case "code":
        return <Code className={className} />;
      case "travel":
        return <Plane className={className} />;
      case "workflow":
        return <FileText className={className} />;
      default:
        return <MessageSquare className={className} />;
    }
  };

  // Get active chat or default
  const activeChat = activeChatId ? conversations.find(c => c.id === activeChatId) : null;

  // ─── Continuous Voice-to-Text Recognition ─────────────────────────────────
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Voice recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const currentLang = i18n.language || "en";
      recognition.lang = currentLang.startsWith("es")
        ? "es-ES"
        : currentLang.startsWith("zh")
        ? "zh-CN"
        : currentLang.startsWith("fr")
        ? "fr-FR"
        : currentLang.startsWith("de")
        ? "de-DE"
        : currentLang.startsWith("ja")
        ? "ja-JP"
        : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let liveInterim = "";
        let newFinal = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const textChunk = item[0]?.transcript || "";
          if (item.isFinal) {
            newFinal += (newFinal ? " " : "") + textChunk.trim();
          } else {
            liveInterim += (liveInterim ? " " : "") + textChunk;
          }
        }

        if (newFinal) {
          setInputMessage((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${newFinal}` : newFinal;
          });
          setInterimTranscript("");
        } else {
          setInterimTranscript(liveInterim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition event error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setSpeechError("Microphone access was denied. Please allow microphone permissions in your browser.");
          isListeningRef.current = false;
          setIsListening(false);
          setInterimTranscript("");
        } else if (event.error === "network") {
          setSpeechError("Speech recognition network error. Reconnecting...");
          setTimeout(() => setSpeechError(null), 3000);
        }
      };

      recognition.onend = () => {
        // Continuous mode: if user still has listening toggled ON, automatically restart
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (_) {
            setTimeout(() => {
              if (isListeningRef.current) {
                try {
                  recognition.start();
                } catch (_) {}
              }
            }, 250);
          }
        } else {
          setIsListening(false);
          setInterimTranscript("");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Error starting speech recognition:", err);
      setSpeechError("Could not activate microphone: " + (err?.message || "Unknown error"));
      setIsListening(false);
      isListeningRef.current = false;
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  const stopSpeechRecognition = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimTranscript("");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Stop listening when navigating away from chat
  useEffect(() => {
    if (screen !== "chat") {
      stopSpeechRecognition();
    }
  }, [screen]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  // ─── Export Conversation (Text or JSON) ───────────────────────────────────
  const exportConversation = (format: "txt" | "json", chatTarget?: Conversation) => {
    const target = chatTarget || activeChat;
    if (!target || target.messages.length === 0) {
      setExportToast("No messages to export in this conversation.");
      setTimeout(() => setExportToast(null), 3000);
      setShowExportMenu(false);
      return;
    }

    const safeTitle = (target.title || "conversation")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "chat";
    const dateStr = new Date().toISOString().split("T")[0];

    if (format === "json") {
      const exportData = {
        app: "PAB AI",
        exportedAt: new Date().toISOString(),
        conversation: {
          id: target.id,
          title: target.title,
          category: target.category,
          tag: target.tag,
          provider: target.providerId || selectedProvider,
          model: target.modelId || selectedModel,
          totalMessages: target.messages.length,
          messages: target.messages.map(m => ({
            id: m.id,
            sender: m.sender,
            role: m.sender === "user" ? "user" : "assistant",
            text: m.text,
            time: m.time,
            imageUrl: m.imageUrl,
            bullets: m.bullets || []
          }))
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeTitle}-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportToast(`Exported "${target.title.substring(0, 20)}" as JSON`);
    } else {
      // Plain text format
      let textContent = `====================================================\n`;
      textContent += `PAB AI CONVERSATION EXPORT\n`;
      textContent += `Title: ${target.title}\n`;
      textContent += `Export Date: ${new Date().toLocaleString()}\n`;
      textContent += `Category: ${target.category} | Model: ${target.modelId || selectedModel}\n`;
      textContent += `Total Messages: ${target.messages.length}\n`;
      textContent += `====================================================\n\n`;

      target.messages.forEach((m, idx) => {
        const senderLabel = m.sender === "user" ? (user?.name || "User") : "PAB AI";
        textContent += `[${idx + 1}] ${senderLabel} • ${m.time}\n`;
        textContent += `${m.text}\n`;
        if (m.bullets && m.bullets.length > 0) {
          textContent += m.bullets.map(b => `  • ${b}`).join("\n") + "\n";
        }
        textContent += `\n----------------------------------------------------\n\n`;
      });

      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeTitle}-${dateStr}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportToast(`Exported "${target.title.substring(0, 20)}" as TXT`);
    }

    setShowExportMenu(false);
    setTimeout(() => setExportToast(null), 3500);
  };

  // Send message to Gemini server API
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;
    setInterimTranscript("");

    // Build user message
    const userMsg: Message = {
      id: `m-user-${Date.now()}`,
      sender: "user",
      text,
      time: getFormattedTime()
    };

    // Update state synchronously for user message
    let targetChatId = activeChatId;
    if (!targetChatId) {
      // Create new chat if none is active
      const newChatId = `chat-new-${Date.now()}`;
      
      let initialTag = "Design Assistant";
      let initialIcon: "assistant" | "code" | "travel" | "workflow" = "assistant";
      let initialCategory: "All" | "Productivity" | "Creative" | "Technical" = "Productivity";

      const lower = text.toLowerCase();
      if (lower.includes("code") || lower.includes("python") || lower.includes("regex") || lower.includes("script")) {
        initialTag = "Code Helper";
        initialIcon = "code";
        initialCategory = "Technical";
      } else if (lower.includes("travel") || lower.includes("kyoto") || lower.includes("japan") || lower.includes("vacation") || lower.includes("trip")) {
        initialTag = "Travel Concierge";
        initialIcon = "travel";
        initialCategory = "Creative";
      } else if (lower.includes("propos") || lower.includes("design") || lower.includes("bento") || lower.includes("layout") || lower.includes("ui") || lower.includes("palette")) {
        initialTag = "Design Assistant";
        initialIcon = "assistant";
        initialCategory = "Creative";
      } else if (lower.includes("meeting") || lower.includes("standup") || lower.includes("summar") || lower.includes("work")) {
        initialTag = "Work Flow";
        initialIcon = "workflow";
        initialCategory = "Productivity";
      }

      const newChat: Conversation = {
        id: newChatId,
        title: text.length > 25 ? text.substring(0, 25) + "..." : text,
        lastMessage: text,
        time: "Just now",
        category: initialCategory,
        tag: initialTag,
        iconType: initialIcon,
        providerId: selectedProvider,
        modelId: selectedModel,
        messages: [userMsg]
      };
      setConversations(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      targetChatId = newChatId;
    } else {
      setConversations(prev =>
        prev.map(c => {
          if (c.id === targetChatId) {
            const shouldRename = c.title === "New Conversation" || c.title === "New Chat";
            
            let updatedTag = c.tag;
            let updatedIcon: "assistant" | "code" | "travel" | "workflow" = c.iconType;
            let updatedCategory = c.category;
            
            if (shouldRename) {
              const lower = text.toLowerCase();
              if (lower.includes("code") || lower.includes("python") || lower.includes("regex") || lower.includes("script")) {
                updatedTag = "Code Helper";
                updatedIcon = "code";
                updatedCategory = "Technical";
              } else if (lower.includes("travel") || lower.includes("kyoto") || lower.includes("japan") || lower.includes("vacation") || lower.includes("trip")) {
                updatedTag = "Travel Concierge";
                updatedIcon = "travel";
                updatedCategory = "Creative";
              } else if (lower.includes("propos") || lower.includes("design") || lower.includes("bento") || lower.includes("layout") || lower.includes("ui") || lower.includes("palette")) {
                updatedTag = "Design Assistant";
                updatedIcon = "assistant";
                updatedCategory = "Creative";
              } else if (lower.includes("meeting") || lower.includes("standup") || lower.includes("summar") || lower.includes("work")) {
                updatedTag = "Work Flow";
                updatedIcon = "workflow";
                updatedCategory = "Productivity";
              }
            }

            return {
              ...c,
              title: shouldRename ? (text.length > 25 ? text.substring(0, 25) + "..." : text) : c.title,
              lastMessage: text,
              time: "Just now",
              tag: updatedTag,
              iconType: updatedIcon,
              category: updatedCategory,
              messages: [...c.messages, userMsg]
            };
          }
          return c;
        })
      );
    }

    setInputMessage("");
    setIsGenerating(true);

    try {
      // Gather current history for API payload
      const currentChat = conversations.find(c => c.id === targetChatId);
      const historyPayload = currentChat
        ? currentChat.messages.map(m => ({
            sender: m.sender,
            text: m.text
          }))
        : [];

      const provToSend = currentChat?.providerId || selectedProvider;
      let modelToSend = currentChat?.modelId || selectedModel;
      if (provToSend === "gemini" && (!modelToSend || modelToSend.startsWith("gemini-2.") || modelToSend.startsWith("gemini-1."))) {
        modelToSend = "gemini-3.8-flash";
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provToSend,
          model: modelToSend,
          message: text,
          history: historyPayload
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with PAB AI");
      }

      // Add AI reply to state
      const aiReply: Message = {
        id: `m-ai-${Date.now()}`,
        sender: "ai",
        text: data.text,
        time: getFormattedTime()
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === targetChatId) {
            return {
              ...c,
              lastMessage: data.text.length > 50 ? data.text.substring(0, 50) + "..." : data.text,
              messages: [...c.messages, aiReply]
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: `m-err-${Date.now()}`,
        sender: "ai",
        text: `Error: ${err.message || "Something went wrong. Please check your server connection."}`,
        time: getFormattedTime()
      };
      setConversations(prev =>
        prev.map(c => {
          if (c.id === targetChatId) {
            return {
              ...c,
              messages: [...c.messages, errorMsg]
            };
          }
          return c;
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Setup suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Open Chat Room
  const openChatRoom = (chatId: string) => {
    setActiveChatId(chatId);
    setScreen("chat");
  };

  // Start fresh chat
  const handleStartFreshChat = () => {
    setActiveChatId("");
    setOriginalChatId("");
    setScreen("chat");
    setDrawerOpen(false);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId("");
    }
  };

  // Filter conversations based on query and category
  const filteredConversations = conversations.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="pab-app-root" className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? "dark bg-[#0a0f1e] text-slate-100" : "bg-white text-slate-900"}`}>
      {showProfileModal && user && <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />}

      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-cyan-500/8 dark:bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-violet-500/6 dark:bg-violet-500/4 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-400/4 rounded-full blur-[160px]" />
      </div>

      {/* ── Sidebar Drawer ────────────────────────────────────────── */}
      {drawerOpen && (
        <div id="side-menu-overlay" className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          <aside id="side-menu" className={`relative w-72 max-w-[85vw] h-full flex flex-col z-50 sidebar-panel transition-transform duration-300 ease-out ${
            darkMode ? "bg-[#0d1526] border-r border-white/5" : "bg-white border-r border-slate-100"
          }`}>

            {/* Sidebar Header */}
            <div className={`px-5 py-4 flex items-center justify-between border-b ${
              darkMode ? "border-white/5" : "border-slate-100"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-tight">PAB AI</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Professional Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Nav & History */}
            <div className="flex-1 p-4 flex flex-col min-h-0 gap-3 overflow-hidden">

              {/* New Chat Button */}
              <button
                id="drawer-btn-new-chat"
                onClick={handleStartFreshChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all active:scale-98 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', boxShadow: '0 2px 12px rgba(8,145,178,0.3)' }}
              >
                <Plus className="w-4 h-4" />
                New Conversation
              </button>

              {/* Search */}
              <div className={`relative flex-shrink-0 rounded-xl border transition-all input-ring ${
                darkMode ? "bg-white/5 border-white/8" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search conversations…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-transparent outline-none text-xs placeholder:text-slate-400 text-slate-900 dark:text-white"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar flex-shrink-0">
                {(["All", "Productivity", "Creative", "Technical"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full font-semibold text-[10px] whitespace-nowrap cursor-pointer transition-all ${
                      activeCategory === cat
                        ? "bg-cyan-accent text-white shadow-sm shadow-cyan-500/30"
                        : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Recent</p>
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => { openChatRoom(chat.id); setDrawerOpen(false); }}
                      className={`chat-item group relative flex items-center justify-between pl-3 pr-2 py-2.5 rounded-xl cursor-pointer transition-all ${
                        activeChatId === chat.id
                          ? "active bg-cyan-500/8 dark:bg-cyan-500/10"
                          : "hover:bg-slate-50 dark:hover:bg-white/4"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activeChatId === chat.id
                            ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                            : "bg-slate-100 dark:bg-white/6 text-slate-400"
                        }`}>
                          {renderCategoryIcon(chat.iconType, "w-3.5 h-3.5")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold truncate leading-tight ${
                            activeChatId === chat.id ? "text-cyan-700 dark:text-cyan-400" : "text-slate-700 dark:text-slate-200"
                          }`}>{chat.title}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{chat.lastMessage}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportConversation("txt", chat);
                          }}
                          title="Export conversation"
                          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-cyan-100 dark:hover:bg-cyan-500/15 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(chat.id, e)}
                          title="Delete conversation"
                          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-100 dark:hover:bg-red-500/15 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <MessageSquare className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-[11px] text-slate-400">No conversations yet</p>
                  </div>
                )}
              </div>

              {/* Settings Link */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-2 flex-shrink-0">
                <button
                  id="drawer-btn-settings"
                  onClick={() => { setScreen("settings"); setDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Moon className="w-4 h-4" />
                  Settings & Themes
                </button>
              </div>
            </div>

            {/* Sidebar Footer – User Info */}
            <div className={`px-4 py-3 border-t flex-shrink-0 ${
              darkMode ? "border-white/5" : "border-slate-100"
            }`}>
              {user && (
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/4 transition-colors">
                  <UserAvatar name={user.name} size={8} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <button
                id="drawer-btn-signout"
                onClick={handleLogout}
                className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* SCREEN 1: LOGIN SCREEN */}
      {screen === "login" && (
        <div id="login-screen" className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-12">
          {/* Main Card container mimicking native viewport sizing */}
          <main className="w-full max-w-[440px] flex flex-col items-center">
            
            {/* Brand Identity */}
            <div className="mb-12 text-center animate-fade-in">
              <h1 className="text-[32px] font-extrabold tracking-tight flex items-center gap-3 justify-center text-neutral-900 dark:text-white">
                <span className="w-9 h-9 rounded-lg bg-black flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </span>
                PAB AI
              </h1>
            </div>

            {/* Onboarding / Auth Container */}
            <div className="w-full">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Welcome back</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Enter your credentials to access PAB AI</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-5 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-cyan-accent focus:ring-2 focus:ring-cyan-accent/20 transition-all duration-200 shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  id="login-submit-btn"
                  className="w-full py-4 bg-cyan-accent hover:bg-cyan-accent/90 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all duration-200 shadow-md shadow-cyan-accent/20 flex items-center justify-center cursor-pointer"
                >
                  Continue
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 mb-8 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
                <span className="text-xs text-neutral-400 uppercase tracking-widest font-semibold">OR</span>
                <div className="h-[1px] flex-1 bg-neutral-200 dark:bg-neutral-800"></div>
              </div>

              {/* Social Logins */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    performLogin(
                      "alex.j@google.com",
                      "Alex Johnson",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Hy6QpwLLs-BCxg0kTh-vt0lNCsZ3fJvICpPsVqFQANPT6IyccJOwMIi6of3-wD16Q7vkRWN6uQOZrV0a6BWJ_FxW-yf0isgMwWoTRR68CVJbO5l-dgOz8XniprMf0EDXk4_17u9uk5zflnjC5BD9ne-acnlkGpMSZYoHQLtIDQA1xT3HTJjnq3221IAxapD2f9-Y4Lz4QrS87GkUOXvCY7d1aPXXLKZj8fTmgcxzu0KgSI2n6U4TTDYaoeXstE248ktZWtYQcLFv"
                    );
                  }}
                  className="w-full flex items-center justify-start px-5 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                >
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                    </svg>
                  </div>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => {
                    performLogin(
                      "alex.j@microsoft.com",
                      "Alex Microsoft",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Hy6QpwLLs-BCxg0kTh-vt0lNCsZ3fJvICpPsVqFQANPT6IyccJOwMIi6of3-wD16Q7vkRWN6uQOZrV0a6BWJ_FxW-yf0isgMwWoTRR68CVJbO5l-dgOz8XniprMf0EDXk4_17u9uk5zflnjC5BD9ne-acnlkGpMSZYoHQLtIDQA1xT3HTJjnq3221IAxapD2f9-Y4Lz4QrS87GkUOXvCY7d1aPXXLKZj8fTmgcxzu0KgSI2n6U4TTDYaoeXstE248ktZWtYQcLFv"
                    );
                  }}
                  className="w-full flex items-center justify-start px-5 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="#f25022"></path>
                    </svg>
                  </div>
                  Continue with Microsoft
                </button>

                <button
                  type="button"
                  onClick={() => {
                    performLogin(
                      "alex.j@apple.com",
                      "Alex Apple",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4Hy6QpwLLs-BCxg0kTh-vt0lNCsZ3fJvICpPsVqFQANPT6IyccJOwMIi6of3-wD16Q7vkRWN6uQOZrV0a6BWJ_FxW-yf0isgMwWoTRR68CVJbO5l-dgOz8XniprMf0EDXk4_17u9uk5zflnjC5BD9ne-acnlkGpMSZYoHQLtIDQA1xT3HTJjnq3221IAxapD2f9-Y4Lz4QrS87GkUOXvCY7d1aPXXLKZj8fTmgcxzu0KgSI2n6U4TTDYaoeXstE248ktZWtYQcLFv"
                    );
                  }}
                  className="w-full flex items-center justify-start px-5 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05 1.61-3.14 1.61-1.03 0-1.63-.61-2.82-.61-1.19 0-1.85.59-2.79.61-1.12.02-2.14-.73-3.08-1.61-2.22-2.07-3.23-5.75-2.05-8.38 1.14-2.52 3.48-3.95 5.56-3.95 1.05 0 1.93.31 2.62.65.59.3 1.15.71 1.54.71s.92-.38 1.51-.69c.81-.42 1.83-.81 3.05-.81 1.96 0 3.73 1.04 4.7 2.65-3.86 1.6-3.24 6.94.61 8.52-.77 1.8-1.89 3.32-3.21 4.31zM14.97 4.84c-.38-2.61-2.68-4.72-5.12-4.84.11 2.45 2.19 4.88 4.71 5.09.19-.08.31-.15.41-.25z"></path>
                    </svg>
                  </div>
                  Continue with Apple
                </button>
              </div>
            </div>

            {/* Footer Sign Up */}
            <footer className="mt-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Don't have an account?{" "}
              <button
                onClick={() => setEmailInput("alex.j@example.com")}
                className="text-cyan-accent font-semibold hover:underline decoration-2 underline-offset-4 cursor-pointer"
              >
                Sign up
              </button>
            </footer>
          </main>
        </div>
      )}



      {/* SCREEN 3: ACTIVE CHAT SCREEN */}
      {screen === "chat" && (
        <div id="chat-screen" className="w-full min-h-screen flex flex-col">
          {/* Export Notification Toast */}
          {exportToast && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-white/10 dark:border-slate-200 text-xs font-semibold flex items-center gap-2 animate-fade-slide-up backdrop-blur-md">
              <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
              <span>{exportToast}</span>
            </div>
          )}

          {/* Header */}
          <header className="header-surface fixed top-0 w-full z-40 h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              {showBackButton ? (
                <button onClick={handleBack} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors active:scale-95 cursor-pointer text-neutral-800 dark:text-neutral-100">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all active:scale-95 cursor-pointer shadow-sm ${
                    darkMode
                      ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-100"
                      : "bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                  }`}
                  title="Open Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <button onClick={handleStartFreshChat} className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all active:scale-95 cursor-pointer shadow-sm ${
                darkMode
                  ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-100"
                  : "bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700"
              }`} title="New Chat">
                <Plus className="w-5 h-5 text-neutral-800 dark:text-neutral-100" />
              </button>
            </div>
            
            {/* Center: Model Switcher */}
            <div className="relative flex-1 flex justify-center mx-2">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  darkMode
                    ? "bg-white/5 border-white/8 hover:bg-white/10"
                    : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
                }`}
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="flex flex-col text-left overflow-hidden max-w-[120px] sm:max-w-[220px]">
                  <span className="text-xs font-bold leading-tight truncate capitalize">
                    {providers.find(p => p.id === (activeChat?.providerId || selectedProvider))?.id || "AI Provider"}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight truncate">
                    {providers.find(p => p.id === (activeChat?.providerId || selectedProvider))?.models.find(m => m.id === (activeChat?.modelId || selectedModel))?.name || "Select Model"}
                  </span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ml-1 ${isDropdownOpen ? "rotate-90" : ""}`} />
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className={`absolute top-full mt-2 w-72 rounded-2xl shadow-xl overflow-hidden z-50 animate-scale-in ${
                  darkMode
                    ? "bg-[#0d1526] border border-white/8"
                    : "bg-white border border-slate-200"
                }`} style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}>
                  <div className="max-h-[65vh] overflow-y-auto no-scrollbar p-2">
                    {providers.length > 0 ? providers.map(provider => (
                      <div key={provider.id} className="mb-3 last:mb-0">
                        <div className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg mb-1 ${
                          darkMode ? "text-slate-500 bg-white/4" : "text-slate-400 bg-slate-50"
                        }`}>
                          {provider.id} {!provider.isConfigured && <span className="text-red-400">(not configured)</span>}
                        </div>
                        {provider.isConfigured && provider.models.map(model => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedProvider(provider.id);
                              setSelectedModel(model.id);
                              setIsDropdownOpen(false);
                              if (activeChat) {
                                setConversations(prev => prev.map(c => c.id === activeChat.id ? { ...c, providerId: provider.id, modelId: model.id } : c));
                              }
                            }}
                            className={`w-full text-left px-3 py-2 text-xs rounded-xl flex justify-between items-center transition-all cursor-pointer mt-0.5 ${
                              (activeChat?.modelId || selectedModel) === model.id
                                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold"
                                : darkMode ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="truncate">{model.name}</span>
                            {(activeChat?.modelId || selectedModel) === model.id && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-cyan-500" />}
                          </button>
                        ))}
                      </div>
                    )) : (
                      <div className="p-4 text-center text-xs text-slate-400">Loading configurations...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Export Conversation Dropdown */}
              <div className="relative">
                <button
                  id="export-chat-btn"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    showExportMenu
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
                      : darkMode
                      ? "bg-white/5 border-white/8 hover:bg-white/10 text-slate-300"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
                  }`}
                  title="Export current conversation"
                  aria-label="Export conversation"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                    <div
                      className={`absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden z-50 p-1.5 animate-scale-in ${
                        darkMode
                          ? "bg-[#0d1526] border border-white/8"
                          : "bg-white border border-slate-200"
                      }`}
                      style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)' }}
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-white/6 mb-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Save Conversation</p>
                        <p className="text-xs font-semibold truncate text-slate-700 dark:text-slate-200 mt-0.5">
                          {activeChat?.title || "Current Conversation"}
                        </p>
                      </div>

                      <button
                        onClick={() => exportConversation("txt")}
                        className="w-full text-left px-3 py-2.5 text-xs rounded-xl hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-semibold">Text File (.txt)</p>
                            <p className="text-[10px] text-slate-400">Formatted chat transcript</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500">TXT</span>
                      </button>

                      <button
                        onClick={() => exportConversation("json")}
                        className="w-full text-left px-3 py-2.5 text-xs rounded-xl hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center justify-between cursor-pointer mt-0.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                            <Code className="w-4 h-4 text-violet-500" />
                          </div>
                          <div>
                            <p className="font-semibold">JSON File (.json)</p>
                            <p className="text-[10px] text-slate-400">Structured data & messages</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500">JSON</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-cyan-500/30 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                >
                  {user && <UserAvatar name={user.name} size={9} />}
                </button>
                
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className={`absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden z-50 py-1 animate-scale-in ${
                      darkMode
                        ? "bg-[#0d1526] border border-white/8"
                        : "bg-white border border-slate-200"
                    }`} style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}>
                      {user && (
                        <div className={`px-4 py-3 border-b ${ darkMode ? "border-white/6" : "border-slate-100"}`}>
                          <p className="text-xs font-bold truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                        </div>
                      )}
                      <div className="p-1">
                        <button onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }} className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors">Profile</button>
                        <button onClick={() => { setShowProfileMenu(false); exportConversation("txt"); }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors flex items-center justify-between">
                          <span>Export as .txt</span>
                          <FileText className="w-3.5 h-3.5 text-cyan-500" />
                        </button>
                        <button onClick={() => { setShowProfileMenu(false); exportConversation("json"); }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors flex items-center justify-between">
                          <span>Export as .json</span>
                          <Code className="w-3.5 h-3.5 text-violet-500" />
                        </button>
                        <button onClick={() => { setShowProfileMenu(false); setScreen("settings"); }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors">Settings</button>
                      </div>
                      <div className={`border-t p-1 ${ darkMode ? "border-white/6" : "border-slate-100"}`}>
                        <button onClick={() => { setShowProfileMenu(false); handleLogout(); }} className="w-full text-left px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/8 rounded-xl cursor-pointer transition-colors">Sign Out</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Chat Canvas */}
          <main className="flex-1 pt-14 px-4 max-w-[860px] mx-auto w-full flex flex-col gap-4 overflow-y-auto pb-44 chat-scroll">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-slide-up py-20">
                {/* Brand Icon */}
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0a0f1e] flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Hi, I'm <span className="gradient-text">PAB AI</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base mb-10 max-w-sm">
                  Your professional digital assistant. Ask me anything.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-xl">
                  {[
                    { label: 'Draft a proposal', icon: '✍️' },
                    { label: 'Explain a concept', icon: '💡' },
                    { label: 'Write Python code', icon: '🐍' },
                    { label: 'Summarize a PDF', icon: '📄' },
                    { label: 'Create a presentation', icon: '🎨' },
                    { label: 'Analyze data', icon: '📊' },
                  ].map(({ label, icon }, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(label)}
                      className="suggestion-chip flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium text-left cursor-pointer"
                    >
                      <span className="text-lg">{icon}</span>
                      <span className="text-slate-700 dark:text-slate-300">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center my-2">
                  <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold text-[10px] uppercase tracking-widest shadow-sm">
                    Today
                  </span>
                </div>
                
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 animate-fade-in ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1">
                      {msg.sender === "user" && user ? (
                        <UserAvatar name={user.name} size={8} />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-md shadow-cyan-500/20 flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className={`flex flex-col gap-1 max-w-[78%] ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}>
                      <div className={`px-4 py-3.5 rounded-2xl ${
                        msg.sender === "user"
                          ? "bubble-user text-white rounded-tr-md"
                          : "bubble-ai text-slate-800 dark:text-slate-100 rounded-tl-md"
                      }`}>
                        <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                        {msg.imageUrl && (
                          <div className="rounded-xl overflow-hidden mt-3">
                            <img src={msg.imageUrl} alt="Visual context" className="w-full h-40 object-cover" />
                          </div>
                        )}

                        {msg.bullets && msg.bullets.length > 0 && (
                          <ul className="space-y-1.5 mt-3 pt-3 border-t border-current/10">
                            {msg.bullets.map((b, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-70" />
                                <span className="text-sm opacity-90">{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Message footer */}
                      <div className={`flex items-center gap-2 px-1 ${
                        msg.sender === "user" ? "flex-row-reverse" : ""
                      }`}>
                        <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                        {msg.sender === "ai" && (
                          <div className="flex items-center gap-1">
                            <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 transition-all cursor-pointer" title="Copy"><FileText className="w-3 h-3" /></button>
                            <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 transition-all cursor-pointer" title="Regenerate"><HelpCircle className="w-3 h-3" /></button>
                            <button className="p-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/8 text-slate-300 hover:text-green-500 transition-all cursor-pointer" title="Good response"><CheckCircle className="w-3 h-3" /></button>
                            <button className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/8 text-slate-300 hover:text-red-500 transition-all cursor-pointer" title="Bad response"><Info className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Typing Indicator */}
            {isGenerating && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-md flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bubble-ai px-4 py-3.5 rounded-2xl rounded-tl-md flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-cyan-500 typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-cyan-500 typing-dot" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} className="h-2 w-full" />
          </main>

          {/* Premium Input Bar */}
          <div className="fixed bottom-0 left-0 w-full z-30 px-4 pb-5">
            {/* Fade gradient backdrop */}
            <div className={`absolute inset-0 bg-gradient-to-t to-transparent pointer-events-none ${darkMode ? "from-[#0a0f1e] via-[#0a0f1e]/90" : "from-white via-white/90"}`} />
            
            <div className="relative max-w-[860px] mx-auto">
              {/* Voice recognition error banner */}
              {speechError && (
                <div className="mb-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between animate-fade-slide-up shadow-sm">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>{speechError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSpeechError(null)}
                    className="p-1 hover:bg-amber-500/10 rounded-lg cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
              )}

              {/* Continuous Listening Active Floating Pill */}
              {isListening && (
                <div className={`mb-2.5 px-3.5 py-2 rounded-2xl border transition-all animate-fade-slide-up flex flex-wrap items-center justify-between gap-2 shadow-lg backdrop-blur-xl ${
                  darkMode
                    ? "bg-gradient-to-r from-cyan-950/80 via-slate-900/95 to-purple-950/80 border-cyan-500/30 shadow-cyan-950/40"
                    : "bg-gradient-to-r from-cyan-50/95 via-white/95 to-purple-50/95 border-cyan-200/80 shadow-cyan-900/5"
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute" />
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10.5px] font-bold tracking-wider uppercase">
                      <Radio className="w-3 h-3 animate-pulse text-cyan-500" />
                      <span>Listening</span>
                    </div>

                    {/* Animated audio wave bars */}
                    <div className="flex items-center gap-0.5 h-4 px-1">
                      <span className="audio-wave-bar" />
                      <span className="audio-wave-bar" />
                      <span className="audio-wave-bar" />
                      <span className="audio-wave-bar" />
                      <span className="audio-wave-bar" />
                    </div>

                    <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-medium">
                      {interimTranscript ? (
                        <span className="italic text-cyan-600 dark:text-cyan-400">"{interimTranscript}"</span>
                      ) : (
                        "Continuous microphone active — speak anytime…"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {inputMessage.trim() && (
                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        disabled={isGenerating}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={stopSpeechRecognition}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center gap-1 border border-slate-200 dark:border-white/10"
                      title="Stop continuous voice mode"
                    >
                      <MicOff className="w-3 h-3 text-rose-500" />
                      <span>Stop</span>
                    </button>
                  </div>
                </div>
              )}

              <div className={`relative flex items-end gap-2 px-3 py-3 rounded-2xl input-ring transition-all ${
                isListening
                  ? darkMode
                    ? "bg-[#0d1526]/95 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/10 backdrop-blur-xl"
                    : "bg-white border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/15 backdrop-blur-xl"
                  : darkMode
                    ? "bg-[#0d1526]/90 border border-white/8 backdrop-blur-xl"
                    : "bg-white border border-slate-200 shadow-lg shadow-slate-200/60 backdrop-blur-xl"
              }`}>
                {/* Attachment button */}
                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/8 transition-all cursor-pointer flex-shrink-0 self-end mb-0.5"
                  title="Attach file"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Textarea */}
                <textarea
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    const t = e.target;
                    t.style.height = 'auto';
                    t.style.height = Math.min(t.scrollHeight, 160) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={isListening ? "Listening continuously… Speak now or type…" : "Message PAB AI…"}
                  rows={1}
                  disabled={isGenerating}
                  className="flex-1 bg-transparent outline-none resize-none text-[14.5px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 py-2 px-1 max-h-40 leading-relaxed self-center"
                />

                {/* Right actions */}
                <div className="flex items-center gap-1 flex-shrink-0 self-end mb-0.5">
                  {/* Continuous Voice Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2 rounded-xl transition-all cursor-pointer relative ${
                      isListening
                        ? "bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30 scale-105 active:scale-95 ring-2 ring-rose-400/50"
                        : "text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/8 active:scale-95"
                    }`}
                    title={isListening ? "Continuous listening active — Click to stop" : "Start continuous voice-to-text mode"}
                    aria-label={isListening ? "Stop continuous listening" : "Start continuous listening"}
                  >
                    {isListening ? (
                      <>
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                        <Mic className="w-5 h-5 animate-pulse" />
                      </>
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    id="chat-send-btn"
                    disabled={!inputMessage.trim() || isGenerating}
                    onClick={() => handleSendMessage()}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      inputMessage.trim() && !isGenerating
                        ? "text-white active:scale-95"
                        : "bg-slate-100 dark:bg-white/6 text-slate-300 cursor-not-allowed"
                    }`}
                    style={inputMessage.trim() && !isGenerating ? {
                      background: 'linear-gradient(135deg, #0891b2, #7c3aed)',
                      boxShadow: '0 2px 8px rgba(8,145,178,0.4)'
                    } : {}}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
                PAB AI can make mistakes — verify important information.
              </p>
          </div>
        </div>
      </div>
    )}

      {/* SCREEN 4: USER SETTINGS SCREEN */}
      {screen === "settings" && (
        <div id="settings-screen" className="w-full min-h-screen flex flex-col">
          {/* Header */}
          <header className={`fixed top-0 w-full z-40 backdrop-blur-md shadow-sm h-14 flex items-center justify-between pl-4 pr-4 border-b ${darkMode ? "bg-neutral-900/85 border-neutral-800" : "bg-white/85 border-neutral-200"}`}>
            <div className="flex items-center gap-3">
              {showBackButton ? (
                <button
                  id="global-back-button"
                  onClick={handleBack}
                  className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors active:scale-95 cursor-pointer text-neutral-800 dark:text-neutral-100"
                  title="Go Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <button
                  id="settings-header-menu-btn"
                  onClick={() => setDrawerOpen(true)}
                  className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors active:scale-95 cursor-pointer"
                >
                  <Menu className="w-5 h-5 text-neutral-800 dark:text-neutral-100" />
                </button>
              )}
              <h1 className="font-bold text-lg text-neutral-900 dark:text-white">PAB AI</h1>
            </div>
            
            <div
              onClick={() => setScreen("settings")}
              className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800 active:scale-95 transition-transform cursor-pointer"
            >
              {user && <UserAvatar name={user.name} size={8} />}
            </div>
          </header>

          {/* Main Container */}
          <main className="pt-20 px-4 max-w-2xl mx-auto w-full space-y-8 pb-24">
            
            {/* Profile Section */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold tracking-widest text-neutral-400 uppercase px-1">
                Profile
              </h2>
              
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                
                {/* Profile display card */}
                <div className="flex items-center p-5 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors border-b border-neutral-100 dark:border-neutral-800/60 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-neutral-200 dark:border-neutral-800">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVPYG3CGz9cFuEEJ59DuG5lsLMmybzhgswT0nzMsJmj8mxazBleBFBpRXO395D4YLgrkjGJsX_e7FN2pWDhktskHpammCqvKN-CQ9EL1arv5aiZRlXTe7_7qzfVplRHinxV6W6PLFjBz8u0GPOyooqmDn-5CABRikg95hwcscyzH44lVcZfV6cxMQ47DWgI8iN3tM9H-uj8GvbP_dmtuNSh-4GITsNOWiBYTvtE35nGfNPPI4uEE5qF1qztddLDslQS90BZMdriZng"
                      alt="Alex Johnson Smiling Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-neutral-900 dark:text-white">
                      {user?.name || "Alex Johnson"}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                      {user?.email || "alex.j@example.com"}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                </div>

                {/* Premium Banner */}
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                      Pro Plan Subscription
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold bg-black dark:bg-white text-white dark:text-neutral-950 px-3 py-1 rounded-full tracking-wider">
                    ACTIVE
                  </span>
                </div>
              </div>
            </section>

            {/* Preferences Section */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold tracking-widest text-neutral-400 uppercase px-1">
                Preferences
              </h2>

              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                
                {/* Dark Mode toggle */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800/60">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                      <Moon className="w-5 h-5" />
                    </div>
                    <span className="text-[15px] font-medium text-neutral-800 dark:text-neutral-100">
                      {t("darkMode")}
                    </span>
                  </div>
                  <div className="relative inline-block w-10 mr-1 select-none">
                    <input
                      type="checkbox"
                      id="dark-mode-toggle"
                      checked={darkMode}
                      onChange={() => setDarkMode(!darkMode)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-neutral-200 dark:border-neutral-800 appearance-none cursor-pointer transition-all duration-300 ease-in-out right-4 checked:right-0 checked:border-cyan-accent"
                    />
                    <label
                      htmlFor="dark-mode-toggle"
                      className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ease-in-out ${
                        darkMode ? "bg-cyan-accent" : "bg-neutral-200 dark:bg-neutral-700"
                      }`}
                    ></label>
                  </div>
                </div>

                {/* Notifications trigger */}
                <div
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-medium text-neutral-800 dark:text-neutral-100">
                        {t("notifications")}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
                        {notificationsEnabled ? t("enabled") : t("disabled")}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                </div>

                {/* Language selection buttons */}
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-[15px] font-medium text-neutral-800 dark:text-neutral-100">
                      {t("language")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["en", "ta", "ja", "zh", "fr"].map((lng) => (
                      <button
                        key={lng}
                        onClick={() => i18n.changeLanguage(lng)}
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          i18n.language === lng
                            ? "bg-cyan-accent text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                        }`}
                      >
                        {lng.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* About metrics */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold tracking-widest text-neutral-400 uppercase px-1">
                About
              </h2>

              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                
                {/* Help Center link */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[15px] font-medium text-neutral-800 dark:text-neutral-100">
                      Help Center
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                </div>

                {/* Privacy Policy */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-[15px] font-medium text-neutral-800 dark:text-neutral-100">
                      Privacy Policy
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                </div>

                {/* App Version */}
                <div className="flex items-center justify-between p-4 text-neutral-400">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                      <Info className="w-5 h-5" />
                    </div>
                    <span className="text-[15px] font-medium text-neutral-800 dark:text-neutral-100">
                      Version
                    </span>
                  </div>
                  <span className="text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-3 py-1 rounded-full">
                    v2.4.0 (Stable)
                  </span>
                </div>
              </div>
            </section>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="w-full py-4 text-red-500 font-bold border border-red-500/20 rounded-2xl bg-red-500/5 hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              {t("signOut")}
            </button>
          </main>
        </div>
      )}
    </div>
  );
}
