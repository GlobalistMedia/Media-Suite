import "./globals.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Providers from "./providers"; // 1. Import your new wrapper component
// import { Header } from "@/components/header";
// import { Footer } from "@/components/footer";

// Configure Inter font (similar to the clean sans-serif in your image)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Configure Poppins as an alternative (also very clean and modern)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Globalist Media Suite",
  description:
    "Globalist Media Suite is a modular content platform for creators, publishers, and media teams to manage AI-driven creation, SEO, publishing, and syndication.",
  icons: "/apple-touch-icon.png",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link
          rel="icon"
          href="/icon-192.png"
          sizes="192x192"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
      </head>
      <body className="font-inter antialiased">
        {/* 2. Use the Providers component to wrap your children */}
        <Providers>
          {/* <Header /> */}
          {children}
          {/* <Footer /> */}
        </Providers>
      </body>
    </html>
  );
}
