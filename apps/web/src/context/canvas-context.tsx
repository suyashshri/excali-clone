"use client";

import { createContext, useContext, useState } from "react";

interface canvasToolType {
  selectedButton: string;
  setSelectedButton: (tool: string) => void;
}

const canvasToolContext = createContext<canvasToolType | undefined>(undefined);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [selectedButton, setSelectedButton] = useState<string>("Rectangle");
  return (
    <canvasToolContext.Provider value={{ selectedButton, setSelectedButton }}>
      {children}
    </canvasToolContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(canvasToolContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}
