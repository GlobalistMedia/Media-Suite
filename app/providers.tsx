// This is the most important line! It marks this file as a Client Component.
"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { CustomSonner } from "@/components/ui/sonner";
import React from "react";

// This component will wrap all of our client-side providers
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // 1. SessionProvider for NextAuth.js
    <SessionProvider>
      {/* 2. ThemeProvider for your light/dark mode */}
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {/* Your app's content will go here */}
        {children}

        {/* These components are part of the theme/UI, so they stay inside it */}
        <Toaster />
        <CustomSonner />
      </ThemeProvider>
    </SessionProvider>
  );
}
