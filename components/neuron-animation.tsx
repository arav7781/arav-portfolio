"use client"

import { useRef, useEffect } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Sphere } from "@react-three/drei"

function NeuronNetwork() {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.z = state.clock.getElapsedTime() * 0.03
    }
  })

  // Generate neurons (points)
  const particleCount = 800
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    // Create a sphere of points
    const radius = 5 + Math.random() * 8
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = radius * Math.cos(phi)

    // Gradient colors from violet to fuchsia
    colors[i3] = 0.5 + Math.random() * 0.5 // R
    colors[i3 + 1] = 0.2 + Math.random() * 0.3 // G
    colors[i3 + 2] = 0.8 + Math.random() * 0.2 // B

    // Varied sizes
    sizes[i] = Math.random() * 0.2 + 0.05
  }

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

  // Custom shader material for better-looking particles
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float time;
      uniform float pixelRatio;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  useFrame(({ clock }) => {
    if (particleMaterial) {
      particleMaterial.uniforms.time.value = clock.getElapsedTime()
    }
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={particleGeometry} material={particleMaterial} />
      <ConnectionLines positions={positions} count={particleCount} />
      <CoreSphere />
    </group>
  )
}

function CoreSphere() {
  const sphereRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.1
      sphereRef.current.rotation.z = clock.getElapsedTime() * 0.05
    }
  })

  return (
    <Sphere ref={sphereRef} args={[1.5, 32, 32]} position={[0, 0, 0]}>
      <meshBasicMaterial color="#8b5cf6" transparent opacity={0.1} />
    </Sphere>
  )
}

function ConnectionLines({ positions, count }: { positions: Float32Array; count: number }) {
  const linesRef = useRef<THREE.LineSegments>(null)

  useEffect(() => {
    // Create connections between nearby neurons
    const indices: number[] = []
    const linePositions: number[] = []
    const lineColors: number[] = []

    const maxDistance = 3 // Maximum distance for connection
    const maxConnections = 3 // Maximum connections per neuron

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const connections = []

      for (let j = i + 1; j < count; j++) {
        if (connections.length >= maxConnections) break

        const j3 = j * 3
        const dx = positions[i3] - positions[j3]
        const dy = positions[i3 + 1] - positions[j3 + 1]
        const dz = positions[i3 + 2] - positions[j3 + 2]
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < maxDistance) {
          connections.push(j)

          // Add line vertices
          linePositions.push(
            positions[i3],
            positions[i3 + 1],
            positions[i3 + 2],
            positions[j3],
            positions[j3 + 1],
            positions[j3 + 2],
          )

          // Add line colors (gradient from start to end)
          const alpha = Math.max(0.1, 1 - distance / maxDistance)
          lineColors.push(
            0.7,
            0.3,
            0.9,
            alpha, // Start color (violet)
            0.9,
            0.2,
            0.6,
            alpha, // End color (fuchsia)
          )
        }
      }
    }

    if (linesRef.current) {
      const geometry = linesRef.current.geometry
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3))
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 4))
    }
  }, [positions, count])

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry />
      <lineBasicMaterial vertexColors transparent opacity={0.2} />
    </lineSegments>
  )
}

export default function NeuronAnimation() {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 60 }}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      dpr={[1, 2]} // Optimize for performance and quality
    >
      <ambientLight intensity={0.5} />
      <NeuronNetwork />
      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.5}
        rotateSpeed={0.2}
      />
    </Canvas>
  )
}
