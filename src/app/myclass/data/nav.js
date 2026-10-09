const topicPaths = ["/ancient", "/grammar", "/words", "/idioms", "/script"];

export const mainNav = [
  { label: "Нүүр", icon: "🏠", href: "/myclass/dashboard" },
  { label: "Дасгалууд", icon: "🎓", href: "/myclass/lessons", also: topicPaths }, // stays highlighted inside topic pages
  { label: "Төлөвлөгөө", icon: "📅", href: "/myclass/plan" },
  { label: "Статистик", icon: "📊", href: "/myclass/stats" },
  { label: "Хадгалсан", icon: "🔖", href: "/myclass/saved" },
];

// lesson counts are placeholders - replace with real data
export const topics = [
  { label: "Эртний үг", icon: "📜", href: "/ancient", desc: "Эртний монгол үгс, тэдгээрийн утга ба хэрэглээ", lessons: 12 },
  { label: "Зөв бичих дүрэм", icon: "✍️", href: "/grammar", desc: "Зөв бичгийн дүрэм, түгээмэл алдаанууд", lessons: 24 },
  { label: "Журамласан үг", icon: "🗣️", href: "/words", desc: "Журамласан үгсийг зөв хэрэглэх нь", lessons: 18 },
  { label: "Хэлц үг", icon: "💬", href: "/idioms", desc: "Өдөр тутмын яриан дахь хэлц, зүйр цэцэн үг", lessons: 15, badge: "Шинэ" },
  { label: "Монгол бичиг", icon: "🖋️", href: "/script", desc: "Уламжлалт босоо бичгийг эхнээс нь сурах", lessons: 20 },
];