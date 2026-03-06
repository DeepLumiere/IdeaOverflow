"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { EditorProvider } from "@/context/EditorContext";
import { ManuscriptProvider } from "@/context/ManuscriptContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EditorProvider>
          <ManuscriptProvider>{children}</ManuscriptProvider>
        </EditorProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

