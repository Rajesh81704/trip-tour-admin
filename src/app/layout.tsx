import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthWrapper from "@/components/wrapper/auth";
import ReduxStoreProvider from "@/store/store";
import Sidebar from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TripToo Travels Admin Dashboard",
  description: "TripToo Travels Admin Dashboard - Package Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ReduxStoreProvider>
          <AuthWrapper>
            <Sidebar>{children}</Sidebar>
          </AuthWrapper>
        </ReduxStoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
