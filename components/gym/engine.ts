import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { DIM, FACE_YAW, LEG, REACH, createAthlete, mixPose, newPose, type AthletePose, type Face } from "./athlete"
import { clamp01, curve, lerp, seg, spring, stepSpring } from "./motion"
import { buildGym, makePlateFace, makePlatform, makeRubber, radial } from "./set"

/*
 * The hero: Arav's avatar, a cel-shaded anime lifter in a Bulls jersey and Adidas track
 * pants, deadlifting on an oak platform in a gym. It plays as a looping film: he chalks up,
 * plates stamped with his stack slide onto the bar, he hinges down, grips, braces and pulls,
 * holds the lockout, then drops it so the bumpers bounce and throw chalk. The pull is solved,
 * not keyframed: for each moment of the lift the bar stays over mid-foot, the arms hang
 * straight from the shoulders and the legs are IK'd to planted feet, so the hips and knees
 * move the way a real deadlift does. Modelled on the TitanOCR landing hero (a WebGL film
 * with step controls and read-out chips).
 */

export interface GymEngineOptions {
  canvas: HTMLCanvasElement
  hero: HTMLElement
  slot: HTMLElement
  tagLayer: HTMLElement
  loadValue: HTMLElement
  chips: { load: HTMLElement; reps: HTMLElement }
  /** the avatar artwork, for his face */
  avatar: HTMLImageElement | null
  displayFont: string
  monoFont: string
  still: boolean
  onStep: (i: number) => void
}

export interface GymEngine {
  seek: (step: number) => void
  dispose: () => void
}

/** Plate pairs, inside to outside: label, weight in kg, colour band, thickness, radius. */
export const PLATES = [
  { label: "KAFKA", kg: 25, color: "#D2453B", t: 0.066, r: 0.225 },
  { label: "SPRING BOOT", kg: 20, color: "#3F63D6", t: 0.056, r: 0.225 },
  { label: "PYTHON", kg: 15, color: "#E3B23C", t: 0.046, r: 0.225 },
  { label: "GRAPH RAG", kg: 10, color: "#3C9A5F", t: 0.038, r: 0.225 },
  { label: "POSTGRES", kg: 5, color: "#E8E4DC", t: 0.028, r: 0.135 },
]
const BAR_KG = 20

const BAR = { shaftR: 0.0145, collarX: 0.67, collarR: 0.042, collarW: 0.03, sleeveIn: 0.7, sleeveOut: 1.1, sleeveR: 0.025, len: 2.2 }
/** bar centre height when it rests on the plates or on the loading blocks */
const REST = PLATES[0].r
/** the bar sits over mid-foot, in front of the ankles */
const BAR_Z = 0.115
const GRIP_X = 0.245
const RIG_YAW = -0.55
const SLIDE_OFF = 0.62
const PLAT_H = 0.03

/** Film times in seconds. */
const T = {
  clapIn: 0.5,
  clap: 0.85,
  clapOut: 1.3,
  hipsIn: 1.5,
  load: 2.0,
  loadGap: 0.62,
  setup: 5.4,
  hingeEnd: 6.0,
  gripAt: 5.85,
  settleEnd: 6.5,
  brace: 6.3,
  braceEnd: 6.75,
  slack: 6.7,
  pull: 6.95,
  hold: 8.55,
  smile: 9.05,
  drop: 11.4,
  pump: 11.85,
  pumpEnd: 12.85,
  unload: 13.1,
  unloadGap: 0.22,
  relax: 14.4,
  end: 15.6,
}
export const STEP_TIMES = [0, T.load, T.setup, T.hold, T.drop]

/* ── the pull, solved ───────────────────────────────────────────────────── */

/** lift progress over seconds since the pull began: a slow break, a grind past the knees */
const pullS = curve([
  [0, 0],
  [0.26, 0.05],
  [0.7, 0.4],
  [1.05, 0.62],
  [1.32, 0.84],
  [1.6, 1],
])
/** trunk lean from vertical, chest arch and shoulder-to-bar offset over lift progress */
const trunkC = curve([
  [0, 1.1],
  [0.14, 1.16],
  [0.4, 0.98],
  [0.68, 0.6],
  [0.88, 0.22],
  [1, -0.04],
])
const archC = curve([
  [0, 0],
  [0.6, -0.02],
  [1, -0.08],
])
const shoulderC = curve([
  [0, 0.06],
  [0.3, 0.05],
  [0.65, -0.03],
  [0.85, -0.1],
  [1, -0.165],
])

/**
 * Body pose at lift progress s (0 floor, 1 lockout). The shoulders hang the arm's length
 * above the bar, the trunk angle sets the hips behind them, and the hips never rise past
 * what straight legs reach. Returns the bar height that pose holds.
 */
function pullAt(s: number, out: AthletePose) {
  const th = trunkC(s), a = archC(s), dl = shoulderC(s)
  const offY = DIM.waist * Math.cos(th) + DIM.chest * Math.cos(th + a) - DIM.shZ * Math.sin(th + a)
  const offZ = DIM.waist * Math.sin(th) + DIM.chest * Math.sin(th + a) + DIM.shZ * Math.cos(th + a)
  const dx = GRIP_X - DIM.shX
  const vert = Math.sqrt(REACH * REACH - dl * dl - dx * dx)
  let hb = lerp(REST, 0.9, s)
  let hy = hb + vert - offY
  const hz = BAR_Z + dl - offZ
  const maxY = DIM.ankleY + Math.sqrt(Math.max(0, (LEG * 0.998) ** 2 - hz * hz - (DIM.footX - DIM.hipX) ** 2))
  if (hy > maxY) {
    hb -= hy - maxY
    hy = maxY
  }
  out.hip.set(0, hy, hz)
  out.trunk = th
  out.twist = 0
  out.lean = 0
  out.arch = a
  out.breathe = 0.9
  // neutral neck: eyes a little ahead on the floor, then level at the top
  out.head.set(-0.42 * (1 - s) - 0.04, 0, 0)
  return hb
}

/* ── engine ──────────────────────────────────────────────────────────────── */

export function createGymEngine(o: GymEngineOptions): GymEngine | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas: o.canvas, antialias: true, powerPreference: "high-performance" })
  } catch {
    return null
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  const aniso = renderer.capabilities.getMaxAnisotropy()

  const disposables: { dispose: () => void }[] = []
  const track = <D extends { dispose: () => void }>(d: D) => (disposables.push(d), d)
  const tex = (c: HTMLCanvasElement, srgb = true) => {
    const t = track(new THREE.CanvasTexture(c))
    if (srgb) t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = aniso
    return t
  }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x060a14)
  scene.fog = new THREE.Fog(0x060a14, 7.5, 17)
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60)
  const camBase = new THREE.Vector3(0, 1.4, 6.2)
  const camTarget = new THREE.Vector3(0, 0.92, 0)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = track(pmrem.fromScene(new RoomEnvironment(), 0.04).texture)
  pmrem.dispose()

  /* lights: a cool key from above and in front, cyan and purple rims */
  scene.add(new THREE.HemisphereLight(0x8fa6ff, 0x070a12, 0.4))
  const spot = new THREE.SpotLight(0xe9efff, 6.5, 0, 0.55, 0.85, 0)
  spot.castShadow = true
  spot.shadow.mapSize.set(2048, 2048)
  spot.shadow.bias = -0.0004
  spot.shadow.normalBias = 0.02
  spot.shadow.camera.near = 1
  spot.shadow.camera.far = 16
  spot.shadow.intensity = 0.75
  scene.add(spot, spot.target)
  const rimPurple = new THREE.DirectionalLight(0xb47cff, 1.4)
  const rimCyan = new THREE.DirectionalLight(0x5ef0f0, 1.1)
  scene.add(rimPurple, rimCyan, rimPurple.target, rimCyan.target)
  const keyDir = new THREE.Vector3()

  /* the floor, the gym around it, and the rig (platform, blocks, bar, lifter) */
  const tileTex = tex(makeRubber(512, 2, 9))
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping
  tileTex.repeat.set(16, 16)
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(32, 32)), track(new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.9 })))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const gym = buildGym({ track, tex, envTex, display: o.displayFont, mono: o.monoFont })
  const set = gym.group
  scene.add(set)

  const rig = new THREE.Group()
  rig.rotation.y = RIG_YAW
  scene.add(rig)
  const platTop = track(new THREE.MeshStandardMaterial({ map: tex(makePlatform()), roughness: 0.78 }))
  const platSide = track(new THREE.MeshStandardMaterial({ color: 0x2b2d33, metalness: 0.5, roughness: 0.5, envMap: envTex, envMapIntensity: 0.4 }))
  const platform = new THREE.Mesh(track(new THREE.BoxGeometry(2.6, PLAT_H, 2.0)), [platSide, platSide, platTop, platSide, platSide, platSide])
  platform.position.set(0, PLAT_H / 2, BAR_Z - 0.12)
  platform.receiveShadow = true
  rig.add(platform)
  /** everything that stands on the platform */
  const stage = new THREE.Group()
  stage.position.y = PLAT_H
  rig.add(stage)
  const wood = track(new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.7 }))
  for (const s of [-1, 1]) {
    const block = new THREE.Mesh(track(new THREE.BoxGeometry(0.13, REST - BAR.shaftR, 0.28)), wood)
    block.position.set(s * 0.5, (REST - BAR.shaftR) / 2, BAR_Z)
    block.castShadow = true
    block.receiveShadow = true
    stage.add(block)
  }
  const contact = new THREE.Mesh(track(new THREE.PlaneGeometry(0.9, 0.5)), track(new THREE.MeshBasicMaterial({ map: tex(radial("rgba(0,0,0,0.7)")), transparent: true, depthWrite: false })))
  contact.rotation.x = -Math.PI / 2
  contact.position.set(0, 0.003, 0.03)
  stage.add(contact)

  /* the bar */
  const steel = track(new THREE.MeshStandardMaterial({ color: 0xc9cdd3, metalness: 1, roughness: 0.3, envMap: envTex, envMapIntensity: 0.9 }))
  const knurl = track(new THREE.MeshStandardMaterial({ color: 0x8e949c, metalness: 1, roughness: 0.55, envMap: envTex, envMapIntensity: 0.7 }))
  const chrome = track(new THREE.MeshStandardMaterial({ color: 0xe4e7eb, metalness: 1, roughness: 0.16, envMap: envTex, envMapIntensity: 1.1 }))
  const rubberSide = track(new THREE.MeshStandardMaterial({ color: 0x1f2028, roughness: 0.7 }))
  const bar = new THREE.Group()
  stage.add(bar)
  const shaftGeo = track(new THREE.CylinderGeometry(BAR.shaftR, BAR.shaftR, BAR.collarX * 2, 18, 48, true))
  shaftGeo.rotateZ(Math.PI / 2)
  const shaftBase = Float32Array.from(shaftGeo.attributes.position.array as Float32Array)
  const shaft = new THREE.Mesh(shaftGeo, knurl)
  shaft.castShadow = true
  bar.add(shaft)

  const faceMats: THREE.MeshStandardMaterial[] = []
  const sides = [1, -1].map((dir) => {
    const group = new THREE.Group()
    group.position.x = dir * BAR.collarX
    const collar = new THREE.Mesh(track(new THREE.CylinderGeometry(BAR.collarR, BAR.collarR, BAR.collarW, 32)), steel)
    collar.rotation.z = Math.PI / 2
    collar.position.x = dir * (BAR.collarW / 2)
    collar.castShadow = true
    const sleeveLen = BAR.sleeveOut - BAR.sleeveIn + 0.03
    const sleeve = new THREE.Mesh(track(new THREE.CylinderGeometry(BAR.sleeveR, BAR.sleeveR, sleeveLen, 32)), chrome)
    sleeve.rotation.z = Math.PI / 2
    sleeve.position.x = dir * (BAR.sleeveIn - BAR.collarX - 0.03 + sleeveLen / 2)
    sleeve.castShadow = true
    group.add(collar, sleeve)
    let cum = BAR.sleeveIn - BAR.collarX
    const plates = PLATES.map((p, i) => {
      const plate = new THREE.Group()
      const side = new THREE.Mesh(track(new THREE.CylinderGeometry(p.r, p.r, p.t, 72, 1, true)), rubberSide)
      side.rotation.z = Math.PI / 2
      side.castShadow = true
      side.receiveShadow = true
      if (!faceMats[i]) faceMats[i] = track(new THREE.MeshStandardMaterial({ map: tex(makePlateFace(p.label, p.kg, p.color, o.displayFont, o.monoFont)), roughness: 0.7 }))
      // faces are discs turned to point along the bar, so the print reads correctly on both sides
      for (const f of [1, -1]) {
        const face = new THREE.Mesh(track(new THREE.CircleGeometry(p.r, 72)), faceMats[i])
        face.rotation.y = (f * Math.PI) / 2
        face.position.x = (f * p.t) / 2
        face.castShadow = true
        plate.add(face)
      }
      plate.add(side)
      plate.userData.home = dir * (cum + p.t / 2)
      plate.userData.dir = dir
      cum += p.t
      plate.position.x = plate.userData.home + dir * SLIDE_OFF
      plate.visible = false
      group.add(plate)
      return plate
    })
    bar.add(group)
    return { group, plates }
  })

  /* the lifter */
  const athlete = createAthlete({ display: o.displayFont, aniso, avatar: o.avatar })
  stage.add(athlete.group)
  disposables.push(athlete)

  /* light shaft, chalk dust and chalk puffs */
  const shaftAlpha = document.createElement("canvas")
  shaftAlpha.width = 4
  shaftAlpha.height = 256
  {
    const g = shaftAlpha.getContext("2d")!
    const grad = g.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, "rgb(40,40,40)")
    grad.addColorStop(0.35, "rgb(150,150,150)")
    grad.addColorStop(1, "rgb(25,25,25)")
    g.fillStyle = grad
    g.fillRect(0, 0, 4, 256)
  }
  const beam = new THREE.Mesh(
    track(new THREE.ConeGeometry(1.25, 1, 64, 1, true)),
    track(new THREE.MeshBasicMaterial({ color: 0xdfe8ff, alphaMap: tex(shaftAlpha, false), transparent: true, opacity: 0.055, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })),
  )
  scene.add(beam)

  const dotTex = tex(radial("rgba(255,255,255,1)", 64))
  const DUST = 240
  const dustPos = new Float32Array(DUST * 3)
  const dustSeed = new Float32Array(DUST * 3).map(() => Math.random())
  const dustGeo = track(new THREE.BufferGeometry())
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(dustGeo, track(new THREE.PointsMaterial({ size: 0.014, map: dotTex, color: 0xdfeaff, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })))
  scene.add(dust)

  const L = { hw: 0, hh: 0, scale: 1 }

  interface Puff { pts: THREE.Points; vel: Float32Array; age: number; life: number; mat: THREE.PointsMaterial }
  const PUFF_N = 42
  const puffs: Puff[] = Array.from({ length: 6 }, () => {
    const geo = track(new THREE.BufferGeometry())
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PUFF_N * 3), 3))
    const mat = track(new THREE.PointsMaterial({ size: 0.045, map: dotTex, color: 0xf2f5fb, transparent: true, opacity: 0, depthWrite: false }))
    const pts = new THREE.Points(geo, mat)
    pts.frustumCulled = false
    scene.add(pts)
    return { pts, vel: new Float32Array(PUFF_N * 3), age: 99, life: 1.4, mat }
  })
  let puffNext = 0
  const puff = (at: THREE.Vector3, strength: number) => {
    const p = puffs[puffNext++ % puffs.length]
    const pos = p.pts.geometry.attributes.position.array as Float32Array
    const s = L.scale
    for (let i = 0; i < PUFF_N; i++) {
      const a = Math.random() * Math.PI * 2, v = (0.15 + Math.random() * 0.55) * strength * s
      pos[i * 3] = at.x + (Math.random() - 0.5) * 0.06 * s
      pos[i * 3 + 1] = at.y + Math.random() * 0.04 * s
      pos[i * 3 + 2] = at.z + (Math.random() - 0.5) * 0.06 * s
      p.vel[i * 3] = Math.cos(a) * v
      p.vel[i * 3 + 1] = (0.08 + Math.random() * 0.35) * strength * s
      p.vel[i * 3 + 2] = Math.sin(a) * v
    }
    p.pts.geometry.attributes.position.needsUpdate = true
    p.age = 0
    p.life = 1.1 + strength * 0.5
  }

  /* overlay: plate tags */
  const tags = PLATES.map((p) => {
    const tag = document.createElement("span")
    tag.className = "gym-tag"
    const kg = document.createElement("i")
    kg.textContent = `${p.kg} kg`
    tag.append(document.createTextNode(p.label), kg)
    o.tagLayer.appendChild(tag)
    return tag
  })

  /* ── state ───────────────────────────────────────────────────────────── */
  const barY = spring(REST, 420, 38)
  const bend = spring(0, 260, 6)
  const plateS = PLATES.map(() => spring(SLIDE_OFF, 230, 15))
  let yMode: "spring" | "fall" | "rest" = "spring"
  let pinned = false
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 }
  let film = 0
  let step = -1
  const shown = { load: false, reps: false }
  const fired = new Set<string>()
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3()
  let shake = 0
  let lastTime = 0

  const setStep = (i: number) => {
    if (i === step) return
    step = i
    o.onStep(i)
  }

  const seatedKg = (t: number) =>
    BAR_KG + PLATES.reduce((s, p, i) => s + (t >= T.load + i * T.loadGap + 0.32 && t < T.unload + (PLATES.length - 1 - i) * T.unloadGap ? 2 * p.kg : 0), 0)

  /* ── choreography ────────────────────────────────────────────────────── */
  const P = { stand: newPose(), hinge: newPose(), start: newPose(), lock: newPose(), body: newPose() }
  let bodyBar = REST

  function standAt(t: number, out: AthletePose) {
    out.hip.set(Math.sin(t * 0.8) * 0.008, LEG + DIM.ankleY - 0.008 + Math.sin(t * 1.7) * 0.0025, -0.012)
    out.trunk = 0.035 + Math.sin(t * 1.7) * 0.006
    out.twist = Math.sin(t * 0.5) * 0.04
    out.lean = Math.sin(t * 0.8) * 0.014
    out.arch = 0
    out.breathe = 0.5 + 0.5 * Math.sin(t * 1.7)
    out.head.set(0.04, 0, 0)
  }
  function hingeAt(out: AthletePose) {
    out.hip.set(0, 0.725, -0.24)
    out.trunk = 1.22
    out.twist = 0
    out.lean = 0
    out.arch = 0.06
    out.breathe = 0.3
    out.head.set(-0.2, 0, 0)
  }
  /** lockout, with the hold's proud chest and slow breathing layered on */
  function lockAt(t: number, out: AthletePose) {
    const hb = pullAt(1, out)
    const k = seg(t, T.hold, T.hold + 0.5)
    out.arch -= 0.05 * k
    out.trunk -= 0.02 * k
    out.breathe = lerp(0.9, 0.55 + 0.35 * Math.sin((t - T.hold) * 1.9), k)
    out.lean = Math.sin(t * 0.9) * 0.008 * k
    return hb
  }

  /** Where the body is at film time t; returns the bar height it holds. */
  function bodyAt(t: number, out: AthletePose) {
    standAt(t, P.stand)
    if (t < T.setup) {
      mixPose(P.stand, P.stand, 0, out)
      return REST
    }
    hingeAt(P.hinge)
    if (t < T.hingeEnd) {
      mixPose(P.stand, P.hinge, seg(t, T.setup, T.hingeEnd), out)
      return REST
    }
    if (t < T.pull) {
      pullAt(0, P.start)
      mixPose(P.hinge, P.start, seg(t, T.hingeEnd, T.settleEnd), out)
      // the brace: a big breath into the belly, hips sink a touch, then the slack comes out
      const b = seg(t, T.brace, T.braceEnd)
      out.breathe = lerp(out.breathe, 1, b)
      out.hip.y -= 0.012 * Math.sin(Math.PI * b)
      out.hip.y += 0.006 * seg(t, T.slack, T.pull)
      return REST
    }
    if (t < T.hold) {
      const hb = pullAt(pullS(t - T.pull), out)
      // strain at the sticking point: a fine tremble
      const g = seg(t, T.pull + 0.65, T.pull + 0.85) * (1 - seg(t, T.pull + 1.1, T.pull + 1.35))
      return hb + Math.sin(t * 71) * 0.0016 * g
    }
    if (t < T.drop) return lockAt(t, out)
    lockAt(T.drop, P.lock)
    mixPose(P.lock, P.stand, seg(t, T.drop, T.drop + 0.65), out)
    return REST
  }

  const v3 = () => new THREE.Vector3()
  const H = { relax: [v3(), v3()], clap: [v3(), v3()], hips: [v3(), v3()], pump: v3(), release: [v3(), v3()] }
  const POLES = {
    relax: [new THREE.Vector3(0.35, 0, -1), new THREE.Vector3(-0.35, 0, -1)],
    clap: [new THREE.Vector3(1, -0.7, -0.1), new THREE.Vector3(-1, -0.7, -0.1)],
    hips: [new THREE.Vector3(1, 0.1, -0.45), new THREE.Vector3(-1, 0.1, -0.45)],
    grip: [new THREE.Vector3(0.45, -0.15, -1), new THREE.Vector3(-0.45, -0.15, -1)],
    pump: new THREE.Vector3(1, -0.5, 0.15),
  }

  /** hands and elbows, given the body and where the bar actually is */
  function handsAt(t: number, body: AthletePose, by: number) {
    const { x: hx, y: hy, z: hz } = body.hip
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? 1 : -1
      H.relax[i].set(hx + s * 0.245, hy - 0.165 + Math.sin(t * 1.7 + i) * 0.004, hz + 0.055)
      H.clap[i].set(s * 0.028 + Math.sin(t * 24) * 0.012 * s * seg(t, T.clap, T.clap + 0.1), hy + 0.165 + Math.cos(t * 24) * 0.008, 0.3)
      H.hips[i].set(hx + s * 0.205, hy + 0.1, hz + 0.035)
      H.release[i].set(s * 0.3, hy - 0.08, hz + 0.2)
    }
    // a fist punched up past his head
    H.pump.set(0.34, hy + 1.0 + 0.02 * Math.sin(t * 9), 0.12)

    const clapW = seg(t, T.clapIn, T.clap) * (1 - seg(t, T.clapOut, T.clapOut + 0.4))
    const hipsW = t < T.drop ? seg(t, T.hipsIn, T.hipsIn + 0.5) : seg(t, T.pump + 0.3, T.pumpEnd) * (1 - seg(t, T.relax, T.relax + 0.55))
    const pumpW = t >= T.drop ? seg(t, T.pump, T.pump + 0.28) * (1 - seg(t, T.pumpEnd - 0.4, T.pumpEnd)) : 0
    const relW = t >= T.drop ? 1 - seg(t, T.drop + 0.2, T.drop + 0.7) : 0
    const reach = seg(t, T.gripAt - 0.42, T.gripAt)
    const grip = t < T.drop ? reach : 1 - clamp01((t - T.drop) / 0.1)

    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? 1 : -1
      const hand = body.hands[i], pole = body.poles[i]
      hand.copy(H.relax[i]).lerp(H.clap[i], clapW).lerp(H.hips[i], hipsW).lerp(H.release[i], relW)
      pole.copy(POLES.relax[i]).lerp(POLES.clap[i], clapW).lerp(POLES.hips[i], hipsW)
      if (i === 0) {
        hand.lerp(H.pump, pumpW)
        pole.lerp(POLES.pump, pumpW)
      } else {
        hand.lerp(H.hips[i], pumpW)
        pole.lerp(POLES.hips[i], pumpW)
      }
      // on the bar; the hands swing out in front of the knees on the way down to it
      tmp.set(s * GRIP_X, by, BAR_Z)
      hand.lerp(tmp, grip)
      hand.z += 0.11 * Math.sin(Math.PI * reach) * (t < T.drop ? 1 : 0)
      pole.lerp(POLES.grip[i], grip)
    }
  }

  /** Head turns: down at the chalk, over at the plates, then to the camera at the top. */
  function headAt(t: number, body: AthletePose) {
    const hd = body.head
    // the camera, seen from the lifter's neck
    tmp2.copy(camera.position)
    athlete.group.worldToLocal(tmp2)
    const camYaw = THREE.MathUtils.clamp(Math.atan2(tmp2.x, tmp2.z), -0.7, 0.7)
    const camPitch = THREE.MathUtils.clamp(-Math.atan2(tmp2.y - 1.6, Math.hypot(tmp2.x, tmp2.z)), -0.3, 0.3)
    const chalk = seg(t, T.clapIn - 0.1, T.clap) * (1 - seg(t, T.clapOut, T.clapOut + 0.35))
    const plates = seg(t, T.load - 0.1, T.load + 0.3) * (1 - seg(t, T.setup - 0.4, T.setup))
    let nod = 0
    PLATES.forEach((_, i) => {
      const at = T.load + i * T.loadGap + 0.3
      nod += Math.exp(-(((t - at) / 0.09) ** 2)) * 0.07
    })
    const look = Math.max(seg(t, T.smile - 0.35, T.smile + 0.1) * (1 - seg(t, T.drop - 0.05, T.drop + 0.1)), seg(t, T.pump - 0.1, T.pump + 0.25) * (1 - seg(t, T.unload, T.unload + 0.5)))
    const idle = t < T.clapIn || (t > T.relax + 0.3) ? 1 : 0
    const drop = seg(t, T.drop - 0.02, T.drop + 0.15) * (1 - seg(t, T.drop + 0.45, T.pump))
    hd.x += (0.42 - hd.x) * chalk
    // his face is the artwork's three-quarter view, so the head keeps near that angle to the
    // camera: it turns a little, and lifts the chin rather than swinging round
    hd.x += (0.3 + nod - hd.x) * plates
    hd.y += (0.16 - hd.y) * plates
    hd.x += (camPitch - 0.1 - hd.x) * look
    hd.y += (THREE.MathUtils.clamp(camYaw - FACE_YAW, -0.2, 0.2) - hd.y) * look
    hd.y += 0.1 * idle * Math.sin(t * 0.7)
    hd.x += (0.35 - hd.x) * drop
    hd.z = -0.07 * look * Math.sin(t * 0.8 + 1)
    // a nod at the fist pump
    hd.x += 0.12 * Math.exp(-(((t - (T.pump + 0.3)) / 0.12) ** 2))
  }

  function faceAt(t: number): Face {
    if (t >= T.setup && t < T.pull) return "focus"
    if (t >= T.pull && t < T.hold + 0.3) return "effort"
    if (t >= T.smile && t < T.drop) return "proud"
    if (t >= T.drop && t < T.relax) return "proud"
    return "calm"
  }

  /** Everything the film shows at time t that is not physics. */
  function direct(t: number, snap: boolean) {
    bodyBar = bodyAt(t, P.body)
    pinned = t >= T.slack && t < T.pull + 0.24
    if (t < T.drop) {
      yMode = "spring"
      barY.t = t < T.slack ? REST : t < T.pull ? REST + 0.01 * seg(t, T.slack, T.pull) : bodyBar
    } else if (yMode === "spring") {
      yMode = "fall"
    }

    PLATES.forEach((_, i) => {
      const inAt = T.load + i * T.loadGap
      const outAt = T.unload + (PLATES.length - 1 - i) * T.unloadGap
      const on = t >= inAt && t < outAt + 0.45
      plateS[i].t = t >= inAt && t < outAt ? 0 : SLIDE_OFF
      if (snap) {
        plateS[i].v = plateS[i].t
        plateS[i].vel = 0
      }
      for (const s of sides) s.plates[i].visible = on
      tags[i].style.opacity = t >= inAt + 0.26 && t < inAt + 0.74 ? "1" : "0"
    })

    o.loadValue.textContent = String(seatedKg(t))
    const loadOn = t >= T.load && t < T.unload
    const repsOn = t >= T.hold && t < T.unload
    if (loadOn !== shown.load) o.chips.load.classList.toggle("is-on", (shown.load = loadOn))
    if (repsOn !== shown.reps) o.chips.reps.classList.toggle("is-on", (shown.reps = repsOn))

    let s = 0
    STEP_TIMES.forEach((v, k) => {
      if (t >= v) s = k
    })
    setStep(s)

    if (snap) {
      barY.v = t >= T.drop ? REST : barY.t
      barY.vel = 0
      bend.v = pinned ? Math.max(0, barY.v - REST) : 0
      bend.vel = 0
      if (t >= T.drop) yMode = "rest"
    }
  }

  function cue(t: number) {
    const once = (key: string, at: number, fn: () => void) => {
      if (t >= at && !fired.has(key)) {
        fired.add(key)
        fn()
      }
    }
    const hands = (strength: number) => {
      tmp.addVectors(P.body.hands[0], P.body.hands[1]).multiplyScalar(0.5)
      puff(athlete.group.localToWorld(tmp), strength)
    }
    once("clap", T.clap, () => hands(0.75))
    once("grip", T.gripAt, () => hands(0.3))
    PLATES.forEach((_, i) =>
      once(`seat${i}`, T.load + i * T.loadGap + 0.3, () => {
        bend.vel += 0.12
      }),
    )
  }

  let lastImpact = 0
  function physics(dt: number, now: number) {
    const n = Math.ceil(dt * 240)
    const h = dt / n
    for (let k = 0; k < n; k++) {
      if (yMode === "spring") stepSpring(barY, h)
      else if (yMode === "fall") {
        barY.vel -= 9.8 * h
        barY.v += barY.vel * h
        if (barY.v <= REST) {
          const impact = -barY.vel
          barY.v = REST
          barY.vel = impact * 0.36
          bend.vel -= impact * 0.28
          if (impact > 0.6 && now - lastImpact > 0.12) {
            lastImpact = now
            shake = Math.max(shake, Math.min(1, impact / 3.2))
            bar.updateMatrixWorld()
            for (const d of [1, -1]) puff(bar.localToWorld(tmp.set(d * 0.82, -PLATES[0].r * 0.92, 0)), Math.min(1.4, impact / 2.4))
          }
          if (impact < 0.25) {
            yMode = "rest"
            barY.vel = 0
          }
        }
      } else {
        barY.v = REST
        barY.vel = 0
      }
      if (pinned) {
        // the plates are still on the floor: the hands bend the bar instead of lifting it
        bend.v = Math.max(0, barY.v - REST)
        bend.vel = Math.max(0, barY.vel)
      } else {
        bend.t = Math.max(-0.03, Math.min(0.03, barY.vel * 0.014))
        bend.vel += (-bend.k * (bend.v - bend.t) - bend.c * bend.vel) * h
        bend.v = Math.max(-0.045, Math.min(0.045, bend.v + bend.vel * h))
      }
      for (const sp of plateS) stepSpring(sp, h)
    }
  }

  function pose(time: number, dt: number) {
    ptr.sx += (ptr.x - ptr.sx) * 0.05
    ptr.sy += (ptr.y - ptr.sy) * 0.05
    // a slow push in through the pull, a jolt when the bumpers land
    const push = seg(film, T.pull - 0.3, T.hold + 0.4) * (1 - seg(film, T.drop + 0.6, T.drop + 1.8))
    shake *= Math.exp(-dt * 7)
    const sx = shake * 0.02 * Math.sin(time * 61), sy = shake * 0.03 * Math.sin(time * 47 + 1)
    camera.position.set(
      camBase.x + Math.sin(time * 0.11) * 0.05 + ptr.sx * 0.16 + sx,
      camBase.y + Math.sin(time * 0.09) * 0.03 - ptr.sy * 0.08 - push * 0.06 + sy,
      camBase.z - push * 0.38,
    )
    camera.lookAt(camTarget)
    camera.updateMatrixWorld()

    bar.position.set(0, barY.v, BAR_Z)
    const b = bend.v
    const a = shaftGeo.attributes.position.array as Float32Array
    for (let i = 0; i < a.length; i += 3) {
      const u = shaftBase[i] / BAR.collarX
      a[i + 1] = shaftBase[i + 1] - b * u * u
    }
    shaftGeo.attributes.position.needsUpdate = true
    const tilt = Math.atan((2 * b) / BAR.collarX)
    sides[0].group.position.y = -b
    sides[0].group.rotation.z = -tilt
    sides[1].group.position.y = -b
    sides[1].group.rotation.z = tilt
    sides.forEach((s) =>
      s.plates.forEach((pl, i) => {
        const off = plateS[i].v
        pl.position.x = pl.userData.home + pl.userData.dir * off
        // a smaller change plate, once clear of the sleeve, settles down onto the floor
        const drop = REST - PLATES[i].r
        pl.position.y = drop > 0 && film >= T.unload ? -drop * clamp01((off - 0.18) / 0.22) : 0
      }),
    )

    // the lifter: body from the film, hands on the bar where it actually is
    const body = P.body
    const by = barY.v - bend.v * (GRIP_X / BAR.collarX) ** 2
    handsAt(film, body, by)
    rig.updateMatrixWorld()
    headAt(film, body)
    body.face = faceAt(film)
    mixPose(body, body, 0, athlete.pose)
    athlete.apply()
    athlete.update(dt, camera, keyDir)

    const base = rig.position, s = L.scale
    for (let i = 0; i < DUST; i++) {
      const sa = dustSeed[i * 3], sb = dustSeed[i * 3 + 1], sc = dustSeed[i * 3 + 2]
      dustPos[i * 3] = base.x + (sa - 0.5) * 3 * s + Math.sin(time * (0.1 + sb * 0.2) + sc * 9) * 0.12
      dustPos[i * 3 + 1] = 0.05 + ((sb * 2.8 + time * (0.01 + sa * 0.02)) % 2.8) * s
      dustPos[i * 3 + 2] = base.z + (sc - 0.5) * 2.4 * s + Math.cos(time * (0.08 + sa * 0.15) + sb * 7) * 0.1
    }
    dustGeo.attributes.position.needsUpdate = true
    // the neon catches a flicker of extra current on the lockout
    gym.neon.opacity = 0.92 + 0.08 * Math.sin(time * 3.1) + 0.25 * Math.exp(-(((film - T.hold - 0.1) / 0.25) ** 2))
  }

  function puffsStep(dt: number) {
    for (const p of puffs) {
      if (p.age >= p.life) {
        p.mat.opacity = 0
        continue
      }
      p.age += dt
      const pos = p.pts.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < PUFF_N * 3; i += 3) {
        pos[i] += p.vel[i] * dt
        pos[i + 1] = Math.max(0.01, pos[i + 1] + p.vel[i + 1] * dt)
        pos[i + 2] += p.vel[i + 2] * dt
        p.vel[i] *= 0.95
        p.vel[i + 1] = p.vel[i + 1] * 0.95 + 0.02 * dt
        p.vel[i + 2] *= 0.95
      }
      p.pts.geometry.attributes.position.needsUpdate = true
      p.mat.opacity = 0.55 * Math.pow(1 - p.age / p.life, 1.6)
    }
  }

  function placeTags() {
    PLATES.forEach((p, i) => {
      if (tags[i].style.opacity === "0") return
      tmp.set(0, p.r, 0).applyMatrix4(sides[0].plates[i].matrixWorld).project(camera)
      const x = ((tmp.x + 1) / 2) * L.hw
      const y = ((1 - tmp.y) / 2) * L.hh
      tags[i].style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, calc(-100% - 10px))`
    })
  }

  function render(time: number) {
    const dt = lastTime ? Math.min(0.05, time - lastTime) : 0
    lastTime = time
    pose(time, dt)
    scene.updateMatrixWorld()
    renderer.render(scene, camera)
    placeTags()
  }

  /* ── layout: the slot decides where he stands and how big the rig is ─── */
  function layout() {
    const hw = o.hero.clientWidth, hh = o.hero.clientHeight
    if (!hw || !hh) return
    L.hw = hw
    L.hh = hh
    let pr = Math.min(2, window.devicePixelRatio || 1)
    if (hw * hh * pr * pr > 5e6) pr = Math.sqrt(5e6 / (hw * hh))
    renderer.setPixelRatio(pr)
    renderer.setSize(hw, hh, false)
    camera.aspect = hw / hh
    camera.position.copy(camBase)
    camera.lookAt(camTarget)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    const hr = o.hero.getBoundingClientRect(), sr = o.slot.getBoundingClientRect()
    const cx = sr.left - hr.left + sr.width / 2
    const footY = sr.bottom - hr.top - sr.height * 0.08
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const fwd = new THREE.Vector3()
    camera.getWorldDirection(fwd)
    const ray = new THREE.Vector3((cx / hw) * 2 - 1, -((footY / hh) * 2 - 1), 0.5).unproject(camera).sub(camera.position).normalize()
    const along = ray.y < -0.02 ? -camera.position.y / ray.y : 6
    const base = camera.position.clone().addScaledVector(ray, along)
    base.y = 0
    // size the rig so the standing lifter fits the slot's height, and the bar its width
    const depth = base.clone().sub(camera.position).dot(fwd)
    const ppm = hh / (2 * depth * tanHalf)
    L.scale = Math.max(0.3, Math.min(1.4, (0.8 * sr.height) / (1.95 * ppm), (0.98 * sr.width) / (BAR.len * Math.cos(RIG_YAW) * ppm)))
    const s = L.scale
    rig.position.copy(base)
    rig.scale.setScalar(s)
    set.position.copy(base)
    set.scale.setScalar(s)
    // in a portrait hero the copy sits over the wall, so the sign would only peek out behind it
    gym.sign.visible = hw / hh > 0.9
    athlete.setScale(s)
    spot.position.set(base.x - 0.9 * s, 4.6 * s, base.z + 2.2 * s)
    spot.target.position.set(base.x, 0.5 * s, base.z)
    spot.target.updateMatrixWorld()
    keyDir.subVectors(spot.position, spot.target.position).normalize()
    rimPurple.position.set(base.x + 3 * s, 2.6 * s, base.z - 3 * s)
    rimPurple.target.position.copy(base)
    rimPurple.target.updateMatrixWorld()
    rimCyan.position.set(base.x - 3 * s, 2.4 * s, base.z - 3 * s)
    rimCyan.target.position.copy(base)
    rimCyan.target.updateMatrixWorld()
    const down = new THREE.Vector3().subVectors(spot.position, spot.target.position)
    const len = down.length() * 0.95
    beam.scale.set(s * 1.2, len, s * 1.2)
    beam.position.copy(spot.target.position).addScaledVector(down.normalize(), len / 2)
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), down)
    direct(film, true)
    render(performance.now() / 1000)
  }

  /* ── loop ────────────────────────────────────────────────────────────── */
  let raf = 0
  let last = 0
  let visible = true
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
    last = now
    if (!visible || document.hidden || !dt) return
    film += dt
    if (film >= T.end) {
      film = 0
      fired.clear()
      yMode = "spring"
      direct(0, true)
    }
    direct(film, false)
    cue(film)
    physics(dt, now / 1000)
    puffsStep(dt)
    render(now / 1000)
  }

  const onMove = (e: PointerEvent) => {
    const r = o.hero.getBoundingClientRect()
    ptr.x = (e.clientX - r.left) / r.width - 0.5
    ptr.y = (e.clientY - r.top) / r.height - 0.5
  }
  const onLeave = () => {
    ptr.x = 0
    ptr.y = 0
  }
  let rz = 0
  const onResize = () => {
    cancelAnimationFrame(rz)
    rz = requestAnimationFrame(layout)
  }
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
  })

  if (o.still) {
    // Reduced motion: one frame of the lockout, smiling at the camera, re-rendered on resize only.
    film = T.smile + 0.6
    layout()
    window.addEventListener("resize", onResize)
  } else {
    layout()
    o.hero.addEventListener("pointermove", onMove)
    o.hero.addEventListener("pointerleave", onLeave)
    window.addEventListener("resize", onResize)
    io.observe(o.hero)
    raf = requestAnimationFrame(tick)
  }

  return {
    seek(i: number) {
      // Jump to just before the step, so its own motion plays (a drop starts from the hold).
      film = STEP_TIMES[i] ?? 0
      fired.clear()
      if (film > T.clap) fired.add("clap")
      if (film > T.gripAt) fired.add("grip")
      PLATES.forEach((_, j) => {
        if (film > T.load + j * T.loadGap + 0.3) fired.add(`seat${j}`)
      })
      yMode = "spring"
      direct(Math.max(0, film - 0.001), true)
      if (o.still) render(performance.now() / 1000)
    },
    dispose() {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(rz)
      io.disconnect()
      o.hero.removeEventListener("pointermove", onMove)
      o.hero.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("resize", onResize)
      tags.forEach((t) => t.remove())
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
    },
  }
}
