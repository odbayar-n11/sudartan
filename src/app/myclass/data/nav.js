import {
  Home,
  GraduationCap,
  CalendarDays,
  AlertCircle,
  Bookmark,
  PenLine,
  Mic,
  MessageCircle,
  PenTool,
  ScrollText,
  BookOpen,
} from "lucide-react";

const topicPaths = ["/ancient", "/grammar", "/vg", "/quiz", "/idioms", "/script", "/uran-durslel"];

export const mainNav = [
  { label: "Нүүр", icon: Home, href: "/myclass/dashboard" },
  { label: "Дасгалууд", icon: GraduationCap, href: "/myclass/lessons", also: topicPaths },
  { label: "Төлөвлөгөө", icon: CalendarDays, href: "/myclass/plan" },
  { label: "Алдсан", icon: AlertCircle, href: "/myclass/mistakes" },
  { label: "Хадгалсан", icon: Bookmark, href: "/myclass/saved" },
];

// lesson counts are placeholders - replace with real data
export const topics = [
  { label: "Зөв бичих дүрэм", icon: PenLine, href: "/grammar", desc: "Зөв бичгийн дүрэм, түгээмэл алдаанууд", lessons: 24 },
  { label: "Журамласан үг", icon: Mic, href: "/vg", desc: "Журамласан үгсийг зөв хэрэглэх нь", lessons: 18 },
  { label: "Хэлц үг", icon: MessageCircle, href: "/idioms", desc: "Өдөр тутмын яриан дахь хэлц, зүйр цэцэн үг", lessons: 15, badge: "Шинэ" },
  { label: "Монгол бичиг", icon: PenTool, href: "/script", desc: "Уламжлалт босоо бичгийг эхнээс нь сурах", lessons: 20 },
  { label: "Эртний үг", icon: ScrollText, href: "/ancient", desc: "Эртний монгол үгс, тэдгээрийн утга ба хэрэглээ", lessons: 4 },
  { label: "Уран дүрслэл", icon: BookOpen, href: "/uran-durslel", desc: "Адилтгал, зүйрлэл, хүншүүлэл...", lessons: 10 },
];