import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Судартан",
  description: "Хэл бичгийн элсэлтийн шалгалтад бэлдэх талбар",
};

// viewportFit "cover" lets env(safe-area-inset-bottom) work on iPhone,
// so the bottom tab bar clears the home indicator.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="mn"
      style={{ colorScheme: "light" }}
      className={`light ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 light">
        {children}
      </body>
    </html>
  );
}