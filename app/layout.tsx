import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Sound Bite | Long Island Sound Fishing Windows",
  description: "Tide, wind, and light fishing windows for coastal Connecticut."
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}