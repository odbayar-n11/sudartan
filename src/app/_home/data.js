// Text and lists shown on the homepage. Edit content here, not in the components.

export const NAV_LINKS = [
  { href: "#contact", label: "Холбоо барих" },
  { href: "#faq", label: "Асуулт & хариулт" },
  { href: "#offer", label: "Үйлчилгээ" },
  { href: "#about", label: "Бидний тухай" },
  { href: "#home", label: "Нүүр", active: true },
];

export const NAV_ORDER = [...NAV_LINKS].reverse();

export const STATS = [
  { value: "...", label: "Суралцагч" },
  { value: "...", label: "Хичээл" },
  { value: "...", label: "Туршлага" },
  { value: "...", label: "Сэтгэл ханамж" },
];

export const OFFERS = [
  {
    title: "Үгийн сан",
    desc: "Кирилл монгол хэлэнд түгээмэл алдаатай бичигддэг журамласан 700 үгийг зөв бичиж сурах дасгал ажлууд",
    icon: "pencil",
  },
  {
    title: "Зөв бичих дүрэм",
    desc: "Гээгдэх гээгдэхгүй эгшгийн дүрэм, эгшигт болон заримдаг гийгүүлэгчийн дүрэм, зөөлний тэмдгийн дүрэм гэх мэт зөв бичгийн дүрмийн дасгалууд",
    icon: "book",
  },
  {
    title: "Монгол бичиг",
    desc: "Хэл бичгийн элсэлтийн шалгалтанд орж ирдэг богино эхүүдийг кирилл бичигт хөрвүүлэх дасгалууд",
    icon: "quill",
  },
  {
    title: "Хэлц үгс",
    desc: "Одоогийн нийгэмд цөөн хэрэглэгдэх өвөрмөц далд утгатай хэлц үгсийг танин мэдэх",
    icon: "bubble",
  },
];

export const FAQS = [
  {
    q: "Төлбөртэй юу?",
    a: "Үгүй.",
  },
  {
    q: "Үр дүнтэй юу?",
    a: "Тийм ээ, өдөр бүр тогтмол дасгал хийсэн суралцагчид 4–6 долоо хоногийн дараа зөв бичих дүрэмдээ мэдэгдэхүйц ахиц гаргадаг.",
  },
  {
    q: "Гар утсанд ашиглах боломжтой юу?",
    a: "Тийм ээ, вэбсайт бүх төхөөрөмж дээр ажиллана",
  },
  {
    q: "Эх сурвалж баталгаатай юу?",
    a: "Тийм ээ, бид 2017 оны журамласан толь болон монгол хэлний мэргэжлийн багш нараас зөвлөгөө аван ажилладаг.",
  },
];

// Add `photo` (a file in public/) to show a founder's picture instead of the sheep.
// Optional `photoPos` moves the photo inside the circle (default "50% 20%"; smaller 2nd number = photo sits lower).
export const FOUNDERS = [
  { name: "Н. Одбаяр", photo: "/images/founders/odbayar.jpg", photoPos: "50% 8%" },
  { name: "С. Төгөлдөр", photo: "/images/founders/tuguldur.jpg", photoPos: "50% 50%" },
  { name: "С. Мичид", photo: "/images/founders/michid.jpg" },
  { name: "У. Ундрам", photo: "/images/founders/undram.jpg" },
  { name: "Л. Өсөх-Ирээдүй", photo: "/images/founders/usukh-ireedui.jpg", photoPos: "50% 30%" },
];

export const AVATAR_BG = ["#38BDF8", "#0284C7", "#0ea5e9", "#7dd3fc", "#0369a1"];
