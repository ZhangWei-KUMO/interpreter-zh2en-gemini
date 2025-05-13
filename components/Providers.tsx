'use client';

import { ReactNode } from 'react';
import { ConsoleVisibilityProvider } from "@/contexts/ConsoleVisibilityContext";
import { LiveAPIProvider } from "@/contexts/LiveAPIContext";

// Get API key only in browser environment
const getApiKey = () => {
  if (typeof window !== 'undefined' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY || ""
  }
  return '';
};

const API_KEY = getApiKey();
if (typeof window !== 'undefined' && !API_KEY) {
  // This check remains client-side
  throw new Error("set GEMINI_API_KEY in .env");
}

// const host = "generativelanguage.googleapis.com";
const host = "gemini-wss.tubex.chat";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConsoleVisibilityProvider>
      <LiveAPIProvider url={uri} apiKey={API_KEY || ''}>
        {children}
      </LiveAPIProvider>
    </ConsoleVisibilityProvider>
  );
} 