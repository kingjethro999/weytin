import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weytin | Supply & Demand Monitoring Platform",
  description: "Location-aware supply and demand tracking for Nigerian markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" style={{ colorScheme: 'dark' }}>
      <body className={`${sans.variable} ${mono.variable} min-h-full font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
