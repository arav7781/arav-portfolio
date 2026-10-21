import * as THREE from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { clamp01, curve } from "./motion"

/*
 * The lifter: Arav's avatar as a cel-shaded anime character. His own face from the avatar
 * art, short side-parted black hair, a red Bulls road jersey (23), black Adidas track pants
 * with the three stripes, and Chicago-colour high tops. Every part is a mesh with a two-tone
 * cel shader (purple-tinted shadows, a cyan rim on one side and a purple rim on the other,
 * after the avatar's neon light) and an inked outline drawn as an inverted hull. The face
 * blinks, squints under load, and the mouth grits or smirks. The skeleton is posed from a
 * few numbers (pelvis, trunk, head, two hand targets); legs and arms are solved by two-bone IK.
 *
 * Frame: athlete-local, +z is the way he faces, +y up, x along the bar. Ankles stay put.
 */

export const DIM = {
  ankleY: 0.085,
  footX: 0.125,
  toeOut: 0.2,
  hipX: 0.092,
  thigh: 0.45,
  shin: 0.435,
  /** pelvis origin (between the hip joints) to the waist pivot */
  waist: 0.2,
  /** waist to the shoulder joints */
  chest: 0.27,
  shX: 0.195,
  shZ: -0.015,
  neckY: 0.312,
  upper: 0.31,
  fore: 0.285,
  /** wrist to the middle of the fist */
  grip: 0.075,
}
export const REACH = DIM.upper + DIM.fore + DIM.grip
export const LEG = DIM.thigh + DIM.shin

export type Face = "calm" | "focus" | "effort" | "proud"

export interface AthletePose {
  /** pelvis centre, between the hip joints */
  hip: THREE.Vector3
  /** forward lean of the pelvis from vertical (radians) */
  trunk: number
  twist: number
  lean: number
  /** chest against the pelvis; negative lifts the chest */
  arch: number
  /** 0..1 chest expansion */
  breathe: number
  /** pitch, yaw, roll of the head against the chest */
  head: THREE.Vector3
  /** fist centres, [left (+x), right (-x)] */
  hands: [THREE.Vector3, THREE.Vector3]
  /** where each elbow should point */
  poles: [THREE.Vector3, THREE.Vector3]
  face: Face
}

export function newPose(): AthletePose {
  return {
    hip: new THREE.Vector3(0, LEG + DIM.ankleY - 0.006, -0.01),
    trunk: 0,
    twist: 0,
    lean: 0,
    arch: 0,
    breathe: 0,
    head: new THREE.Vector3(),
    hands: [new THREE.Vector3(0.24, 0.79, 0.02), new THREE.Vector3(-0.24, 0.79, 0.02)],
    poles: [new THREE.Vector3(0.3, 0, -1), new THREE.Vector3(-0.3, 0, -1)],
    face: "calm",
  }
}

/** out = a + (b - a) k, channel by channel; out may be a or b. */
export function mixPose(a: AthletePose, b: AthletePose, k: number, out: AthletePose) {
  const l = (x: number, y: number) => x + (y - x) * k
  out.hip.lerpVectors(a.hip, b.hip, k)
  out.trunk = l(a.trunk, b.trunk)
  out.twist = l(a.twist, b.twist)
  out.lean = l(a.lean, b.lean)
  out.arch = l(a.arch, b.arch)
  out.breathe = l(a.breathe, b.breathe)
  out.head.lerpVectors(a.head, b.head, k)
  for (let i = 0; i < 2; i++) {
    out.hands[i].lerpVectors(a.hands[i], b.hands[i], k)
    out.poles[i].lerpVectors(a.poles[i], b.poles[i], k)
  }
  out.face = k < 0.5 ? a.face : b.face
  return out
}

/* ── palette ─────────────────────────────────────────────────────────────── */

const C = {
  skin: "#eab69b",
  jersey: "#ce1141",
  black: "#121318",
  white: "#f5f3ee",
  pants: "#1a1b22",
  hair: "#3a302b",
  ink: "#0b0d19",
  shoeRed: "#c8102e",
  eye: "#5ef0f0",
}

/* ── shaders ─────────────────────────────────────────────────────────────── */

const CEL_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`

const CEL_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uShade;
uniform sampler2D uMap;
uniform float uUseMap;
uniform vec3 uLight;
uniform vec3 uRimL;
uniform vec3 uRimR;
uniform float uRim;
uniform float uSoft;
uniform float uSpec;
uniform float uFlat;
varying vec3 vN;
varying vec3 vV;
varying vec2 vUv;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vV);
  vec3 base = uColor;
  if (uUseMap > 0.5) base *= texture2D(uMap, vUv).rgb;
  float ndl = dot(n, uLight);
  float lit = smoothstep(-0.03 - uSoft, 0.03 + uSoft, ndl);
  vec3 shade = mix(uShade, vec3(1.0), uFlat);
  vec3 col = base * mix(shade, vec3(1.0), lit);
  float fres = 1.0 - max(dot(n, v), 0.0);
  float rim = smoothstep(0.56, 0.64, fres);
  col += mix(uRimL, uRimR, step(0.0, n.x)) * rim * uRim;
  if (uSpec > 0.0) {
    vec3 h = normalize(uLight + v);
    col += vec3(0.5, 0.62, 1.0) * smoothstep(0.94, 0.965, dot(n, h)) * uSpec;
  }
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`

const INK_VERT = /* glsl */ `
uniform float uThick;
uniform float uMul;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  mv.xyz += n * uThick * uMul;
  gl_Position = projectionMatrix * mv;
}`

const INK_FRAG = /* glsl */ `
uniform vec3 uInk;
void main() {
  gl_FragColor = vec4(uInk, 1.0);
  #include <colorspace_fragment>
}`

/* ── geometry helpers ────────────────────────────────────────────────────── */

/**
 * A limb or body shell turned around +y: keys are [t, radius] with t = 0 at the joint and
 * t = 1 at the far end (y = -len). Both ends are closed with an elliptic dome. Profile
 * points run bottom to top so the lathe faces outward; u = 0 is the back, 0.5 the front.
 */
function shell(keys: [number, number][], len: number, o: { capTop?: number; capBot?: number; sx?: number; sz?: number; seg?: number; n?: number } = {}) {
  const f = curve(keys)
  const { capTop = 0.02, capBot = 0.02, sx = 1, sz = 1, seg = 26, n = 18 } = o
  const pts: THREE.Vector2[] = []
  const rB = f(1), rT = f(0)
  for (let i = 0; i <= 4; i++) {
    const a = (i / 4) * (Math.PI / 2)
    pts.push(new THREE.Vector2(Math.max(1e-4, rB * Math.sin(a)), -len - capBot * Math.cos(a)))
  }
  for (let j = 1; j < n; j++) {
    const t = 1 - j / n
    pts.push(new THREE.Vector2(f(t), -t * len))
  }
  for (let i = 0; i <= 4; i++) {
    const a = (i / 4) * (Math.PI / 2)
    pts.push(new THREE.Vector2(Math.max(1e-4, rT * Math.cos(a)), capTop * Math.sin(a)))
  }
  const g = new THREE.LatheGeometry(pts, seg, Math.PI)
  g.scale(sx, 1, sz)
  return g
}

/** The torso shell, sampled evenly in height so its texture's v is linear in y. */
const TORSO = { y0: -0.235, y1: 0.338 }
function torsoGeo() {
  const f = curve([
    [-0.235, 0.174],
    [-0.15, 0.162],
    [-0.05, 0.151],
    [0.05, 0.155],
    [0.14, 0.174],
    [0.21, 0.186],
    [0.25, 0.188],
    [0.283, 0.176],
    [0.308, 0.138],
    [0.326, 0.088],
    [0.335, 0.045],
    [0.338, 0.001],
  ])
  const pts: THREE.Vector2[] = []
  const N = 40
  for (let j = 0; j < N; j++) {
    const y = TORSO.y0 + ((TORSO.y1 - TORSO.y0) * j) / (N - 1)
    pts.push(new THREE.Vector2(j === 0 ? 0.001 : f(y), y))
  }
  const g = new THREE.LatheGeometry(pts, 40, Math.PI)
  g.scale(1, 1, 0.68)
  return g
}

/**
 * The face from the avatar artwork (public/avatar.png), measured in its pixels. The art is a
 * three-quarter view turned to his right, so it is projected onto the head along that same
 * direction (`yaw`), scaled and placed so its eyes, mouth and chin land on the head's.
 */
const ART = {
  crop: { x: 262, y: 118, w: 180, h: 180 },
  up: 3,
  /** where the head centre projects, and art pixels per metre */
  cx: 344,
  cy: 166,
  k: 760,
  yaw: 0.45,
  /** the face itself: under the fringe, in front of the ear, above the jaw, inside the cyan edge */
  mask: [
    [281, 163], [302, 161], [318, 155], [335, 148], [355, 143], [375, 148], [387, 162], [390, 195],
    [382, 224], [370, 242], [350, 254], [334, 257], [324, 249], [316, 233], [311, 214], [303, 199],
    [288, 192], [283, 181],
  ] as [number, number][],
  eyes: [
    { x: 340, y: 176, rx: 17, ry: 9, tilt: -0.22, lid: [[323, 179], [339, 184], [357, 171]] },
    { x: 295, y: 183, rx: 12.5, ry: 7, tilt: 0.06, lid: [[283, 182], [295, 188], [307, 186]] },
  ],
  mouth: { x: 327, y: 231 },
  /** just above the upper lashes, right to left: the art's hair and brows above it are
   * painted out, and clean brows are drawn back in */
  brow: [
    [442, 150], [400, 155], [375, 160], [362, 164], [356, 165.5], [350, 165.5], [340, 166.5],
    [330, 168], [322, 172], [316, 174], [305, 174.5], [298, 175], [283, 175], [262, 176],
  ] as [number, number][],
  /** the brows: inner end, arch, outer end and thickness at each end */
  brows: [
    { a: [321, 166], c: [338, 157.5], b: [361, 160], wa: 6.8, wb: 2.4 },
    { a: [305, 172.5], c: [294, 166.5], b: [282, 168.5], wa: 5.8, wb: 2.2 },
  ],
  /** the temple beside his left eye, where the art's locks hang down */
  temple: [
    [361, 152], [400, 148], [400, 210], [380, 210], [368, 190], [361, 174],
  ] as [number, number][],
}

/** how far round the artwork sees his face */
export const FACE_YAW = ART.yaw

/** The head's surface for a unit direction: round cranium, narrow jaw, small pointed chin. */
function skull(v: THREE.Vector3) {
  let { x, y, z } = v
  if (y < 0) {
    const t = -y
    x *= 1 - 0.44 * Math.pow(t, 1.4)
    z *= z < 0 ? 1 - 0.42 * t : 1 - 0.1 * t
    y *= 1 + 0.22 * Math.max(0, z)
  }
  if (z > 0) z *= 0.93
  return v.set(x * 0.083, y * 0.108, z * 0.098)
}

const FACE = { w: 0.2, y: -0.02 }
function headGeo(art: boolean) {
  const ca = Math.cos(ART.yaw), sa = Math.sin(ART.yaw)
  const g = new THREE.SphereGeometry(1, 48, 40)
  const p = g.attributes.position, uv = g.attributes.uv
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    const { x, y, z } = skull(v.fromBufferAttribute(p, i))
    p.setXYZ(i, x, y, z)
    if (art) {
      // projected along the artwork's view; the far side reads a plain skin corner of the crop
      const ax = ART.cx + ART.k * (x * ca - z * sa), ay = ART.cy - ART.k * y
      if (x * sa + z * ca > -0.01) uv.setXY(i, (ax - ART.crop.x) / ART.crop.w, 1 - (ay - ART.crop.y) / ART.crop.h)
      else uv.setXY(i, 0.01, 0.99)
    } else {
      // the painted face, projected straight on from the front
      if (z > -0.02) uv.setXY(i, 0.5 + x / FACE.w, 0.5 + (y - FACE.y) / FACE.w)
      else uv.setXY(i, 0.03, 0.97)
    }
  }
  g.computeVertexNormals()
  return g
}

/**
 * Where the hair starts, as an elevation (radians) for each azimuth round the head (0 is the
 * front, + his left): low at the nape, up over the ears with short sideburns in front of
 * them, high at the part on his right and lowest where the fringe falls on his left.
 */
const hairline = curve([
  [-Math.PI, -0.52], [-2.3, -0.46], [-1.95, -0.2], [-1.82, 0.18], [-1.46, 0.18], [-1.38, -0.16],
  [-1.26, -0.16], [-1.12, 0.22], [-0.85, 0.36], [-0.55, 0.42], [-0.2, 0.33], [0.18, 0.2],
  [0.45, 0.22], [0.7, 0.27], [0.9, 0.3], [1.12, 0.22], [1.26, -0.16], [1.38, -0.16], [1.46, 0.18],
  [1.82, 0.18], [1.95, -0.2], [2.3, -0.46], [Math.PI, -0.52],
])
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/**
 * A short, side-parted haircut, the everyday Indian cut: tapered short at the back and
 * sides with the ears clear, fuller on top, combed from a part on his right across to his
 * left so the fringe lies over the forehead. It is a shell over the skull whose thickness
 * and hairline are functions of direction; strands are shallow grooves that spiral out of
 * the crown, and wherever there is no hair the shell sinks under the scalp.
 */
function hairGeo() {
  const sphere = new THREE.SphereGeometry(1, 120, 80)
  sphere.deleteAttribute("normal")
  sphere.deleteAttribute("uv")
  // one vertex per point, so the seam and the poles shade and outline without a crease
  const g = mergeVertices(sphere)
  sphere.dispose()
  const p = g.attributes.position
  const n = new THREE.Vector3(), s = new THREE.Vector3()
  const whorl = new THREE.Vector3(-0.18, 0.84, -0.5).normalize()
  const e1 = new THREE.Vector3(1, 0, 0).addScaledVector(whorl, -whorl.x).normalize()
  const e2 = new THREE.Vector3().crossVectors(whorl, e1)
  for (let i = 0; i < p.count; i++) {
    n.fromBufferAttribute(p, i)
    const az = Math.atan2(n.x, n.z), el = Math.asin(THREE.MathUtils.clamp(n.y, -1, 1))
    // the edge is not a straight cut: strand tips point down along the fringe, the
    // sideburns and the nape
    const fringe = 1 - smooth(0.35, 1.05, Math.abs(az))
    const nape = smooth(2.0, 2.6, Math.abs(az))
    const tips = 0.06 * Math.abs(Math.sin(9 * az + 0.6)) ** 4 * fringe + 0.035 * Math.abs(Math.sin(15 * az)) ** 4 * nape
    const on = smooth(-0.025, 0.025, el - hairline(az) + tips)
    const top = smooth(0.2, 0.95, n.y)
    const front = smooth(0.15, 0.8, n.z) * smooth(0.1, 0.55, n.y)
    // volume on top, a lift at the front, more on the side it is combed to
    let h = 0.004 + 0.013 * top + 0.007 * front + 0.005 * front * smooth(-0.4, 0.6, n.x)
    // clipped short at the nape and over the ears
    h *= 1 - 0.5 * smooth(0.0, 0.45, -n.y)
    h *= 1 - 0.35 * smooth(0.6, 0.95, Math.abs(n.x)) * (1 - top)
    // the part, a fine line on his right from the hairline back toward the crown
    h -= 0.005 * Math.exp(-(((n.x + 0.36) / 0.035) ** 2)) * smooth(0.45, 0.6, n.y) * smooth(-0.35, 0.1, n.z)
    // clumps and strands: grooves spiralling out of the crown, deeper where it is longer
    const d = 1 - n.dot(whorl)
    const phi = Math.atan2(n.dot(e2), n.dot(e1))
    const fade = smooth(0.04, 0.3, d)
    h += 0.0024 * (0.3 + top) * Math.sin(7 * phi + 2.2 * d + 1.3) * fade
    h += (0.0007 + 0.0018 * top) * Math.sin(23 * phi + 6 * d) * fade
    const r = THREE.MathUtils.lerp(-0.009, Math.max(0.0015, h), on)
    skull(s.copy(n))
    p.setXYZ(i, s.x + n.x * r, s.y + n.y * r, s.z + n.z * r)
  }
  g.computeVertexNormals()
  g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(p.count * 2), 2))
  return g
}

/* ── textures ────────────────────────────────────────────────────────────── */

function canvas(w: number, h: number) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  return { c, g: c.getContext("2d")! }
}

/** The road jersey, unwrapped around the torso: u = 0 back, 0.5 front; v = 0 hem, 1 neck. */
function jerseyCanvas(display: string) {
  const W = 1024, H = 512
  const { c, g } = canvas(W, H)
  const py = (y: number) => (1 - (y - TORSO.y0) / (TORSO.y1 - TORSO.y0)) * H
  const px = (u: number) => u * W
  g.fillStyle = C.jersey
  g.fillRect(0, 0, W, H)
  // a faint mesh texture
  g.fillStyle = "rgba(0,0,0,.06)"
  for (let y = 0; y < H; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < W; x += 6) g.fillRect(x, y, 2, 2)
  // side panels: a black stripe edged in white down each side
  for (const u of [0.25, 0.75]) {
    g.fillStyle = C.white
    g.fillRect(px(u) - 9, py(0.17), 18, H)
    g.fillStyle = C.black
    g.fillRect(px(u) - 6, py(0.17), 12, H)
  }
  // where the body shows: the scoop neck front and back, and deep armholes
  const edge = (u: number) => {
    const df = Math.abs(u - 0.5), db = Math.min(u, 1 - u), da = Math.min(Math.abs(u - 0.25), Math.abs(u - 0.75))
    let b = 1
    if (df < 0.085) b = Math.min(b, 0.252 + 0.09 * (df / 0.085) ** 2)
    if (db < 0.075) b = Math.min(b, 0.3 + 0.05 * (db / 0.075) ** 2)
    if (da < 0.11) b = Math.min(b, 0.165 + 0.18 * (da / 0.11) ** 2)
    return b
  }
  for (let x = 0; x < W; x++) {
    const b = edge((x + 0.5) / W)
    if (b >= TORSO.y1) continue
    const y = py(b)
    g.fillStyle = C.skin
    g.fillRect(x, 0, 1, y)
    g.fillStyle = C.black
    g.fillRect(x, y, 1, 10)
    g.fillStyle = C.white
    g.fillRect(x, y + 10, 1, 4)
    g.fillStyle = C.black
    g.fillRect(x, y + 14, 1, 3)
  }
  const word = (text: string, u: number, y: number, h: number, w: number, line: number) => {
    g.save()
    g.font = `900 ${h}px ${display}`
    try {
      ;(g as unknown as { fontStretch: string }).fontStretch = "condensed"
    } catch {}
    g.textAlign = "center"
    g.textBaseline = "middle"
    const mw = g.measureText(text).width
    g.translate(px(u), py(y))
    g.scale(w / mw, 1)
    g.lineJoin = "round"
    g.lineWidth = line
    g.strokeStyle = C.black
    g.strokeText(text, 0, 0)
    g.fillStyle = C.white
    g.fillText(text, 0, 0)
    g.restore()
  }
  // front: the wordmark over the number
  word("BULLS", 0.5, 0.152, 50, 170, 9)
  word("23", 0.5, 0.04, 108, 128, 11)
  // back, drawn on both sides of the seam
  for (const u of [0, 1]) {
    word("ARAV", u, 0.232, 38, 120, 7)
    word("23", u, 0.105, 128, 150, 12)
  }
  // the swoosh on the wearer's right strap (screen left)
  g.save()
  g.translate(px(0.392), py(0.232))
  g.scale(0.9, 0.9)
  g.fillStyle = C.white
  g.beginPath()
  g.moveTo(-14, 2)
  g.quadraticCurveTo(-16, 12, -4, 10)
  g.lineTo(18, -6)
  g.quadraticCurveTo(-6, 5, -8, 3)
  g.quadraticCurveTo(-10, 0, -14, 2)
  g.fill()
  g.restore()
  // the league logo at the back of the neck
  g.fillStyle = "#1d428a"
  g.fillRect(px(0.0) - 6, py(0.292), 12, 18)
  g.fillRect(px(1.0) - 6, py(0.292), 12, 18)
  g.fillStyle = "#c8102e"
  g.fillRect(px(0.0), py(0.292), 6, 18)
  g.fillRect(px(1.0) - 6 + 6, py(0.292), 6, 18)
  return c
}

/** Track pants: black, three white stripes down the outside (u = 0.25 is -x, 0.75 is +x). */
function pantsCanvas(outer: number[], trefoil: number | null) {
  const W = 512, H = 256
  const { c, g } = canvas(W, H)
  g.fillStyle = C.pants
  g.fillRect(0, 0, W, H)
  g.fillStyle = "rgba(255,255,255,.035)"
  for (let i = 0; i < 40; i++) g.fillRect(Math.random() * W, 0, 1, H)
  for (const u of outer) {
    g.fillStyle = C.white
    for (const k of [-1, 0, 1]) g.fillRect(u * W + k * 13 - 4.5, 0, 9, H)
  }
  if (trefoil !== null) {
    // the trefoil, small, high on the thigh
    const x = trefoil * W, y = H * 0.1
    g.fillStyle = C.white
    for (const [dx, rot, ry] of [[-7, -0.5, 9], [0, 0, 11], [7, 0.5, 9]] as const) {
      g.save()
      g.translate(x + dx, y)
      g.rotate(rot)
      g.beginPath()
      g.ellipse(0, -ry * 0.4, 4, ry, 0, 0, Math.PI * 2)
      g.fill()
      g.restore()
    }
    g.fillStyle = C.pants
    g.fillRect(x - 14, y - 1, 28, 2)
    g.fillRect(x - 14, y + 3, 28, 1.5)
  }
  return c
}

/** The painted face; feature coordinates are metres in head space. */
function faceCanvas(face: Face, blink: boolean) {
  const S = 512
  const { c, g } = canvas(S, S)
  const X = (x: number) => (0.5 + x / FACE.w) * S
  const Y = (y: number) => (0.5 - (y - FACE.y) / FACE.w) * S
  g.fillStyle = C.skin
  g.fillRect(0, 0, S, S)
  g.lineCap = "round"
  g.lineJoin = "round"

  const cfg = {
    calm: { open: 1, bi: 0.0095, bo: 0.0165 },
    focus: { open: 0.8, bi: 0.004, bo: 0.0165 },
    effort: { open: 0.34, bi: -0.002, bo: 0.0145 },
    proud: { open: 0.74, bi: 0.011, bo: 0.0175 },
  }[face]
  const open = blink ? 0 : cfg.open

  if (face === "proud") {
    g.fillStyle = "rgba(255,120,140,.22)"
    for (const s of [-1, 1]) {
      g.beginPath()
      g.ellipse(X(s * 0.046), Y(-0.04), 16, 6, 0, 0, Math.PI * 2)
      g.fill()
    }
  }

  for (const s of [-1, 1]) {
    const I = [s * 0.0165, -0.0172], O = [s * 0.0575, -0.0098]
    const U = [s * 0.031, -0.024 + 0.0235 * open]
    const Lc = [s * 0.04, -0.023 - 0.0085 * Math.min(1, open * 1.3)]
    if (open > 0.05) {
      const lids = () => {
        g.beginPath()
        g.moveTo(X(I[0]), Y(I[1]))
        g.quadraticCurveTo(X(U[0]), Y(U[1]), X(O[0]), Y(O[1]))
        g.quadraticCurveTo(X(Lc[0]), Y(Lc[1]), X(I[0]), Y(I[1]))
      }
      lids()
      g.fillStyle = "#fbfbff"
      g.fill()
      g.save()
      lids()
      g.clip()
      // iris: dark navy at the top to the avatar's cyan at the bottom
      const ix = X(s * 0.0345), iy = Y(-0.0178)
      const grad = g.createLinearGradient(0, iy - 34, 0, iy + 30)
      grad.addColorStop(0, "#0f2440")
      grad.addColorStop(0.45, "#1f6f9a")
      grad.addColorStop(1, "#7ff6ff")
      g.fillStyle = grad
      g.beginPath()
      g.ellipse(ix, iy, 27, 33, 0, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = "#0b1a2c"
      g.lineWidth = 3
      g.stroke()
      g.fillStyle = "#08121f"
      g.beginPath()
      g.ellipse(ix, iy + 2, 11, 16, 0, 0, Math.PI * 2)
      g.fill()
      // the upper lid's shadow, then two catchlights
      g.fillStyle = "rgba(16,22,48,.38)"
      g.fillRect(ix - 60, Y(U[1]) - 4, 120, 16)
      g.fillStyle = "#ffffff"
      g.beginPath()
      g.ellipse(ix - s * 8, iy - 11, 8, 9, 0, 0, Math.PI * 2)
      g.fill()
      g.beginPath()
      g.ellipse(ix + s * 9, iy + 13, 4, 4, 0, 0, Math.PI * 2)
      g.fill()
      g.restore()
      // lash line, heavier toward the outer corner, with a flick
      g.strokeStyle = "#11131f"
      g.lineWidth = 7
      g.beginPath()
      g.moveTo(X(I[0]), Y(I[1]))
      g.quadraticCurveTo(X(U[0]), Y(U[1]), X(O[0]), Y(O[1]))
      g.stroke()
      g.fillStyle = "#11131f"
      g.beginPath()
      g.moveTo(X(s * 0.04), Y(U[1] * 0.5 + O[1] * 0.5 + 0.002))
      g.quadraticCurveTo(X(s * 0.056), Y(O[1] + 0.003), X(s * 0.064), Y(O[1] - 0.004))
      g.lineTo(X(s * 0.055), Y(O[1] - 0.002))
      g.closePath()
      g.fill()
      g.strokeStyle = "rgba(60,40,60,.8)"
      g.lineWidth = 2.5
      g.beginPath()
      g.moveTo(X(s * 0.03), Y(-0.0275))
      g.quadraticCurveTo(X(Lc[0] + s * 0.006), Y(Lc[1] + 0.0035), X(O[0] - s * 0.003), Y(O[1] - 0.004))
      g.stroke()
      // lid crease
      g.strokeStyle = "rgba(150,88,88,.55)"
      g.lineWidth = 2
      g.beginPath()
      g.moveTo(X(s * 0.023), Y(U[1] + 0.006))
      g.quadraticCurveTo(X(s * 0.036), Y(U[1] + 0.0105), X(s * 0.052), Y(O[1] + 0.006))
      g.stroke()
    } else {
      // closed: a soft downward arc
      g.strokeStyle = "#11131f"
      g.lineWidth = 7
      g.beginPath()
      g.moveTo(X(I[0]), Y(I[1] - 0.002))
      g.quadraticCurveTo(X(s * 0.036), Y(-0.025), X(O[0]), Y(O[1] - 0.003))
      g.stroke()
    }
    // brows: thick at the inner end, angled down toward the nose
    const bi = cfg.bi, bo = cfg.bo
    g.fillStyle = "#151827"
    g.beginPath()
    g.moveTo(X(s * 0.012), Y(bi + 0.003))
    g.quadraticCurveTo(X(s * 0.036), Y((bi + bo) / 2 + 0.0055), X(s * 0.061), Y(bo + 0.0006))
    g.lineTo(X(s * 0.06), Y(bo - 0.0016))
    g.quadraticCurveTo(X(s * 0.036), Y((bi + bo) / 2 - 0.0005), X(s * 0.013), Y(bi - 0.003))
    g.closePath()
    g.fill()
  }
  if (face === "effort") {
    g.strokeStyle = "rgba(120,60,70,.7)"
    g.lineWidth = 2.5
    for (const s of [-1, 1]) {
      g.beginPath()
      g.moveTo(X(s * 0.007), Y(0.012))
      g.lineTo(X(s * 0.004), Y(0.002))
      g.stroke()
    }
  }

  // nose: a single shadow stroke
  g.strokeStyle = "rgba(196,118,108,.95)"
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(X(0.004), Y(-0.04))
  g.lineTo(X(0.006), Y(-0.05))
  g.lineTo(X(0.001), Y(-0.053))
  g.stroke()

  // mouth
  if (face === "effort") {
    const x0 = X(-0.017), x1 = X(0.017), y0 = Y(-0.069), y1 = Y(-0.081)
    g.fillStyle = "#fbf6f0"
    g.strokeStyle = "#6a2a30"
    g.lineWidth = 3
    g.beginPath()
    g.roundRect(x0, y0, x1 - x0, y1 - y0, 8)
    g.fill()
    g.stroke()
    g.strokeStyle = "#b5a39e"
    g.lineWidth = 1.6
    g.beginPath()
    g.moveTo(x0 + 4, (y0 + y1) / 2)
    g.lineTo(x1 - 4, (y0 + y1) / 2)
    for (const k of [-0.009, 0, 0.009]) {
      g.moveTo(X(k), y0 + 3)
      g.lineTo(X(k), y1 - 3)
    }
    g.stroke()
  } else if (face === "proud") {
    const mouth = () => {
      g.beginPath()
      g.moveTo(X(-0.016), Y(-0.0705))
      g.quadraticCurveTo(X(0), Y(-0.0728), X(0.0175), Y(-0.0688))
      g.quadraticCurveTo(X(0.004), Y(-0.0875), X(-0.016), Y(-0.0705))
    }
    mouth()
    g.fillStyle = "#6e2230"
    g.fill()
    g.save()
    mouth()
    g.clip()
    g.fillStyle = "#fbf6f0"
    g.fillRect(X(-0.02), Y(-0.07), X(0.02) - X(-0.02), 11)
    g.restore()
    mouth()
    g.strokeStyle = "#561a24"
    g.lineWidth = 2.5
    g.stroke()
  } else {
    g.strokeStyle = face === "focus" ? "#8a4048" : "#a4555a"
    g.lineWidth = face === "focus" ? 3.6 : 3
    g.beginPath()
    g.moveTo(X(-0.0115), Y(-0.0745))
    g.quadraticCurveTo(X(0), Y(face === "focus" ? -0.0748 : -0.0762), X(0.0115), Y(-0.0742))
    g.stroke()
    g.strokeStyle = "rgba(200,120,120,.45)"
    g.lineWidth = 2
    g.beginPath()
    g.moveTo(X(-0.005), Y(-0.0815))
    g.lineTo(X(0.005), Y(-0.0815))
    g.stroke()
  }
  return c
}

/**
 * The avatar's face, cropped from the artwork and relit: its purple neon cast is corrected to
 * the body's skin, and it fades into plain skin at the edges. Variants paint over the real
 * features: closed eyes for a blink, a squint and gritted teeth under load, a smirk after.
 */
function avatarFaces(img: HTMLImageElement) {
  const { crop, up } = ART
  const W = crop.w * up, H = crop.h * up
  const raw = canvas(W, H)
  raw.g.imageSmoothingQuality = "high"
  raw.g.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, W, H)
  const avg = (x0: number, y0: number, x1: number, y1: number) => {
    const d = raw.g.getImageData((x0 - crop.x) * up, (y0 - crop.y) * up, (x1 - x0) * up, (y1 - y0) * up).data
    const m = [0, 0, 0]
    for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) m[c] += d[i + c]
    return m.map((v) => v / (d.length / 4))
  }
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const skinRGB = hex(C.skin)
  const cheek = avg(345, 195, 368, 218)
  const gain = cheek.map((v, i) => Math.max(0.7, Math.min(1.7, skinRGB[i] / v)))
  const rgb = (c: number[]) => `rgb(${c.map((v) => Math.round(v)).join(",")})`

  /** a brow as a tapered stroke; `knit` pulls the inner end down (+) or lifts it (-) */
  const brow = (g: CanvasRenderingContext2D, knit: number) => {
    g.fillStyle = "#1c161d"
    for (const { a, c, b, wa, wb } of ART.brows) {
      const ay = a[1] + knit, cy = c[1] + knit * 0.4
      const pt = (t: number) => {
        const u = 1 - t
        return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * ay + 2 * u * t * cy + t * t * b[1]]
      }
      const side: number[][] = [], other: number[][] = []
      for (let i = 0; i <= 16; i++) {
        const t = i / 16
        const [x0, y0] = pt(Math.max(0, t - 0.01)), [x1, y1] = pt(Math.min(1, t + 0.01))
        const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1
        // thickest just in from the inner end, tapering to a point outside
        const w = (wa + (wb - wa) * t) * (0.75 + 0.25 * Math.sin(Math.min(1, t * 4) * Math.PI * 0.5)) * 0.5
        const [x, y] = pt(t)
        side.push([x - (dy / len) * w, y + (dx / len) * w])
        other.push([x + (dy / len) * w, y - (dx / len) * w])
      }
      g.beginPath()
      ;[...side, ...other.reverse()].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
      g.closePath()
      g.fill()
    }
  }

  const variant = (o: { closed?: boolean; squint?: boolean; mouth?: "grit" | "smirk"; knit?: number }) => {
    const v = canvas(W, H)
    const g = v.g
    g.drawImage(raw.c, 0, 0)
    // draw in artwork pixels
    g.setTransform(up, 0, 0, up, -crop.x * up, -crop.y * up)
    g.lineCap = "round"
    g.lineJoin = "round"
    // a clean forehead down to the brows; the haircut draws the hairline
    g.filter = "blur(2px)"
    g.fillStyle = rgb(cheek)
    g.beginPath()
    g.moveTo(crop.x - 4, crop.y - 4)
    g.lineTo(crop.x + crop.w + 4, crop.y - 4)
    for (const [x, y] of ART.brow) g.lineTo(x, y)
    g.closePath()
    g.fill()
    g.beginPath()
    ART.temple.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.closePath()
    g.fill()
    g.filter = "none"
    brow(g, o.knit ?? 0)
    for (const e of ART.eyes) {
      if (!o.closed && !o.squint) continue
      const lidSkin = rgb(avg(e.x - 6, e.y + e.ry + 3, e.x + 6, e.y + e.ry + 8))
      g.save()
      g.translate(e.x, e.y)
      g.rotate(e.tilt)
      if (o.squint && !o.closed) {
        g.beginPath()
        g.rect(-e.rx - 4, -e.ry - 6, e.rx * 2 + 8, e.ry + 6.5)
        g.clip()
      }
      g.filter = "blur(0.8px)"
      g.fillStyle = lidSkin
      g.beginPath()
      g.ellipse(0, 0, e.rx + 2, e.ry + 3, 0, 0, Math.PI * 2)
      g.fill()
      g.filter = "none"
      g.restore()
      g.strokeStyle = "#191322"
      if (o.closed) {
        const [a, b, c] = e.lid
        g.lineWidth = 2.4
        g.beginPath()
        g.moveTo(a[0], a[1])
        g.quadraticCurveTo(b[0], b[1], c[0], c[1])
        g.stroke()
      } else {
        // squeezed: a heavy lid line straight across the eye
        g.save()
        g.translate(e.x, e.y)
        g.rotate(e.tilt)
        g.lineWidth = 2.8
        g.beginPath()
        g.moveTo(-e.rx - 1, 1.5)
        g.quadraticCurveTo(0, -1, e.rx + 1, -0.5)
        g.stroke()
        g.restore()
      }
    }
    if (o.mouth) {
      const { x, y } = ART.mouth
      g.save()
      g.translate(x, y)
      g.rotate(-0.08)
      g.filter = "blur(0.8px)"
      g.fillStyle = rgb(avg(x + 6, y - 9, x + 14, y - 5))
      g.beginPath()
      g.ellipse(0, 1, 16, 6.5, 0, 0, Math.PI * 2)
      g.fill()
      g.filter = "none"
      if (o.mouth === "grit") {
        g.fillStyle = "#f4ece5"
        g.strokeStyle = "#2b1620"
        g.lineWidth = 1.1
        g.beginPath()
        g.roundRect(-13, -3.5, 26, 8, 3)
        g.fill()
        g.stroke()
        g.strokeStyle = "rgba(60,30,40,.55)"
        g.lineWidth = 0.7
        g.beginPath()
        g.moveTo(-12, 0.5)
        g.lineTo(12, 0.5)
        for (const k of [-6.5, 0, 6.5]) {
          g.moveTo(k, -3)
          g.lineTo(k, 4)
        }
        g.stroke()
      } else {
        g.strokeStyle = "#3b1c27"
        g.lineWidth = 1.7
        g.beginPath()
        g.moveTo(-13, -1)
        g.quadraticCurveTo(-1, 5, 12, -5)
        g.stroke()
        g.lineWidth = 1.1
        g.beginPath()
        g.moveTo(12, -5)
        g.lineTo(14.5, -7)
        g.stroke()
      }
      g.restore()
    }
    g.setTransform(1, 0, 0, 1, 0, 0)
    // relight: the artwork's purple cheek becomes the body's skin
    const img2 = g.getImageData(0, 0, W, H)
    const d = img2.data
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, d[i] * gain[0])
      d[i + 1] = Math.min(255, d[i + 1] * gain[1])
      d[i + 2] = Math.min(255, d[i + 2] * gain[2])
    }
    g.putImageData(img2, 0, 0)
    // keep only the face, feathered into plain skin
    const out = canvas(W, H)
    out.g.fillStyle = C.skin
    out.g.fillRect(0, 0, W, H)
    const m = canvas(W, H)
    m.g.filter = `blur(${2.2 * up}px)`
    m.g.fillStyle = "#fff"
    m.g.beginPath()
    ART.mask.forEach(([x, y], i) => (i ? m.g.lineTo : m.g.moveTo).call(m.g, (x - crop.x) * up, (y - crop.y) * up))
    m.g.closePath()
    m.g.fill()
    m.g.filter = "none"
    m.g.globalCompositeOperation = "source-in"
    m.g.drawImage(v.c, 0, 0)
    out.g.drawImage(m.c, 0, 0)
    return out.c
  }

  const base = variant({}), blink = variant({ closed: true })
  const effort = variant({ squint: true, mouth: "grit", knit: 2.2 })
  const smirk = variant({ mouth: "smirk", knit: -1.2 }), smirkBlink = variant({ closed: true, mouth: "smirk", knit: -1.2 })
  return new Map<string, HTMLCanvasElement>([
    ["calmfalse", base],
    ["calmtrue", blink],
    ["focusfalse", base],
    ["focustrue", blink],
    ["effortfalse", effort],
    ["efforttrue", effort],
    ["proudfalse", smirk],
    ["proudtrue", smirkBlink],
  ])
}

/* ── the athlete ─────────────────────────────────────────────────────────── */

export interface Athlete {
  group: THREE.Group
  pose: AthletePose
  /** solve IK and place every part from `pose` */
  apply: () => void
  /** per frame: light direction and blinks */
  update: (dt: number, camera: THREE.Camera, keyDir: THREE.Vector3) => void
  /** outline thickness in world units follows the rig's scale */
  setScale: (s: number) => void
  dispose: () => void
}

export function createAthlete(o: { display: string; aniso?: number; avatar?: HTMLImageElement | null }): Athlete {
  const disposables: { dispose: () => void }[] = []
  const track = <D extends { dispose: () => void }>(d: D) => (disposables.push(d), d)
  const tex = (c: HTMLCanvasElement) => {
    const t = track(new THREE.CanvasTexture(c))
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = o.aniso ?? 4
    return t
  }

  const shared = {
    uLight: { value: new THREE.Vector3(0, 0, 1) },
    uRimL: { value: new THREE.Color("#5ef0f0") },
    uRimR: { value: new THREE.Color("#b47cff") },
    uThick: { value: 0.006 },
  }
  const cel = (color: string, opt: { map?: THREE.Texture; rim?: number; spec?: number; flat?: number; soft?: number; shade?: [number, number, number] } = {}) =>
    track(
      new THREE.ShaderMaterial({
        uniforms: {
          uLight: shared.uLight,
          uRimL: shared.uRimL,
          uRimR: shared.uRimR,
          uColor: { value: new THREE.Color(color) },
          uShade: { value: new THREE.Vector3(...(opt.shade ?? [0.55, 0.45, 0.7])) },
          uMap: { value: opt.map ?? null },
          uUseMap: { value: opt.map ? 1 : 0 },
          uRim: { value: opt.rim ?? 0.32 },
          uSoft: { value: opt.soft ?? 0 },
          uSpec: { value: opt.spec ?? 0 },
          uFlat: { value: opt.flat ?? 0 },
        },
        vertexShader: CEL_VERT,
        fragmentShader: CEL_FRAG,
      }),
    )
  const inks = new Map<number, THREE.ShaderMaterial>()
  const ink = (mul: number) => {
    let m = inks.get(mul)
    if (!m) {
      m = track(
        new THREE.ShaderMaterial({
          uniforms: { uThick: shared.uThick, uMul: { value: mul }, uInk: { value: new THREE.Color(C.ink) } },
          vertexShader: INK_VERT,
          fragmentShader: INK_FRAG,
          side: THREE.BackSide,
        }),
      )
      inks.set(mul, m)
    }
    return m
  }
  /** a mesh with its inked hull */
  const part = (geo: THREE.BufferGeometry, mat: THREE.Material, line = 1) => {
    track(geo)
    const m = new THREE.Mesh(geo, mat)
    m.castShadow = true
    if (line > 0) {
      const hull = new THREE.Mesh(geo, ink(line))
      hull.castShadow = false
      m.add(hull)
    }
    return m
  }

  /* materials */
  const skin = cel(C.skin, { rim: 0.3 })
  // his own face from the avatar art; a painted one if the image is unavailable
  const faceMaps = new Map<string, THREE.Texture>()
  if (o.avatar) {
    const shared = new Map<HTMLCanvasElement, THREE.Texture>()
    for (const [key, c] of avatarFaces(o.avatar)) {
      if (!shared.has(c)) shared.set(c, tex(c))
      faceMaps.set(key, shared.get(c)!)
    }
  } else {
    for (const f of ["calm", "focus", "effort", "proud"] as Face[]) for (const b of [false, true]) faceMaps.set(f + b, tex(faceCanvas(f, b)))
  }
  const faceMat = cel("#ffffff", { map: faceMaps.get("calmfalse"), rim: 0.16, flat: o.avatar ? 0.72 : 0.5 })
  const jersey = cel("#ffffff", { map: tex(jerseyCanvas(o.display)), rim: 0.3 })
  const pantsL = cel("#ffffff", { map: tex(pantsCanvas([0.75], 0.62)), rim: 0.28 })
  const pantsR = cel("#ffffff", { map: tex(pantsCanvas([0.25], null)), rim: 0.28 })
  const pantsHip = cel("#ffffff", { map: tex(pantsCanvas([0.25, 0.75], null)), rim: 0.28 })
  const pantsPlain = cel(C.pants, { rim: 0.28 })
  const hair = cel(C.hair, { rim: 0.2, spec: 0.12, shade: [0.4, 0.4, 0.52] })
  const white = cel(C.white, { rim: 0.25 })
  const red = cel(C.shoeRed, { rim: 0.3 })
  const black = cel(C.black, { rim: 0.35 })

  /* skeleton */
  const group = new THREE.Group()
  const pelvis = new THREE.Group()
  pelvis.rotation.order = "YXZ"
  const chest = new THREE.Group()
  chest.position.y = DIM.waist
  const neck = new THREE.Group()
  neck.position.set(0, DIM.neckY, -0.008)
  neck.rotation.order = "YXZ"
  const head = new THREE.Group()
  head.position.set(0, 0.118, 0.018)
  head.scale.setScalar(1.1)
  group.add(pelvis)
  pelvis.add(chest)
  chest.add(neck)
  neck.add(head)

  /* body */
  pelvis.add(
    part(
      shell(
        [
          [0, 0.128],
          [0.4, 0.14],
          [0.75, 0.138],
          [1, 0.1],
        ],
        0.3,
        { capTop: 0.01, capBot: 0.04, sz: 0.72 },
      ).translate(0, 0.205, 0),
      pantsHip,
    ),
  )
  chest.add(part(torsoGeo(), jersey))
  for (const s of [-1, 1]) {
    const cap = part(new THREE.SphereGeometry(0.054, 20, 14), skin, 0)
    cap.position.set(s * (DIM.shX - 0.004), DIM.chest - 0.006, DIM.shZ)
    cap.scale.set(1, 0.9, 0.95)
    chest.add(cap)
  }
  const neckMesh = part(new THREE.CylinderGeometry(0.037, 0.046, 0.15, 18), skin)
  neckMesh.position.set(0, DIM.neckY + 0.01, -0.008)
  chest.add(neckMesh)

  /* head */
  const headMesh = part(headGeo(!!o.avatar), faceMat, 0.8)
  head.add(headMesh)
  for (const s of [-1, 1]) {
    const ear = part(new THREE.SphereGeometry(1, 14, 10), skin, 0.7)
    ear.scale.set(0.011, 0.021, 0.015)
    ear.position.set(s * 0.082, -0.012, -0.006)
    head.add(ear)
  }
  head.add(part(hairGeo(), hair, 0.9))

  /* limbs: each is placed every frame from the solved joints */
  const thighGeo = (map: THREE.Material) =>
    part(
      shell(
        [
          [0, 0.082],
          [0.25, 0.082],
          [0.55, 0.074],
          [0.85, 0.064],
          [1, 0.058],
        ],
        DIM.thigh,
        { capTop: 0.035, capBot: 0.03, sx: 0.96 },
      ),
      map,
    )
  const shinGeo = (map: THREE.Material) =>
    part(
      shell(
        [
          [0, 0.057],
          [0.3, 0.057],
          [0.62, 0.055],
          [0.8, 0.053],
          [0.92, 0.046],
          [1, 0.043],
        ],
        DIM.shin,
        { capTop: 0.03, capBot: 0.012 },
      ),
      map,
    )
  const upperGeo = () =>
    part(
      shell(
        [
          [0, 0.056],
          [0.14, 0.06],
          [0.36, 0.053],
          [0.56, 0.053],
          [0.86, 0.04],
          [1, 0.036],
        ],
        DIM.upper,
        { capTop: 0.03, capBot: 0.025, sz: 0.94 },
      ),
      skin,
    )
  const foreGeo = () =>
    part(
      shell(
        [
          [0, 0.041],
          [0.18, 0.047],
          [0.5, 0.038],
          [0.85, 0.03],
          [1, 0.028],
        ],
        DIM.fore,
        { capTop: 0.02, capBot: 0.012, sx: 1.12, sz: 0.88 },
      ),
      skin,
    )
  const fistGeo = () => {
    const m = part(new RoundedBoxGeometry(0.072, 0.088, 0.06, 3, 0.024), skin, 0.8)
    const thumb = part(new THREE.CapsuleGeometry(0.0115, 0.028, 4, 10), skin, 0.7)
    thumb.rotation.z = Math.PI / 2
    thumb.position.set(0, -0.018, 0.03)
    m.add(thumb)
    return m
  }
  const shoe = () => {
    const g = new THREE.Group()
    const sole = part(new RoundedBoxGeometry(0.108, 0.034, 0.29, 2, 0.014), white)
    sole.position.set(0, -DIM.ankleY + 0.017, 0.055)
    const upper = part(new THREE.SphereGeometry(1, 22, 14), red)
    upper.scale.set(0.054, 0.058, 0.135)
    upper.position.set(0, -DIM.ankleY + 0.05, 0.045)
    const toe = part(new THREE.SphereGeometry(1, 20, 12), white)
    toe.scale.set(0.05, 0.036, 0.075)
    toe.position.set(0, -DIM.ankleY + 0.04, 0.12)
    const swoosh = part(new THREE.TorusGeometry(0.05, 0.0065, 6, 16, Math.PI * 0.55), black, 0)
    swoosh.rotation.set(0, Math.PI / 2, 0.2)
    swoosh.position.set(0, -DIM.ankleY + 0.09, 0.03)
    swoosh.scale.set(1, 0.6, 1.25)
    const collar = part(new THREE.TorusGeometry(0.044, 0.014, 8, 20), black)
    collar.rotation.x = Math.PI / 2
    collar.position.set(0, 0.012, -0.004)
    g.add(sole, upper, toe, swoosh, collar)
    return g
  }

  interface Limbs {
    thigh: THREE.Mesh
    knee: THREE.Mesh
    shin: THREE.Mesh
    shoe: THREE.Group
    upper: THREE.Mesh
    elbow: THREE.Mesh
    fore: THREE.Mesh
    fist: THREE.Mesh
    band: THREE.Mesh
  }
  const limbs: Limbs[] = [1, -1].map((s) => {
    const l: Limbs = {
      thigh: thighGeo(s > 0 ? pantsL : pantsR),
      knee: part(new THREE.SphereGeometry(0.06, 18, 12), pantsPlain, 0),
      shin: shinGeo(s > 0 ? pantsL : pantsR),
      shoe: shoe(),
      upper: upperGeo(),
      elbow: part(new THREE.SphereGeometry(0.037, 16, 10), skin, 0),
      fore: foreGeo(),
      fist: fistGeo(),
      // a white sweatband on the left wrist, a red one on the right
      band: part(new THREE.CylinderGeometry(0.035, 0.035, 0.045, 18), s > 0 ? white : red, 0.7),
    }
    l.band.position.y = -DIM.fore + 0.04
    l.fore.add(l.band)
    group.add(l.thigh, l.knee, l.shin, l.shoe, l.upper, l.elbow, l.fore, l.fist)
    return l
  })

  /* ── solving ─────────────────────────────────────────────────────────── */
  const pose = newPose()
  const m4 = new THREE.Matrix4(), chestM = new THREE.Matrix4(), basis = new THREE.Matrix4()
  const H = new THREE.Vector3(), K = new THREE.Vector3(), A = new THREE.Vector3(), S = new THREE.Vector3()
  const E = new THREE.Vector3(), W = new THREE.Vector3(), G = new THREE.Vector3(), P = new THREE.Vector3()
  const vd = new THREE.Vector3(), vp = new THREE.Vector3(), hd = new THREE.Vector3(), vx = new THREE.Vector3(), vy = new THREE.Vector3(), vz = new THREE.Vector3()
  const X_AXIS = new THREE.Vector3(1, 0, 0), Z_AXIS = new THREE.Vector3(0, 0, 1)

  /** knee or elbow for a chain from a toward b, bending toward pole; returns the reached end */
  function twoBone(a: THREE.Vector3, b: THREE.Vector3, l1: number, l2: number, pole: THREE.Vector3, mid: THREE.Vector3, end: THREE.Vector3) {
    vd.subVectors(b, a)
    const dist = vd.length() || 1e-6
    const dd = Math.min((l1 + l2) * 0.9995, Math.max(Math.abs(l1 - l2) + 1e-4, dist))
    vd.divideScalar(dist)
    end.copy(a).addScaledVector(vd, dd)
    const x = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd)
    const h = Math.sqrt(Math.max(0, l1 * l1 - x * x))
    vp.copy(pole).addScaledVector(vd, -pole.dot(vd))
    if (vp.lengthSq() < 1e-8) vp.set(0, 0, 1)
    vp.normalize()
    mid.copy(a).addScaledVector(vd, x).addScaledVector(vp, h)
  }

  /** put a shell (root at its origin, hanging along -y) between two joints */
  function place(obj: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3, hint = X_AXIS) {
    obj.position.copy(from)
    vy.subVectors(from, to).normalize()
    vx.copy(hint).addScaledVector(vy, -hint.dot(vy))
    if (vx.lengthSq() < 1e-4) vx.copy(Z_AXIS).addScaledVector(vy, -vy.z)
    vx.normalize()
    vz.crossVectors(vx, vy)
    basis.makeBasis(vx, vy, vz)
    obj.quaternion.setFromRotationMatrix(basis)
  }

  function apply() {
    const p = pose
    pelvis.position.copy(p.hip)
    pelvis.rotation.set(p.trunk, p.twist, p.lean)
    chest.rotation.x = p.arch
    const b = p.breathe
    chest.scale.set(1 + 0.022 * b, 1 + 0.008 * b, 1 + 0.045 * b)
    neck.rotation.set(p.head.x, p.head.y, p.head.z)
    pelvis.updateMatrix()
    chest.updateMatrix()
    chestM.multiplyMatrices(pelvis.matrix, chest.matrix)

    limbs.forEach((l, i) => {
      const s = i === 0 ? 1 : -1
      // leg: hip joint to a planted ankle, knee forward and out over the toes
      H.set(s * DIM.hipX, 0, 0).applyMatrix4(pelvis.matrix)
      A.set(s * DIM.footX, DIM.ankleY, 0)
      P.set(s * 0.34, 0, 1)
      twoBone(H, A, DIM.thigh, DIM.shin, P, K, W)
      place(l.thigh, H, K)
      l.knee.position.copy(K)
      place(l.shin, K, A)
      l.shoe.position.copy(A)
      l.shoe.rotation.y = s * DIM.toeOut

      // arm: shoulder to the wrist behind the fist
      S.set(s * DIM.shX, DIM.chest, DIM.shZ).applyMatrix4(chestM)
      G.copy(p.hands[i])
      hd.subVectors(S, G).normalize()
      W.copy(G).addScaledVector(hd, DIM.grip)
      twoBone(S, W, DIM.upper, DIM.fore, p.poles[i], E, A)
      // if the target was out of reach the fist follows the reached wrist
      G.copy(A).addScaledVector(hd, -DIM.grip)
      place(l.upper, S, E)
      l.elbow.position.copy(E)
      place(l.fore, E, A)
      l.fist.position.copy(G).addScaledVector(hd, 0.008)
      vy.copy(hd)
      vx.copy(X_AXIS).addScaledVector(vy, -vy.x)
      if (vx.lengthSq() < 1e-4) vx.copy(Z_AXIS)
      vx.normalize()
      vz.crossVectors(vx, vy)
      basis.makeBasis(vx, vy, vz)
      l.fist.quaternion.setFromRotationMatrix(basis)
    })
  }

  /* ── per-frame life: blinks and light ────────────────────────────────── */
  let blinkIn = 2.2
  let blinkT = -1
  let faceKey = ""

  function update(dt: number, camera: THREE.Camera, keyDir: THREE.Vector3) {
    shared.uLight.value.copy(keyDir).transformDirection(camera.matrixWorldInverse)

    // blink every few seconds, never mid-strain
    const face = pose.face
    blinkIn -= dt
    if (blinkIn <= 0 && blinkT < 0 && face !== "effort") blinkT = 0
    let shut = false
    if (blinkT >= 0) {
      blinkT += dt
      shut = blinkT < 0.12
      if (blinkT > 0.12) {
        blinkT = -1
        blinkIn = 2.2 + Math.random() * 2.6
      }
    }
    const key = face + shut
    if (key !== faceKey) {
      faceKey = key
      faceMat.uniforms.uMap.value = faceMaps.get(key)
    }
  }

  apply()

  return {
    group,
    pose,
    apply,
    update,
    setScale: (s) => {
      shared.uThick.value = 0.0062 * s
    },
    dispose: () => disposables.forEach((d) => d.dispose()),
  }
}
