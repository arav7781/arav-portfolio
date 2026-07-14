"use client";

import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { DOMAINS, NODES } from "@/content/corpus";
import { primaryDomain } from "@/lib/graph";
import { domainVar } from "@/lib/ui";
import { DomainId } from "@/content/types";

interface Node3D {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  label: string;
}

interface Edge3D {
  source: [number, number, number];
  target: [number, number, number];
  color: string;
  opacity: number;
}

function GraphScene() {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Slow auto-rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  // Calculate 3D positions of the nodes
  const nodes3D: Node3D[] = useMemo(() => {
    const list: Node3D[] = [];

    // Center Node (Arav)
    list.push({
      id: "arav",
      position: [0, 0, 0],
      color: "#18181b",
      size: 0.55,
      label: "Arav Saxena"
    });

    // 5 Domains
    DOMAINS.forEach((d) => {
      const angle = (d.order * 2 * Math.PI) / DOMAINS.length;
      const x = 3.2 * Math.cos(angle);
      const y = 3.2 * Math.sin(angle);
      const z = d.order % 2 === 0 ? 0.7 : -0.7;
      list.push({
        id: `domain-${d.id}`,
        position: [x, y, z],
        color: domainVar(d.id),
        size: 0.38,
        label: d.label
      });
    });

    // Other nodes (Projects, Experiences, Skills) grouped organically
    NODES.forEach((n) => {
      if (n.id === "arav" || n.type === "domain") return;
      const pd = primaryDomain(n) || "ai";
      const dIdx = DOMAINS.findIndex((dom) => dom.id === pd);
      const dAngle = (dIdx * 2 * Math.PI) / DOMAINS.length;

      // Seed pseudo-random placement based on node ID to avoid randomness on every render
      let hash = 0;
      for (let i = 0; i < n.id.length; i++) hash += n.id.charCodeAt(i);
      const theta = (hash % 100) * 0.01 * 2 * Math.PI;
      const phi = ((hash * 17) % 100) * 0.01 * Math.PI;
      
      const r = n.type === "skill" ? 1.3 : 0.75;
      const dx = r * Math.sin(phi) * Math.cos(theta);
      const dy = r * Math.sin(phi) * Math.sin(theta);
      const dz = r * Math.cos(phi);

      const bx = 3.2 * Math.cos(dAngle);
      const by = 3.2 * Math.sin(dAngle);
      const bz = dIdx % 2 === 0 ? 0.7 : -0.7;

      list.push({
        id: n.id,
        position: [bx + dx, by + dy, bz + dz],
        color: n.type === "achievement" ? "#8b5cf6" : domainVar(pd),
        size: n.type === "skill" ? 0.09 : 0.18,
        label: n.label
      });
    });

    return list;
  }, []);

  // Calculate 3D edges
  const edges3D: Edge3D[] = useMemo(() => {
    const list: Edge3D[] = [];
    const byId = new Map<string, Node3D>();
    nodes3D.forEach((n) => byId.set(n.id, n));

    // Connect center to domains
    DOMAINS.forEach((d) => {
      const s = byId.get("arav");
      const t = byId.get(`domain-${d.id}`);
      if (s && t) {
        list.push({
          source: s.position,
          target: t.position,
          color: domainVar(d.id),
          opacity: 0.4
        });
      }
    });

    // Connect other nodes to their domains
    NODES.forEach((node) => {
      if (node.id === "arav" || node.type === "domain") return;
      const pd = primaryDomain(node);
      if (pd) {
        const s = byId.get(`domain-${pd}`);
        const t = byId.get(node.id);
        if (s && t) {
          list.push({
            source: s.position,
            target: t.position,
            color: domainVar(pd),
            opacity: node.type === "skill" ? 0.08 : 0.18
          });
        }
      }
    });

    return list;
  }, [nodes3D]);

  return (
    <group ref={groupRef}>
      {/* Edges */}
      {edges3D.map((edge, i) => {
        const points = [
          new THREE.Vector3(...edge.source),
          new THREE.Vector3(...edge.target)
        ];
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={i} geometry={lineGeom}>
            <lineBasicMaterial
              color={edge.color}
              transparent
              opacity={edge.opacity}
              linewidth={1}
            />
          </line>
        );
      })}

      {/* Nodes */}
      {nodes3D.map((node) => {
        const isHovered = hoveredNode === node.id;
        const radius = node.size * (isHovered ? 1.25 : 1.0);

        return (
          <mesh
            key={node.id}
            position={node.position}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNode(node.id);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredNode(null);
            }}
          >
            <sphereGeometry args={[radius, 16, 16]} />
            <meshBasicMaterial color={node.color} />

            {/* Floating Labels on Hover */}
            {isHovered && (
              <Html distanceFactor={8} zIndexRange={[100, 0]} pointerEvents="none">
                <div className="px-2 py-1 rounded bg-slate-900/90 text-white text-[9px] font-mono whitespace-nowrap shadow-md border border-slate-700/50">
                  {node.label}
                </div>
              </Html>
            )}
          </mesh>
        );
      })}
    </group>
  );
}

export function HeroGraph3D() {
  return (
    <div className="w-full h-[320px] relative overflow-hidden bg-transparent select-none cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <GraphScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.6}
          minPolarAngle={Math.PI / 2.4}
        />
      </Canvas>
    </div>
  );
}

export default HeroGraph3D;
