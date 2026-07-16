import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      "settings": "Settings",
      "darkMode": "Dark Mode",
      "notifications": "Notifications",
      "language": "Language",
      "enabled": "Enabled",
      "disabled": "Disabled",
      "signOut": "Sign Out",
      "chat": "Chat",
      "history": "History",
      "all": "All",
      "productivity": "Productivity",
      "creative": "Creative",
      "technical": "Technical",
      "askPabAi": "Ask PAB AI",
      "send": "Send",
      "searchHistory": "Search history...",
      "previousChats": "Previous Chats"
    }
  },
  ta: {
    translation: {
      "settings": "அமைப்புகள்",
      "darkMode": "இருண்ட பயன்முறை",
      "notifications": "அறிவிப்புகள்",
      "language": "மொழி",
      "enabled": "இயக்கப்பட்டது",
      "disabled": "முடக்கப்பட்டது",
      "signOut": "வெளியேறு",
      "chat": "அரட்டை",
      "history": "வரலாறு",
      "all": "அனைத்தும்",
      "productivity": "உற்பத்தித்திறன்",
      "creative": "படைப்பாற்றல்",
      "technical": "தொழில்நுட்பம்",
      "askPabAi": "PAB AI ஐ கேளுங்கள்",
      "send": "அனுப்பு",
      "searchHistory": "வரலாற்றைத் தேடுங்கள்...",
      "previousChats": "முந்தைய அரட்டைகள்"
    }
  },
  ja: {
    translation: {
      "settings": "設定",
      "darkMode": "ダークモード",
      "notifications": "通知",
      "language": "言語",
      "enabled": "有効",
      "disabled": "無効",
      "signOut": "サインアウト",
      "chat": "チャット",
      "history": "履歴",
      "all": "すべて",
      "productivity": "生産性",
      "creative": "クリエイティブ",
      "technical": "技術",
      "askPabAi": "PAB AIに質問",
      "send": "送信",
      "searchHistory": "履歴を検索...",
      "previousChats": "以前のチャット"
    }
  },
  zh: {
    translation: {
      "settings": "设置",
      "darkMode": "深色模式",
      "notifications": "通知",
      "language": "语言",
      "enabled": "已启用",
      "disabled": "已禁用",
      "signOut": "登出",
      "chat": "聊天",
      "history": "历史记录",
      "all": "全部",
      "productivity": "生产力",
      "creative": "创意",
      "technical": "技术",
      "askPabAi": "询问 PAB AI",
      "send": "发送",
      "searchHistory": "搜索历史...",
      "previousChats": "以前的聊天"
    }
  },
  fr: {
    translation: {
      "settings": "Paramètres",
      "darkMode": "Mode sombre",
      "notifications": "Notifications",
      "language": "Langue",
      "enabled": "Activé",
      "disabled": "Désactivé",
      "signOut": "Se déconnecter",
      "chat": "Discuter",
      "history": "Historique",
      "all": "Tous",
      "productivity": "Productivité",
      "creative": "Créatif",
      "technical": "Technique",
      "askPabAi": "Demander à PAB AI",
      "send": "Envoyer",
      "searchHistory": "Rechercher dans l'historique...",
      "previousChats": "Chats précédents"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
