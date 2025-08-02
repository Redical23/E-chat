import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/client-wrapper"; // ✅ Import the wrapper
import { SessionProvider } from "next-auth/react";
import { ModelProvider } from "./context/Context";
import Contentwapper from "./context/Contentwapper"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "E-CHAT – Secure Real-Time Messaging",
  description:
    "E-CHAT is a secure, real-time messaging platform where users can connect and chat using their email. Enjoy end-to-end encrypted conversations, private messaging, and seamless communication anytime, anywhere.",
  keywords: [
    "chat app",
    "real-time messaging",
    "secure chat",
    "email chat",
    "private messaging",
    "encrypted chat",
    "E-CHAT",
    "chat with email",
    "online messaging",
    "secure communication",
  ],
  openGraph: {
    title: "E-CHAT – Secure Real-Time Messaging",
    description:
      "Chat securely using your email with end-to-end encryption on E-CHAT. Stay connected with private, real-time messaging.",
    url: "https://your-domain.com", // replace with your actual domain
    type: "website",
    siteName: "E-CHAT",
    images: [
      {
        url: "https://your-domain.com/og-image.png", // replace with your actual Open Graph image URL
        width: 1200,
        height: 630,
        alt: "E-CHAT – Secure Real-Time Messaging",
      },
    ],
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientWrapper>

         <ModelProvider>
          <Contentwapper>
        {children}
          </Contentwapper>
      </ModelProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}
