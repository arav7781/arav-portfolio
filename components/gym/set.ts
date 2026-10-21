import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { seeded } from "./motion"

/*
 * The gym around the lifter: rubber floor, an oak and rubber lifting platform, a painted
 * block wall with a neon sign, a power rack with a bar racked in it, a dumbbell rack and
 * kettlebells. Static props are merged per material so the room costs few draw calls.
 */

type Track = <D extends { dispose: () => void }>(d: D) => D
type Tex = (c: HTMLCanvasElement, srgb?: boolean) => THREE.CanvasTexture

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  return { c, g: c.getContext("2d")! }
}

/** Rubber flooring: near-black tiles with flecks and seams. */
export function makeRubber(size: number, tiles: number, seed: number, base = "#14161d") {
  const { c, g } = canvas(size, size)
  const rnd = seeded(seed)
  g.fillStyle = base
  g.fillRect(0, 0, size, size)
  for (let i = 0; i < size * 6; i++) {
    const v = rnd()
    g.fillStyle = v < 0.85 ? `rgba(225,232,255,${0.02 + rnd() * 0.05})` : `rgba(120,135,170,${0.05 + rnd() * 0.08})`
    g.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 2, 1 + rnd() * 2)
  }
  g.strokeStyle = "rgba(0,0,0,.65)"
  g.lineWidth = 3
  const step = size / tiles
  for (let k = 0; k <= tiles; k++) {
    g.beginPath(); g.moveTo(k * step, 0); g.lineTo(k * step, size); g.stroke()
    g.beginPath(); g.moveTo(0, k * step); g.lineTo(size, k * step); g.stroke()
  }
  return c
}

/** Lifting platform, 2.6 m x 2.0 m: oak planks down the middle, rubber both sides, a steel frame. */
export function makePlatform() {
  const w = 2048, h = 1576
  const { c, g } = canvas(w, h)
  const rnd = seeded(23)
  g.fillStyle = g.createPattern(makeRubber(512, 1, 5, "#17191f"), "repeat")!
  g.fillRect(0, 0, w, h)
  const wx0 = w * (0.75 / 2.6), wx1 = w * (1.85 / 2.6)
  const plank = (wx1 - wx0) / 6
  for (let p = 0; p < 6; p++) {
    let y0 = -rnd() * 400
    while (y0 < h) {
      const len = 500 + rnd() * 700, tone = 0.82 + rnd() * 0.3
      g.fillStyle = `rgb(${Math.round(156 * tone)},${Math.round(112 * tone)},${Math.round(70 * tone)})`
      const x0 = wx0 + p * plank
      g.fillRect(x0, y0, plank, len)
      g.save()
      g.beginPath(); g.rect(x0, y0, plank, len); g.clip()
      for (let i = 0; i < 26; i++) {
        const lx = x0 + rnd() * plank, amp = 1 + rnd() * 5, ph = rnd() * 6.28, a = 0.05 + rnd() * 0.14
        g.strokeStyle = rnd() < 0.7 ? `rgba(60,34,14,${a})` : `rgba(255,224,180,${a * 0.5})`
        g.lineWidth = 0.6 + rnd() * 1.8
        g.beginPath()
        for (let y = y0; y <= y0 + len; y += 8) {
          const x = lx + Math.sin(y * 0.004 + ph) * amp
          if (y === y0) g.moveTo(x, y)
          else g.lineTo(x, y)
        }
        g.stroke()
      }
      g.restore()
      g.fillStyle = "rgba(25,14,6,.7)"
      g.fillRect(x0, y0 + len - 2, plank, 2)
      g.fillRect(x0, y0, 2, len)
      y0 += len
    }
  }
  // chalk where hands and feet have been
  for (let i = 0; i < 18; i++) {
    g.fillStyle = `rgba(245,242,236,${0.02 + rnd() * 0.05})`
    g.beginPath()
    g.ellipse(wx0 + rnd() * (wx1 - wx0), h * (0.3 + rnd() * 0.4), 20 + rnd() * 60, 10 + rnd() * 30, rnd() * 3, 0, Math.PI * 2)
    g.fill()
  }
  g.strokeStyle = "#2b2d33"
  g.lineWidth = 18
  g.strokeRect(9, 9, w - 18, h - 18)
  g.strokeStyle = "rgba(255,255,255,.08)"
  g.lineWidth = 2
  g.strokeRect(19, 19, w - 38, h - 38)
  return c
}

/** A bumper plate face: rubber disc, colour band, big weight, a label, a steel hub. */
export function makePlateFace(label: string, kg: number, color: string, display: string, mono: string) {
  const S = 512, R = S / 2
  const { c, g } = canvas(S, S)
  g.translate(R, R)
  const disc = g.createRadialGradient(0, 0, R * 0.2, 0, 0, R)
  disc.addColorStop(0, "#20222a")
  disc.addColorStop(1, "#111217")
  g.fillStyle = disc
  g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill()
  g.strokeStyle = "rgba(255,255,255,.07)"
  g.lineWidth = 12
  g.beginPath(); g.arc(0, 0, R - 10, 0, Math.PI * 2); g.stroke()
  g.strokeStyle = color
  g.lineWidth = 16
  g.beginPath(); g.arc(0, 0, R * 0.82, 0, Math.PI * 2); g.stroke()
  g.fillStyle = "#F3F0EA"
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.font = `800 ${kg >= 10 ? 118 : 104}px ${display}`
  g.fillText(String(kg), -8, -R * 0.5)
  g.font = `600 30px ${mono}`
  g.fillStyle = color
  g.fillText("KG", g.measureText(String(kg)).width / 2 + 40, -R * 0.5 + 26)
  if (label) {
    g.fillStyle = "#F3F0EA"
    g.font = `700 ${label.length > 8 ? 34 : 44}px ${display}`
    g.fillText(label, 0, R * 0.5)
  }
  const hub = g.createRadialGradient(-R * 0.05, -R * 0.06, R * 0.02, 0, 0, R * 0.24)
  hub.addColorStop(0, "#f4f5f7")
  hub.addColorStop(0.55, "#a2a8b0")
  hub.addColorStop(1, "#5a6068")
  g.fillStyle = hub
  g.beginPath(); g.arc(0, 0, R * 0.24, 0, Math.PI * 2); g.fill()
  g.fillStyle = "#0b0b0c"
  g.beginPath(); g.arc(0, 0, R * 0.105, 0, Math.PI * 2); g.fill()
  return c
}

export function radial(inner: string, size = 128) {
  const { c, g } = canvas(size, size)
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, inner)
  grad.addColorStop(1, "rgba(0,0,0,0)")
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

/** Painted block wall, 2 m square: 0.4 x 0.2 m blocks in running bond. */
function makeBlocks() {
  const S = 512
  const { c, g } = canvas(S, S)
  const rnd = seeded(41)
  g.fillStyle = "#070a12"
  g.fillRect(0, 0, S, S)
  const bw = S / 5, bh = S / 10
  for (let r = 0; r < 10; r++)
    for (let k = -1; k < 6; k++) {
      const x = k * bw + (r % 2 ? bw / 2 : 0), y = r * bh
      const v = 0.86 + rnd() * 0.22
      g.fillStyle = `rgb(${Math.round(20 * v)},${Math.round(26 * v)},${Math.round(42 * v)})`
      g.fillRect(x + 2, y + 2, bw - 4, bh - 4)
    }
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = `rgba(200,210,255,${rnd() * 0.035})`
    g.fillRect(rnd() * S, rnd() * S, 1.5, 1.5)
  }
  return c
}

/** The neon sign: two lines of tube lettering with their glow, on a clear background. */
function makeNeon(display: string) {
  const W = 1024, H = 440
  const { c, g } = canvas(W, H)
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.lineJoin = "round"
  g.lineCap = "round"
  const line = (text: string, y: number, color: string) => {
    g.font = `800 132px ${display}`
    for (const [blur, width, stroke] of [
      [46, 12, color],
      [16, 8, color],
      [0, 3.5, "#ffffff"],
    ] as const) {
      g.shadowColor = color
      g.shadowBlur = blur
      g.lineWidth = width
      g.strokeStyle = stroke
      g.strokeText(text, W / 2, y)
    }
  }
  line("LIFT HEAVY", 130, "#5ef0f0")
  line("SHIP FAST", 310, "#b47cff")
  return c
}

export function buildGym(o: { track: Track; tex: Tex; envTex: THREE.Texture; display: string; mono: string }) {
  const { track, tex } = o
  const group = new THREE.Group()

  /* materials */
  const steel = track(new THREE.MeshStandardMaterial({ color: 0x1b1e27, metalness: 0.6, roughness: 0.42, envMap: o.envTex, envMapIntensity: 0.55 }))
  const chrome = track(new THREE.MeshStandardMaterial({ color: 0xdfe3e8, metalness: 1, roughness: 0.18, envMap: o.envTex, envMapIntensity: 1 }))
  const knurl = track(new THREE.MeshStandardMaterial({ color: 0x8e949c, metalness: 1, roughness: 0.55, envMap: o.envTex, envMapIntensity: 0.7 }))
  const rubber = track(new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 0.8 }))
  const bellColors = [0x6d4ae0, 0xe3b23c, 0x3c9a5f].map((c) => track(new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.1 })))
  const plateFace = track(new THREE.MeshStandardMaterial({ map: tex(makePlateFace("", 20, "#3F63D6", o.display, o.mono)), roughness: 0.7 }))

  /* static props are collected per material and merged */
  const batch = new Map<THREE.Material, THREE.BufferGeometry[]>()
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1)
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, s: THREE.Vector3 = one) => {
    m4.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), s)
    geo.applyMatrix4(m4)
    const list = batch.get(mat) ?? []
    list.push(geo)
    batch.set(mat, list)
  }
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d)
  const cyl = (r0: number, r1: number, h: number, n = 20) => new THREE.CylinderGeometry(r0, r1, h, n)

  /* wall */
  const blocks = tex(makeBlocks())
  blocks.wrapS = blocks.wrapT = THREE.RepeatWrapping
  blocks.repeat.set(9, 3.5)
  const wall = new THREE.Mesh(track(new THREE.PlaneGeometry(18, 7)), track(new THREE.MeshStandardMaterial({ map: blocks, roughness: 0.95 })))
  wall.position.set(0, 3.5, -3.1)
  wall.receiveShadow = true
  group.add(wall)

  /* neon sign on a dark acrylic backer */
  const neonMat = track(new THREE.MeshBasicMaterial({ map: tex(makeNeon(o.display)), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }))
  const sign = new THREE.Group()
  sign.position.set(-1.05, 2.05, -3.04)
  const neon = new THREE.Mesh(track(new THREE.PlaneGeometry(1.75, 0.75)), neonMat)
  const backer = new THREE.Mesh(track(new THREE.BoxGeometry(1.84, 0.82, 0.02)), track(new THREE.MeshStandardMaterial({ color: 0x05070d, roughness: 0.85 })))
  backer.position.z = -0.035
  const neonCyan = new THREE.PointLight(0x5ef0f0, 2.2, 4.2, 1.4)
  neonCyan.position.set(-0.4, 0.2, 0.44)
  const neonPurple = new THREE.PointLight(0xb47cff, 2.2, 4.2, 1.4)
  neonPurple.position.set(0.45, -0.2, 0.44)
  sign.add(neon, backer, neonCyan, neonPurple)
  group.add(sign)

  /* power rack, back right, with a bar racked on the J-hooks */
  const R = { x0: 1.3, x1: 2.4, z0: -2.55, z1: -1.4, h: 2.3, w: 0.075 }
  for (const x of [R.x0, R.x1])
    for (const z of [R.z0, R.z1]) add(box(R.w, R.h, R.w), steel, x, R.h / 2, z)
  for (const z of [R.z0, R.z1]) add(box(R.x1 - R.x0 + R.w, R.w, R.w), steel, (R.x0 + R.x1) / 2, R.h - R.w / 2, z)
  for (const x of [R.x0, R.x1]) {
    add(box(R.w, R.w, R.z1 - R.z0), steel, x, R.h - R.w / 2, (R.z0 + R.z1) / 2)
    add(box(0.1, 0.05, R.z1 - R.z0 + 0.36), steel, x, 0.025, (R.z0 + R.z1) / 2)
    // J-hook and a safety arm
    add(box(0.07, 0.11, 0.1), steel, x, 1.38, R.z1 + 0.07)
    add(box(0.05, 0.05, 1.0), steel, x + (x === R.x0 ? 0.06 : -0.06), 0.78, R.z1 + 0.25)
    // plate horn at the back, with two plates
    add(cyl(0.026, 0.026, 0.28), chrome, x, 0.46, R.z0 - 0.14, Math.PI / 2)
  }
  add(cyl(0.017, 0.017, R.x1 - R.x0 + 0.28), chrome, (R.x0 + R.x1) / 2, R.h - 0.13, R.z1 + 0.08, 0, 0, Math.PI / 2)
  const rackedY = 1.44, rackedZ = R.z1 + 0.08, rackedX = (R.x0 + R.x1) / 2
  add(cyl(0.0145, 0.0145, 1.34, 14), knurl, rackedX, rackedY, rackedZ, 0, 0, Math.PI / 2)
  for (const d of [-1, 1]) {
    add(cyl(0.025, 0.025, 0.42, 20), chrome, rackedX + d * 0.88, rackedY, rackedZ, 0, 0, Math.PI / 2)
    add(cyl(0.042, 0.042, 0.03, 24), chrome, rackedX + d * 0.67, rackedY, rackedZ, 0, 0, Math.PI / 2)
  }
  const plate = (x: number, y: number, z: number, axis: "x" | "z") => {
    const side = cyl(0.225, 0.225, 0.06, 48)
    if (axis === "x") add(side, rubber, x, y, z, 0, 0, Math.PI / 2)
    else add(side, rubber, x, y, z, Math.PI / 2)
    for (const f of [-1, 1]) {
      const face = new THREE.CircleGeometry(0.225, 48)
      if (axis === "x") add(face, plateFace, x + f * 0.031, y, z, 0, (f * Math.PI) / 2)
      else add(face, plateFace, x, y, z + f * 0.031, 0, f > 0 ? 0 : Math.PI)
    }
  }
  for (const d of [-1, 1]) plate(rackedX + d * 0.74, rackedY, rackedZ, "x")
  for (const x of [R.x0, R.x1]) {
    plate(x, 0.46, R.z0 - 0.06, "z")
    plate(x, 0.46, R.z0 - 0.13, "z")
  }

  /* dumbbell rack along the back wall, two sloped shelves */
  const D = { x0: -0.55, x1: 1.05 }
  for (const x of [D.x0, D.x1]) {
    add(box(0.06, 0.9, 0.06), steel, x, 0.45, -2.85)
    add(box(0.06, 0.55, 0.06), steel, x, 0.275, -2.35)
    add(box(0.06, 0.06, 0.62), steel, x, 0.03, -2.6)
  }
  const shelves: [number, number, number][] = [
    [0.5, -2.4, 0.2],
    [0.86, -2.72, 0.2],
  ]
  shelves.forEach(([y, z, tilt], row) => {
    add(box(D.x1 - D.x0 + 0.06, 0.035, 0.34), steel, (D.x0 + D.x1) / 2, y, z, tilt)
    for (let k = 0; k < 6; k++) {
      const r = 0.05 + (row * 6 + k) * 0.0035
      const x = D.x0 + 0.17 + k * 0.255
      const yy = y + 0.018 + r * 0.87
      add(cyl(0.016, 0.016, 0.14, 12), chrome, x, yy, z, Math.PI / 2 + tilt)
      for (const f of [-1, 1]) {
        add(cyl(r, r, 0.075, 6), rubber, x, yy - f * Math.sin(tilt) * 0.11, z + f * Math.cos(tilt) * 0.11, Math.PI / 2 + tilt, Math.PI / 6, 0)
      }
    }
  })

  /* kettlebells by the rack */
  const bells: [number, number, number, number][] = [
    [1.42, -0.95, 0.105, 0],
    [1.66, -1.05, 0.095, 1],
    [1.53, -0.72, 0.085, 2],
  ]
  for (const [x, z, r, ci] of bells) {
    const body = new THREE.SphereGeometry(r, 24, 16)
    add(body, bellColors[ci], x, r * 0.92, z, 0, 0, 0, new THREE.Vector3(1, 0.92, 1))
    add(new THREE.TorusGeometry(r * 0.62, r * 0.13, 10, 24, Math.PI), rubber, x, r * 1.78, z, 0, 0.4, 0)
    for (const f of [-1, 1]) add(cyl(r * 0.13, r * 0.13, r * 0.3, 10), rubber, x + f * Math.cos(0.4) * r * 0.62, r * 1.68, z - f * Math.sin(0.4) * r * 0.62)
  }

  for (const [mat, list] of batch) {
    const merged = track(mergeGeometries(list))
    list.forEach((g) => g.dispose())
    const mesh = new THREE.Mesh(merged, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }

  return { group, sign, neon: neonMat }
}
