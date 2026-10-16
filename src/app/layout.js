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