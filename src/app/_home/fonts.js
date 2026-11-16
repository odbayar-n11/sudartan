import { Nunito, Irish_Grover } from "next/font/google";

export const display = Nunito({
  subsets: ["cyrillic", "latin"],
  weight: ["800", "900"],
  variable: "--font-display",
});

export const body = Nunito({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
});

export const irishGrover = Irish_Grover({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-irish",
});

// All font CSS variables, to put on the page's outer element.
export const fontVariables = `${display.variable} ${body.variable} ${irishGrover.variable}`;
