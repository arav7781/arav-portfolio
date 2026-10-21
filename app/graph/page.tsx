"use client";

import Navbar from "@/components/navbar";
import GraphMount from "@/components/graph/graph-mount";

export default function GraphPage() {
  return (
    <main className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden">
      <Navbar />
      <div className="absolute inset-0 overflow-hidden pt-[76px]">
        <GraphMount />
      </div>
    </main>
  );
}
