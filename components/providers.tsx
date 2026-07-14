"use client";

import React, { createContext, useContext, useState } from "react";
import { DomainId } from "@/content/types";

interface AppContextType {
  focus: DomainId | null;
  setFocus: (f: DomainId | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [focus, setFocus] = useState<DomainId | null>(null);

  return (
    <AppContext.Provider value={{ focus, setFocus }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
