"use client"

import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useInView } from "framer-motion"
import {
  Check,
  CheckCheck,
  Cpu,
  Gavel,
  Pause,
  Play,
  RotateCw,
  Satellite,
  ShieldCheck,
  ShoppingCart,
  TriangleAlert,
  Undo2,
  Warehouse,
  Waypoints,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { KAFKA_PROFILE, type KafkaPatternId } from "@/content/corpus"

/*
 * A live, illustrative Kafka pipeline modelled on the shipment flow of the Global Freight
 * platform. The simulation is a plain mutable object advanced by requestAnimationFrame;
 * every position is derived from (sim time - event birth), so pausing, resizing or
 * switching between the wide and narrow layouts never desynchronises chips from effects.
 */

/* ── supply-chain event model ─────────────────────────────────────────────── */

type EventType =
  | "ORDER_PLACED"
  | "STOCK_RESERVED"
  | "CARRIER_ASSIGNED"
  | "SHIPMENT_DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CARRIER_CANCELLED"
  | "STOCK_RELEASED"

const SHORT: Record<EventType, string> = {
  ORDER_PLACED: "ORDER",
  STOCK_RESERVED: "STOCK",
  CARRIER_ASSIGNED: "BID",
  SHIPMENT_DISPATCHED: "SHIP",
  IN_TRANSIT: "GPS",
  DELIVERED: "DONE",
  CARRIER_CANCELLED: "CANCEL",
  STOCK_RELEASED: "UNDO",
}

const PRODUCERS: { name: string; sub: string; icon: LucideIcon }[] = [
  { name: "order-service", sub: "Spring Boot REST", icon: ShoppingCart },
  { name: "warehouse-wms", sub: "stock and dispatch", icon: Warehouse },
  { name: "carrier-bidding", sub: "auction and bids", icon: Gavel },
  { name: "partner-gps-feed", sub: "XML into Avro", icon: Satellite },
]
const SAGA_SOURCE = "saga-orchestrator"

/** The happy-path lifecycle of one order, and which producer emits each step. */
const LIFECYCLE: { type: EventType; producer: number }[] = [
  { type: "ORDER_PLACED", producer: 0 },
  { type: "STOCK_RESERVED", producer: 1 },
  { type: "CARRIER_ASSIGNED", producer: 2 },
  { type: "SHIPMENT_DISPATCHED", producer: 1 },
  { type: "IN_TRANSIT", producer: 3 },
  { type: "DELIVERED", producer: 3 },
]

const SHIPPING = [
  { mode: "Standard Class", days: 4, lateOdds: 0.38 },
  { mode: "Second Class", days: 2, lateOdds: 0.76 },
  { mode: "First Class", days: 1, lateOdds: 0.95 },
  { mode: "Same Day", days: 0, lateOdds: 0.46 },
]
const CARRIERS = ["FastLane Logistics", "BlueRoute Freight", "TransIndia Cargo", "SwiftHaul"]
const WAREHOUSES = ["PNQ-02", "BOM-01", "DEL-04", "BLR-03"]

/** Seven hues, so an order's colour only repeats on the same partition every 21 orders. */
const ORDER_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#84cc16"]
const BAD = "#ef4444"
const GOOD = "#10b981"
const WARN = "#f59e0b"
const DEDUPE = "#06b6d4"
const SAGA = "#a855f7"
const INK = "var(--ink)"
const SURFACE = "var(--surface)"
const HAIR = "var(--hair)"
const LINE = "var(--line)"
const MUTED = "hsl(var(--muted-foreground))"
const ACCENT = "var(--accent)"
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace"

const PARTITIONS = 3
const KEEP = 9 // cells kept per lane: the widest layout shows 7, plus one sliding out
const SPAWN_MS = 1050
const PROCESS_MS = 460
const STATUS_HOLD_MS = 900
const RIPPLE_MS = 650

/* ── simulation state ─────────────────────────────────────────────────────── */

type Payload = Record<string, string | number | boolean>

interface Order {
  id: string
  color: string
  step: number
  partition: number
  shipping: (typeof SHIPPING)[number]
  sku: string
  qty: number
  warehouse: string
  carrier: string
  /** events of this order not yet appended: at most one, so per-order ordering holds */
  busy: number
}

interface SimEvent {
  id: number
  order: Order
  type: EventType
  /** producer index, or -1 when the SAGA orchestrator inside the consumer emits it */
  producer: number
  partition: number
  born: number
  poison: boolean
  crash: boolean
  validated: boolean
  offset: number
  fired: number
  payload: Payload
}

interface Cell {
  offset: number
  type: EventType
  color: string
  orderId: string
  history?: boolean
}

type ConsumerStatus = "idle" | "processing" | "committed" | "crashed" | "restarting" | "skipped"
type Tone = "info" | "ok" | "bad" | "warn" | "saga"

interface FeedLine {
  id: number
  t: number
  tag: string
  tone: Tone
  text: string
}

interface Ripple {
  id: number
  /** partition index, or -1 for the dead-letter lane */
  lane: number
  at: number
  color: string
}

interface Sim {
  now: number
  version: number
  nextSpawn: number
  seq: number
  orderSeq: number
  rr: number
  routineIdx: number
  rand: () => number
  orders: Order[]
  events: SimEvent[]
  lanes: Cell[][]
  logEnd: number[]
  committed: number[]
  dlq: Cell[]
  dlqEnd: number
  consumer: { status: ConsumerStatus; at: number }[]
  producerFlash: ({ at: number; color: string } | null)[]
  gateFlash: { at: number; ok: boolean; src: number } | null
  analyticsFlash: number
  ripples: Ripple[]
  rippleSeq: number
  crashPartition: number
  pending: { poison: boolean; crash: boolean; cancel: boolean }
  stats: { produced: number; processed: number; dlq: number; skipped: number; compensations: number; delivered: number; late: number }
  pulses: Partial<Record<KafkaPatternId, number>>
  feed: FeedLine[]
  feedSeq: number
  latest: { ev: SimEvent; error?: string } | null
  narration: { id: number; text: string; at: number; tone: Tone }
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Kafka's default partitioner hashes the key; any stable hash shows the same idea. */
function partitionFor(key: string) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) >>> 0
  return h % PARTITIONS
}

function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]
}

function newOrder(sim: Sim): Order {
  const n = sim.orderSeq++
  const id = `ORD-${n}`
  return {
    id,
    color: ORDER_COLORS[n % ORDER_COLORS.length],
    step: 0,
    partition: partitionFor(id),
    shipping: pick(sim.rand, SHIPPING),
    sku: `SKU-${10000 + Math.floor(sim.rand() * 89999)}`,
    qty: 1 + Math.floor(sim.rand() * 6),
    warehouse: pick(sim.rand, WAREHOUSES),
    carrier: pick(sim.rand, CARRIERS),
    busy: 0,
  }
}

function payloadFor(rand: () => number, o: Order, type: EventType): Payload {
  switch (type) {
    case "ORDER_PLACED":
      return { sku: o.sku, qty: o.qty, shippingMode: o.shipping.mode, promisedDays: o.shipping.days }
    case "STOCK_RESERVED":
      return { warehouse: o.warehouse, sku: o.sku, qty: o.qty }
    case "CARRIER_ASSIGNED":
      return { carrier: o.carrier, winningBidInr: 1200 + Math.floor(rand() * 1800) }
    case "SHIPMENT_DISPATCHED":
      return { warehouse: o.warehouse, carrier: o.carrier, promisedDays: o.shipping.days }
    case "IN_TRANSIT":
      return { lat: +(15 + rand() * 13).toFixed(4), lon: +(72 + rand() * 8).toFixed(4), etaHours: 6 + Math.floor(rand() * 60) }
    case "DELIVERED": {
      const late = rand() < o.shipping.lateOdds
      return { promisedDays: o.shipping.days, actualDays: o.shipping.days + (late ? 1 + Math.floor(rand() * 2) : 0), late }
    }
    case "CARRIER_CANCELLED":
      return { carrier: o.carrier, reason: "capacity withdrawn" }
    case "STOCK_RELEASED":
      return { warehouse: o.warehouse, sku: o.sku, qty: o.qty, compensates: "STOCK_RESERVED" }
  }
}

function createSim(): Sim {
  const sim: Sim = {
    now: 0,
    version: 0,
    nextSpawn: 350,
    seq: 110,
    orderSeq: 1041,
    rr: 0,
    routineIdx: 0,
    rand: mulberry32(7),
    orders: [],
    events: [],
    lanes: [[], [], []],
    logEnd: [1199, 2082, 1645],
    committed: [0, 0, 0],
    dlq: [],
    dlqEnd: 17,
    consumer: [0, 1, 2].map(() => ({ status: "idle" as ConsumerStatus, at: 0 })),
    producerFlash: PRODUCERS.map(() => null),
    gateFlash: null,
    analyticsFlash: -1e9,
    ripples: [],
    rippleSeq: 0,
    crashPartition: -1,
    pending: { poison: false, crash: false, cancel: false },
    stats: { produced: 0, processed: 0, dlq: 0, skipped: 0, compensations: 0, delivered: 0, late: 0 },
    pulses: {},
    feed: [],
    feedSeq: 0,
    latest: null,
    narration: {
      id: 0,
      text: "Producers publish supply-chain events keyed by orderId. Follow one colour: every event for that order lands on the same partition and is processed in order. Try a failure below.",
      at: 0,
      tone: "info",
    },
  }
  // Already-committed history so the log never starts empty.
  const historyTypes: EventType[] = ["IN_TRANSIT", "DELIVERED", "ORDER_PLACED", "STOCK_RESERVED", "CARRIER_ASSIGNED"]
  for (let p = 0; p < PARTITIONS; p++) {
    for (let k = 0; k < 5; k++) {
      sim.lanes[p].push({
        offset: sim.logEnd[p]++,
        type: historyTypes[(k + p) % historyTypes.length],
        color: LINE,
        orderId: `ORD-${1030 + p * 3 + (k >> 1)}`,
        history: true,
      })
    }
  }
  sim.committed = [...sim.logEnd]
  for (let i = 0; i < 4; i++) sim.orders.push(newOrder(sim))
  return sim
}

/* ── timeline: where an event travels and which effect fires at each stop ─── */

type Fx = "validate" | "append" | "arrive" | "process" | "redeliver" | "dedupe" | "dlq"
type Ease = "linear" | "in" | "out" | "inOut"
type Wp =
  | { k: "prod"; i: number }
  | { k: "gate"; i: number }
  | { k: "entry"; i: number }
  | { k: "consIn"; p: number }
  | { k: "sagaUp" }
  | { k: "sagaCtl1" }
  | { k: "sagaCtl2" }
  | { k: "gateSaga" }
  | { k: "sagaEntry" }
  | { k: "rail0"; p: number }
  | { k: "rail1"; p: number }
  | { k: "slot"; p: number }
  | { k: "cell"; p: number }
  | { k: "dlqRail0" }
  | { k: "dlqRail1" }
  | { k: "dlqSlot" }

/** A leg of the journey. With c1 and c2 it is a cubic bezier; without, a straight line. */
interface Seg {
  to: Wp
  dur: number
  fx?: Fx
  c1?: Wp
  c2?: Wp
  ease?: Ease
}

const EASE: Record<Ease, (t: number) => number> = {
  linear: (t) => t,
  in: (t) => t * t * t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
}

function timeline(ev: SimEvent): { start: Wp; segs: Seg[] } {
  const p = ev.partition
  const fromSaga = ev.producer < 0
  const start: Wp = fromSaga ? { k: "consIn", p } : { k: "prod", i: ev.producer }
  const segs: Seg[] = fromSaga
    ? [
        { to: { k: "sagaUp" }, dur: 240 + p * 110, ease: "in" },
        { to: { k: "gateSaga" }, dur: 1000, c1: { k: "sagaCtl1" }, c2: { k: "sagaCtl2" }, ease: "out" },
        { to: { k: "gateSaga" }, dur: 320, fx: "validate" },
      ]
    : [
        { to: { k: "gate", i: ev.producer }, dur: 620, ease: "out" },
        { to: { k: "gate", i: ev.producer }, dur: 340, fx: "validate" },
      ]
  const exit: Wp = fromSaga ? { k: "sagaEntry" } : { k: "entry", i: ev.producer }
  if (ev.poison) {
    segs.push(
      { to: { k: "dlqRail1" }, dur: 900, c1: exit, c2: { k: "dlqRail0" }, ease: "inOut" },
      { to: { k: "dlqSlot" }, dur: 220, fx: "dlq", ease: "out" },
    )
    return { start, segs }
  }
  segs.push(
    { to: { k: "rail1", p }, dur: 920, c1: exit, c2: { k: "rail0", p }, ease: "inOut" },
    { to: { k: "slot", p }, dur: 220, fx: "append", ease: "out" },
    { to: { k: "consIn", p }, dur: 540, fx: "arrive", ease: "inOut" },
    { to: { k: "consIn", p }, dur: PROCESS_MS, fx: "process" },
  )
  if (ev.crash) {
    segs.push(
      { to: { k: "cell", p }, dur: 440, ease: "inOut" },
      { to: { k: "cell", p }, dur: 340, fx: "redeliver" },
      { to: { k: "consIn", p }, dur: 540, fx: "arrive", ease: "inOut" },
      { to: { k: "consIn", p }, dur: PROCESS_MS, fx: "dedupe" },
    )
  }
  return { start, segs }
}

function totalDur(ev: SimEvent) {
  return timeline(ev).segs.reduce((s, x) => s + x.dur, 0)
}

/* ── simulation step + effects ───────────────────────────────────────────── */

function sourceOf(ev: SimEvent) {
  return ev.producer < 0 ? SAGA_SOURCE : PRODUCERS[ev.producer].name
}

function log(sim: Sim, tone: Tone, tag: string, text: string) {
  sim.feed.push({ id: ++sim.feedSeq, t: sim.now, tag, tone, text })
  if (sim.feed.length > 7) sim.feed.shift()
}

function narrate(sim: Sim, text: string, tone: Tone) {
  sim.narration = { id: sim.narration.id + 1, text, at: sim.now, tone }
}

function pulse(sim: Sim, id: KafkaPatternId) {
  sim.pulses[id] = sim.now
}

function ripple(sim: Sim, lane: number, color: string) {
  sim.ripples.push({ id: ++sim.rippleSeq, lane, at: sim.now, color })
}

const ROUTINE: ("keying" | "commit" | "avro")[] = ["keying", "commit", "avro"]

/** Plain-flow narration: rotates through the everyday patterns, never over an incident. */
function routine(sim: Sim, kind: (typeof ROUTINE)[number], ev: SimEvent) {
  if (sim.now - sim.narration.at < 4200) return
  if (kind !== ROUTINE[sim.routineIdx % ROUTINE.length]) return
  sim.routineIdx++
  const id = ev.order.id
  const p = ev.partition
  if (kind === "keying")
    narrate(sim, `${id} is the message key, so it always hashes to P${p}. Every event for ${id} lands on P${p}, so the order's lifecycle is consumed in sequence.`, "info")
  else if (kind === "commit")
    narrate(sim, `fulfillment-c${p} owns P${p} in its consumer group. It applied ${ev.type} for ${id}, then committed offset ${ev.offset + 1}. Commit comes after the work, never before.`, "ok")
  else
    narrate(sim, `${ev.type} from ${sourceOf(ev)} matched shipment_event v3 in the schema registry before being written, so consumers always get a typed, versioned record.`, "info")
}

function emit(sim: Sim, o: Order, type: EventType, producer: number, track = true): SimEvent {
  const ev: SimEvent = {
    id: ++sim.seq,
    order: o,
    type,
    producer,
    partition: o.partition,
    born: sim.now,
    poison: false,
    crash: false,
    validated: false,
    offset: -1,
    fired: 0,
    payload: payloadFor(sim.rand, o, type),
  }
  if (track) o.busy++
  sim.events.push(ev)
  if (producer >= 0) sim.producerFlash[producer] = { at: sim.now, color: o.color }
  return ev
}

function spawn(sim: Sim) {
  if (sim.pending.poison) {
    sim.pending.poison = false
    const ev = emit(sim, pick(sim.rand, sim.orders), "IN_TRANSIT", 3, false)
    ev.poison = true
    delete ev.payload.etaHours
    sim.version++
    return
  }

  const free = sim.orders.filter((o) => o.busy === 0 && o.partition !== sim.crashPartition)
  if (!free.length) return

  if (sim.pending.cancel) {
    // Only an order whose carrier is already booked (but not yet delivered) can be cancelled.
    const o = free.find((x) => x.step >= 3 && x.step <= 5)
    if (o) {
      sim.pending.cancel = false
      emit(sim, o, "CARRIER_CANCELLED", 2)
      o.step = 1 // once compensated, the order is re-reserved and re-bid
      o.carrier = CARRIERS[(CARRIERS.indexOf(o.carrier) + 1) % CARRIERS.length]
      sim.version++
      return
    }
  }

  const o = free[sim.rr++ % free.length]
  const { type, producer } = LIFECYCLE[o.step]
  const ev = emit(sim, o, type, producer)
  if (sim.pending.crash) {
    sim.pending.crash = false
    ev.crash = true
    // Hold new work for this partition until the crashed consumer has caught up again.
    sim.crashPartition = o.partition
    sim.version++
  }
  o.step++
  if (o.step >= LIFECYCLE.length) sim.orders[sim.orders.indexOf(o)] = newOrder(sim)
}

function commit(sim: Sim, ev: SimEvent) {
  const p = ev.partition
  sim.committed[p] = Math.max(sim.committed[p], ev.offset + 1)
}

function applyFx(sim: Sim, ev: SimEvent, fx: Fx) {
  const p = ev.partition
  const id = ev.order.id
  switch (fx) {
    case "validate": {
      ev.validated = true
      sim.gateFlash = { at: sim.now, ok: !ev.poison, src: ev.producer }
      pulse(sim, "avro")
      if (ev.poison) {
        pulse(sim, "dlq")
        sim.latest = { ev, error: 'missing required field "etaHours" (shipment_event v3)' }
        log(sim, "bad", "schema fail", `IN_TRANSIT for ${id} from partner-gps-feed has no "etaHours"`)
        narrate(sim, `The partner GPS feed sent IN_TRANSIT for ${id} without the required "etaHours" field. The Avro check rejects it before it reaches P${p}, and it is parked on the dead-letter topic so the partition keeps flowing.`, "bad")
      } else {
        routine(sim, "avro", ev)
      }
      break
    }
    case "append": {
      ev.offset = sim.logEnd[p]++
      const lane = sim.lanes[p]
      lane.push({ offset: ev.offset, type: ev.type, color: ev.order.color, orderId: id })
      if (lane.length > KEEP) lane.shift()
      // A cancellation keeps its order busy until the compensation is published.
      if (ev.type !== "CARRIER_CANCELLED") ev.order.busy--
      sim.stats.produced++
      sim.latest = { ev }
      pulse(sim, "keying")
      ripple(sim, p, ev.order.color)
      log(sim, ev.producer < 0 ? "saga" : "info", `P${p}@${ev.offset}`, `${id} ${ev.type} from ${sourceOf(ev)}`)
      routine(sim, "keying", ev)
      break
    }
    case "arrive":
      sim.consumer[p] = { status: "processing", at: sim.now }
      break
    case "process": {
      sim.stats.processed++
      if (ev.type === "DELIVERED") {
        sim.stats.delivered++
        if (ev.payload.late) sim.stats.late++
        sim.analyticsFlash = sim.now
      }
      if (ev.crash) {
        sim.consumer[p] = { status: "crashed", at: sim.now }
        pulse(sim, "commit")
        log(sim, "warn", `c${p} crash`, `applied ${id} ${ev.type}, died before committing ${ev.offset + 1}`)
        narrate(sim, `fulfillment-c${p} applied ${ev.type} for ${id}, then crashed before committing. The committed offset never moved, so Kafka will deliver the same event again.`, "warn")
        break
      }
      commit(sim, ev)
      sim.consumer[p] = { status: "committed", at: sim.now }
      pulse(sim, "commit")
      pulse(sim, "groups")
      log(sim, "ok", `c${p} commit`, `${id} ${ev.type} done, next offset ${ev.offset + 1}`)
      if (ev.type === "CARRIER_CANCELLED") {
        emit(sim, ev.order, "STOCK_RELEASED", -1)
        ev.order.busy--
        sim.stats.compensations++
        pulse(sim, "saga")
        log(sim, "saga", "SAGA", `${id} carrier cancelled, compensating with STOCK_RELEASED, then re-bid`)
        narrate(sim, `SAGA: the carrier cancelled ${id}. Instead of a distributed transaction, the orchestrator publishes a compensating STOCK_RELEASED event on the same key. Then the order is re-reserved and re-bid.`, "saga")
      } else {
        routine(sim, "commit", ev)
      }
      break
    }
    case "redeliver":
      sim.consumer[p] = { status: "restarting", at: sim.now }
      pulse(sim, "commit")
      log(sim, "warn", `c${p} restart`, `resumes at committed offset ${sim.committed[p]}, ${id} redelivered`)
      narrate(sim, `fulfillment-c${p} restarted and resumed from its last committed offset (${sim.committed[p]}). That is the event it already applied, so it is delivered a second time.`, "warn")
      break
    case "dedupe":
      commit(sim, ev)
      sim.stats.skipped++
      sim.consumer[p] = { status: "skipped", at: sim.now }
      sim.crashPartition = -1
      pulse(sim, "idempotent")
      pulse(sim, "commit")
      log(sim, "ok", `c${p} dedupe`, `eventId e-${ev.id} already applied, skip and commit ${ev.offset + 1}`)
      narrate(sim, `Idempotent consumer: event id e-${ev.id} is already in the processed set, so the side effect is skipped and only the offset is committed. ${id} is never double-processed.`, "ok")
      break
    case "dlq":
      sim.dlq.push({ offset: sim.dlqEnd++, type: ev.type, color: BAD, orderId: id })
      if (sim.dlq.length > KEEP) sim.dlq.shift()
      sim.stats.dlq++
      pulse(sim, "dlq")
      ripple(sim, -1, BAD)
      log(sim, "bad", `DLQ@${sim.dlqEnd - 1}`, `${id} ${ev.type} parked for inspection and replay`)
      break
  }
  sim.version++
}

function advance(sim: Sim, dt: number) {
  sim.now += dt
  while (sim.now >= sim.nextSpawn) {
    spawn(sim)
    sim.nextSpawn += SPAWN_MS
  }
  for (const ev of sim.events.slice()) {
    const age = sim.now - ev.born
    let t = 0
    let n = 0
    for (const s of timeline(ev).segs) {
      t += s.dur
      if (!s.fx) continue
      if (t > age) break
      if (n >= ev.fired) {
        ev.fired = n + 1
        applyFx(sim, ev, s.fx)
      }
      n++
    }
  }
  sim.events = sim.events.filter((ev) => sim.now - ev.born < totalDur(ev))
  sim.ripples = sim.ripples.filter((r) => sim.now - r.at < RIPPLE_MS)
}

/* ── geometry: one wide (desktop) and one narrow (mobile) layout ─────────── */

interface Pt {
  x: number
  y: number
}
interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface Geo {
  orient: "h" | "v"
  w: number
  h: number
  visible: number
  cellW: number
  cellH: number
  pitch: number
  chipW: number
  chipH: number
  prod: Box[]
  prodOut: Pt[]
  gate: Box
  gatePt: Pt[]
  entry: Pt[]
  gateSaga: Pt
  sagaEntry: Pt
  box: Box
  laneY: number[]
  dlqY: number
  laneX0: number
  track: [number, number]
  labelX: number
  railOffset: number
  railX0: number
  cons: Box[]
  consInX: number
  sagaX: number
  sagaTopY: number
  analytics: Box
  prodTitle: Pt
  consTitle: Pt
  font: { name: number; sub: number; cell: number; tiny: number }
}

const H_GEO: Geo = (() => {
  const prodY = [110, 190, 270, 350]
  const laneY = [128, 216, 304]
  return {
    orient: "h",
    w: 1000,
    h: 466,
    visible: 7,
    cellW: 42,
    cellH: 32,
    pitch: 48,
    chipW: 46,
    chipH: 18,
    prod: prodY.map((y) => ({ x: 14, y: y - 24, w: 168, h: 48 })),
    prodOut: prodY.map((y) => ({ x: 182, y })),
    gate: { x: 214, y: 82, w: 30, h: 296 },
    gatePt: prodY.map((y) => ({ x: 229, y })),
    entry: prodY.map((y) => ({ x: 268, y })),
    gateSaga: { x: 229, y: 82 },
    sagaEntry: { x: 268, y: 82 },
    box: { x: 274, y: 42, w: 444, h: 412 },
    laneY,
    dlqY: 398,
    laneX0: 312,
    track: [306, 652],
    labelX: 290,
    railOffset: 31,
    railX0: 300,
    cons: laneY.map((y) => ({ x: 756, y: y - 28, w: 230, h: 56 })),
    consInX: 726,
    sagaX: 726,
    sagaTopY: -10,
    analytics: { x: 756, y: 360, w: 230, h: 70 },
    prodTitle: { x: 14, y: 72 },
    consTitle: { x: 756, y: 88 },
    font: { name: 12, sub: 10.5, cell: 9, tiny: 8 },
  }
})()

const V_GEO: Geo = (() => {
  const prodX = [6, 109, 212, 315]
  const laneY = [222, 302, 382]
  return {
    orient: "v",
    w: 420,
    h: 590,
    visible: 6,
    cellW: 32,
    cellH: 30,
    pitch: 37,
    chipW: 38,
    chipH: 16,
    prod: prodX.map((x) => ({ x, y: 24, w: 99, h: 46 })),
    prodOut: prodX.map((x) => ({ x: x + 49.5, y: 70 })),
    gate: { x: 6, y: 90, w: 408, h: 22 },
    gatePt: prodX.map((x) => ({ x: x + 49.5, y: 101 })),
    entry: prodX.map((x) => ({ x: x + 49.5, y: 150 })),
    gateSaga: { x: 290, y: 101 },
    sagaEntry: { x: 290, y: 150 },
    box: { x: 4, y: 130, w: 278, h: 388 },
    laneY,
    dlqY: 470,
    laneX0: 34,
    track: [28, 257],
    labelX: 17,
    railOffset: 29,
    railX0: 30,
    cons: laneY.map((y) => ({ x: 298, y: y - 29, w: 116, h: 58 })),
    consInX: 316,
    sagaX: 290,
    sagaTopY: 150,
    analytics: { x: 4, y: 528, w: 410, h: 54 },
    prodTitle: { x: 6, y: 15 },
    consTitle: { x: 298, y: 186 },
    font: { name: 9, sub: 8, cell: 8, tiny: 7 },
  }
})()

function slotX(g: Geo, idx: number) {
  return g.laneX0 + idx * g.pitch + g.cellW / 2
}

function resolve(wp: Wp, g: Geo, sim: Sim, ev: SimEvent): Pt {
  const newest = slotX(g, g.visible - 1)
  switch (wp.k) {
    case "prod":
      return g.prodOut[wp.i]
    case "gate":
      return g.gatePt[wp.i]
    case "entry":
      return g.entry[wp.i]
    case "consIn":
      return { x: g.consInX, y: g.laneY[wp.p] }
    case "sagaUp":
      return { x: g.sagaX, y: g.laneY[0] }
    case "sagaCtl1":
      return { x: g.sagaX, y: g.sagaTopY }
    case "sagaCtl2":
      return { x: g.gateSaga.x, y: g.sagaTopY }
    case "gateSaga":
      return g.gateSaga
    case "sagaEntry":
      return g.sagaEntry
    case "rail0":
      return { x: g.railX0, y: g.laneY[wp.p] - g.railOffset }
    case "rail1":
      return { x: newest, y: g.laneY[wp.p] - g.railOffset }
    case "slot":
      return { x: newest, y: g.laneY[wp.p] }
    case "cell": {
      // The redelivered record has shifted left as newer events were appended.
      const lane = sim.lanes[wp.p]
      const at = lane.findIndex((c) => c.offset === ev.offset)
      const idx = at < 0 ? 0 : g.visible - (lane.length - at)
      return { x: slotX(g, Math.max(0, idx)), y: g.laneY[wp.p] }
    }
    case "dlqRail0":
      return { x: g.railX0, y: g.dlqY - g.railOffset }
    case "dlqRail1":
      return { x: newest, y: g.dlqY - g.railOffset }
    case "dlqSlot":
      return { x: newest, y: g.dlqY }
  }
}

function bezier(a: Pt, b: Pt, c: Pt, d: Pt, u: number): Pt {
  const v = 1 - u
  return {
    x: v * v * v * a.x + 3 * v * v * u * b.x + 3 * v * u * u * c.x + u * u * u * d.x,
    y: v * v * v * a.y + 3 * v * v * u * b.y + 3 * v * u * u * c.y + u * u * u * d.y,
  }
}

/** Where an event is `lag` ms ago; `hold` names the effect it is waiting on, if parked. */
function locate(ev: SimEvent, g: Geo, sim: Sim, lag = 0): Pt & { hold?: Fx; moving: boolean } {
  const { start, segs } = timeline(ev)
  let age = Math.max(0, sim.now - ev.born - lag)
  let from = resolve(start, g, sim, ev)
  for (const s of segs) {
    const to = resolve(s.to, g, sim, ev)
    if (age <= s.dur) {
      const u = EASE[s.ease ?? "linear"](s.dur ? age / s.dur : 1)
      if (s.c1 && s.c2) return { ...bezier(from, resolve(s.c1, g, sim, ev), resolve(s.c2, g, sim, ev), to, u), moving: true }
      if (from.x === to.x && from.y === to.y) return { ...to, hold: s.fx, moving: false }
      return { x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u, moving: true }
    }
    age -= s.dur
    from = to
  }
  return { ...from, moving: false }
}

const fade = (sim: Sim, at: number | undefined, ms: number) =>
  at === undefined ? 0 : Math.max(0, 1 - (sim.now - at) / ms)

/* ── diagram ─────────────────────────────────────────────────────────────── */

const STATUS_STYLE: Record<ConsumerStatus, { label: string; color: string; icon: LucideIcon }> = {
  idle: { label: "idle", color: MUTED, icon: Cpu },
  processing: { label: "processing", color: ACCENT, icon: Cpu },
  committed: { label: "committed", color: GOOD, icon: Check },
  crashed: { label: "crashed before commit", color: BAD, icon: X },
  restarting: { label: "restarting", color: WARN, icon: RotateCw },
  skipped: { label: "duplicate skipped", color: DEDUPE, icon: CheckCheck },
}

function consumerStatus(sim: Sim, p: number): ConsumerStatus {
  const c = sim.consumer[p]
  if (c.status === "crashed" || c.status === "restarting" || c.status === "processing") return c.status
  return sim.now - c.at < STATUS_HOLD_MS ? c.status : "idle"
}

/** A short line with a light pulse travelling along it: the direction data flows. */
function FlowLine({ x1, y1, x2, y2, color = ACCENT }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={HAIR} strokeWidth={1.2} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeOpacity={0.55} strokeWidth={1.6} strokeLinecap="round" pathLength={100} className="kf-pulse" />
    </>
  )
}

function Lane({
  g,
  y,
  cells,
  committed,
  isDlq,
  clipId,
  glow,
}: {
  g: Geo
  y: number
  cells: Cell[]
  committed: number
  isDlq?: boolean
  clipId: string
  glow: { color: string; k: number } | null
}) {
  const shown = cells.slice(-(g.visible + 1))
  const half = { w: g.cellW / 2, h: g.cellH / 2 }
  return (
    <>
      {/* the cell sliding off the old end fades out inside the track, never over the lane label */}
      <clipPath id={clipId}>
        <rect x={g.track[0]} y={y - half.h - 6} width={g.track[1] - g.track[0]} height={g.cellH + g.font.tiny + 16} />
      </clipPath>
      <rect
        x={g.track[0]}
        y={y - half.h - 4}
        width={g.track[1] - g.track[0]}
        height={g.cellH + 8}
        rx={10}
        fill={isDlq ? "rgba(239,68,68,0.05)" : SURFACE}
        stroke={glow ? glow.color : isDlq ? "rgba(239,68,68,0.3)" : HAIR}
        strokeOpacity={glow ? 0.35 + glow.k * 0.65 : 1}
        strokeWidth={glow ? 1 + glow.k : 1}
      />
      <g clipPath={`url(#${clipId})`}>
        {shown.map((c, i) => {
          const idx = g.visible - shown.length + i
          const done = isDlq || c.offset < committed
          const color = c.history ? MUTED : c.color
          return (
            <g
              key={c.offset}
              style={{
                transform: `translate(${slotX(g, idx)}px, ${y}px)`,
                opacity: idx < 0 ? 0 : 1,
                transition: "transform 460ms cubic-bezier(0.16,1,0.3,1), opacity 460ms ease",
              }}
            >
              <g className="kf-cell-in">
                <rect
                  x={-half.w}
                  y={-half.h}
                  width={g.cellW}
                  height={g.cellH}
                  rx={7}
                  fill={c.history ? LINE : c.color}
                  fillOpacity={c.history ? 0.3 : done ? 0.2 : 0.05}
                  stroke={c.history ? LINE : c.color}
                  strokeOpacity={c.history ? 1 : 0.85}
                  strokeDasharray={done ? undefined : "3 2"}
                  strokeWidth={1.1}
                />
                <text y={-2} textAnchor="middle" fontFamily={MONO} fontSize={g.font.cell} fontWeight={700} fill={color}>
                  {SHORT[c.type]}
                </text>
                <text y={g.font.cell + 1} textAnchor="middle" fontFamily={MONO} fontSize={g.font.tiny} fill={MUTED}>
                  {c.orderId.slice(4)}
                </text>
              </g>
              <text y={half.h + g.font.tiny + 3} textAnchor="middle" fontFamily={MONO} fontSize={g.font.tiny} fill={MUTED} opacity={0.75}>
                {c.offset}
              </text>
            </g>
          )
        })}
      </g>
    </>
  )
}

function Diagram({ sim, g, playing }: { sim: Sim; g: Geo; playing: boolean }) {
  const h = g.orient === "h"
  const sagaLive = sim.events.some((e) => e.producer < 0)
  const gf = sim.gateFlash
  const gateK = gf ? fade(sim, gf.at, 700) : 0
  const gatePt = gf ? (gf.src < 0 ? g.gateSaga : g.gatePt[gf.src]) : null
  const anaK = fade(sim, sim.analyticsFlash, 900)
  const latePct = sim.stats.delivered ? Math.round((sim.stats.late / sim.stats.delivered) * 100) : 0
  const laneGlow = (lane: number) => {
    const r = sim.ripples.filter((x) => x.lane === lane).at(-1)
    return r ? { color: r.color, k: fade(sim, r.at, RIPPLE_MS) } : null
  }
  const sagaPath = `M${g.sagaX},${g.laneY[2]} V${g.laneY[0]} C${g.sagaX},${g.sagaTopY} ${g.gateSaga.x},${g.sagaTopY} ${g.gateSaga.x},${g.gateSaga.y}`

  return (
    <svg
      viewBox={`0 0 ${g.w} ${g.h}`}
      className={`h-auto w-full select-none ${playing ? "" : "kf-paused"}`}
      role="img"
      aria-label="Animated Kafka pipeline: four supply-chain producers publish events through an Avro schema check into a three-partition topic keyed by order id, consumed by a fulfillment consumer group, with a dead-letter queue and a SAGA compensation path."
    >
      <defs>
        <linearGradient id={`kf-box-${g.orient}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7c3aed" stopOpacity="0.07" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0.015" />
        </linearGradient>
        <linearGradient id={`kf-gate-${g.orient}`} x1="0" x2={h ? 1 : 0} y1="0" y2={h ? 0 : 1}>
          <stop offset="0" stopColor="#7c3aed" stopOpacity="0.16" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* SAGA return arc */}
      <path d={sagaPath} fill="none" stroke={SAGA} strokeWidth={1.2} strokeDasharray="3 5" opacity={sagaLive ? 0.75 : 0.25} style={{ transition: "opacity 300ms" }} />
      {sagaLive && <path d={sagaPath} fill="none" stroke={SAGA} strokeWidth={2} strokeLinecap="round" pathLength={100} className="kf-pulse" />}
      {h && (
        <text x={(g.gateSaga.x + g.sagaX) / 2} y={32} textAnchor="middle" fontSize={10} fontWeight={600} fill={SAGA} opacity={sagaLive ? 1 : 0.55}>
          SAGA compensation
        </text>
      )}

      {/* column titles */}
      <text x={g.prodTitle.x} y={g.prodTitle.y} fontSize={g.font.sub} fontWeight={600} fill={MUTED}>
        Producers
      </text>
      <text x={g.consTitle.x} y={g.consTitle.y} fontSize={g.font.sub} fontWeight={600} fill={MUTED}>
        {h ? "Consumer group " : ""}
        <tspan fontFamily={MONO} fill={INK}>
          fulfillment-svc
        </tspan>
      </text>

      {/* producers */}
      {PRODUCERS.map((pr, i) => {
        const b = g.prod[i]
        const f = sim.producerFlash[i]
        const k = f ? fade(sim, f.at, 650) : 0
        const Icon = pr.icon
        return (
          <g key={pr.name}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={12} fill={SURFACE} stroke={k > 0 && f ? f.color : HAIR} strokeWidth={1 + k * 1.2} />
            {h ? (
              <>
                <rect x={b.x + 10} y={b.y + 9} width={30} height={30} rx={8} fill={k > 0 && f ? f.color : ACCENT} fillOpacity={0.1 + k * 0.15} />
                <Icon x={b.x + 17} y={b.y + 16} size={16} color={k > 0 && f ? f.color : ACCENT} strokeWidth={1.8} />
                <text x={b.x + 50} y={b.y + 21} fontFamily={MONO} fontSize={11.5} fontWeight={700} fill={INK}>
                  {pr.name}
                </text>
                <text x={b.x + 50} y={b.y + 36} fontSize={g.font.sub} fill={MUTED}>
                  {pr.sub}
                </text>
              </>
            ) : (
              <>
                <text x={b.x + b.w / 2} y={b.y + 19} textAnchor="middle" fontFamily={MONO} fontSize={g.font.name} fontWeight={700} fill={INK}>
                  {pr.name}
                </text>
                <text x={b.x + b.w / 2} y={b.y + 34} textAnchor="middle" fontSize={g.font.sub} fill={MUTED}>
                  {pr.sub}
                </text>
              </>
            )}
            <FlowLine
              x1={g.prodOut[i].x}
              y1={g.prodOut[i].y}
              x2={h ? g.gate.x : g.prodOut[i].x}
              y2={h ? g.prodOut[i].y : g.gate.y}
            />
          </g>
        )
      })}

      {/* Avro gate */}
      <rect x={g.gate.x} y={g.gate.y} width={g.gate.w} height={g.gate.h} rx={h ? 15 : 11} fill={`url(#kf-gate-${g.orient})`} stroke={ACCENT} strokeOpacity={0.35} />
      {h ? (
        <g>
          <ShieldCheck x={g.gate.x + g.gate.w / 2 - 8} y={g.gate.y + g.gate.h + 10} size={16} color={ACCENT} strokeWidth={1.8} />
          <text x={g.gate.x + g.gate.w / 2} y={g.gate.y + g.gate.h + 42} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={INK}>
            Avro schema
          </text>
          <text x={g.gate.x + g.gate.w / 2} y={g.gate.y + g.gate.h + 56} textAnchor="middle" fontSize={9.5} fill={MUTED}>
            registry, v3
          </text>
        </g>
      ) : (
        <g>
          <ShieldCheck x={g.gate.x + g.gate.w / 2 - 70} y={g.gate.y + 4} size={14} color={ACCENT} strokeWidth={1.8} />
          <text x={g.gate.x + g.gate.w / 2 - 50} y={g.gate.y + g.gate.h / 2} dominantBaseline="central" fontSize={8.5} fontWeight={700} fill={ACCENT}>
            Avro schema registry, v3
          </text>
        </g>
      )}
      {gateK > 0 && gatePt && gf && (
        <g transform={`translate(${gatePt.x}, ${gatePt.y})`} opacity={gateK}>
          <circle r={11 + (1 - gateK) * 12} fill="none" stroke={gf.ok ? GOOD : BAD} strokeWidth={1.4} />
          <circle r={9} fill={gf.ok ? GOOD : BAD} />
          {gf.ok ? <Check x={-6} y={-6} size={12} color="#fff" strokeWidth={3} /> : <X x={-6} y={-6} size={12} color="#fff" strokeWidth={3} />}
        </g>
      )}

      {/* Kafka topic */}
      <rect x={g.box.x} y={g.box.y} width={g.box.w} height={g.box.h} rx={16} fill={`url(#kf-box-${g.orient})`} stroke={LINE} />
      <Waypoints x={g.box.x + (h ? 16 : 10)} y={g.box.y + (h ? 12 : 9)} size={h ? 16 : 13} color={ACCENT} strokeWidth={1.8} />
      <text x={g.box.x + (h ? 40 : 29)} y={g.box.y + (h ? 25 : 20)} fontFamily={MONO} fontSize={h ? 12 : 10} fontWeight={700} fill={INK}>
        shipment-events
      </text>
      <text
        x={h ? g.box.x + g.box.w - 16 : g.box.x + 12}
        y={g.box.y + (h ? 25 : 35)}
        textAnchor={h ? "end" : "start"}
        fontSize={h ? 10.5 : 8.5}
        fill={MUTED}
      >
        topic, 3 partitions, keyed by orderId
      </text>

      {g.laneY.map((y, p) => (
        <g key={p}>
          <text x={g.labelX} y={y} dominantBaseline="central" textAnchor="middle" fontFamily={MONO} fontSize={g.font.name} fontWeight={700} fill={INK}>
            P{p}
          </text>
          <Lane g={g} y={y} cells={sim.lanes[p]} committed={sim.committed[p]} clipId={`kf-clip-${g.orient}-${p}`} glow={laneGlow(p)} />
          <FlowLine x1={g.track[1]} y1={y} x2={g.cons[p].x} y2={y} />
        </g>
      ))}

      {/* dead-letter topic */}
      <text x={g.labelX} y={g.dlqY} dominantBaseline="central" textAnchor="middle" fontFamily={MONO} fontSize={g.font.sub} fontWeight={700} fill={BAD}>
        DLQ
      </text>
      <Lane g={g} y={g.dlqY} cells={sim.dlq} committed={Infinity} isDlq clipId={`kf-clip-${g.orient}-dlq`} glow={laneGlow(-1)} />
      <text x={g.track[0]} y={g.dlqY + g.cellH / 2 + (h ? 22 : 20)} fontSize={g.font.tiny + 0.5} fill={BAD} opacity={0.85}>
        <tspan fontFamily={MONO}>shipment-events.dlq</tspan> parked for inspection and replay
      </text>

      {/* append ripples */}
      {sim.ripples.map((r) => {
        const k = fade(sim, r.at, RIPPLE_MS)
        const y = r.lane < 0 ? g.dlqY : g.laneY[r.lane]
        return (
          <rect
            key={r.id}
            x={slotX(g, g.visible - 1) - g.cellW / 2 - (1 - k) * 10}
            y={y - g.cellH / 2 - (1 - k) * 10}
            width={g.cellW + (1 - k) * 20}
            height={g.cellH + (1 - k) * 20}
            rx={9 + (1 - k) * 6}
            fill="none"
            stroke={r.color}
            strokeWidth={1.5}
            opacity={k * 0.8}
          />
        )
      })}

      {/* consumer group */}
      {g.cons.map((b, p) => {
        const st = consumerStatus(sim, p)
        const s = STATUS_STYLE[st]
        const lag = sim.logEnd[p] - sim.committed[p]
        const progress = st === "processing" ? Math.min(1, (sim.now - sim.consumer[p].at) / PROCESS_MS) : st === "idle" ? 0 : 1
        const Icon = s.icon
        const cy = b.y + b.h / 2
        return (
          <g key={p}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={12}
              fill={SURFACE}
              stroke={st === "idle" ? HAIR : s.color}
              strokeWidth={st === "idle" ? 1 : 1.4}
              style={{ transition: "stroke 200ms" }}
            />
            {h ? (
              <>
                <circle cx={b.x + 28} cy={cy} r={15} fill={s.color} fillOpacity={st === "idle" ? 0.06 : 0.12} />
                <circle cx={b.x + 28} cy={cy} r={15} fill="none" stroke={HAIR} strokeWidth={2} />
                {progress > 0 && (
                  <circle
                    cx={b.x + 28}
                    cy={cy}
                    r={15}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={`${progress} 1`}
                    transform={`rotate(-90 ${b.x + 28} ${cy})`}
                  />
                )}
                <Icon x={b.x + 21} y={cy - 7} size={14} color={s.color} strokeWidth={2.2} />
                <text x={b.x + 54} y={b.y + 19} fontFamily={MONO} fontSize={11.5} fontWeight={700} fill={INK}>
                  fulfillment-c{p}
                </text>
                <text x={b.x + 54} y={b.y + 33} fontSize={10.5} fontWeight={600} fill={s.color}>
                  {s.label}
                </text>
                <text x={b.x + 54} y={b.y + 47} fontFamily={MONO} fontSize={9.5} fill={MUTED}>
                  <tspan>P{p}</tspan>
                  <tspan dx={10}>next {sim.committed[p]}</tspan>
                  <tspan dx={10} fill={lag > 1 ? WARN : MUTED}>
                    lag {lag}
                  </tspan>
                </text>
              </>
            ) : (
              <>
                <text x={b.x + 34} y={b.y + 16} fontFamily={MONO} fontSize={9} fontWeight={700} fill={INK}>
                  c{p} on P{p}
                </text>
                <text x={b.x + 34} y={b.y + 31} fontSize={8} fontWeight={600} fill={s.color}>
                  {st === "crashed" ? "crashed" : st === "skipped" ? "dup skipped" : s.label}
                </text>
                <text x={b.x + 34} y={b.y + 46} fontFamily={MONO} fontSize={7.5} fill={MUTED}>
                  lag {lag}
                  <tspan dx={6}>{sim.committed[p]}</tspan>
                </text>
              </>
            )}
          </g>
        )
      })}

      {/* a second, independent consumer group */}
      <g>
        <rect
          x={g.analytics.x}
          y={g.analytics.y}
          width={g.analytics.w}
          height={g.analytics.h}
          rx={12}
          fill={SURFACE}
          stroke={anaK > 0 ? GOOD : HAIR}
          strokeDasharray="5 4"
          strokeWidth={1 + anaK}
        />
        <text x={g.analytics.x + 14} y={g.analytics.y + (h ? 21 : 18)} fontFamily={MONO} fontSize={h ? 11.5 : 9} fontWeight={700} fill={INK}>
          delivery-analytics
        </text>
        <text x={g.analytics.x + 14} y={g.analytics.y + (h ? 37 : 32)} fontSize={h ? 9.5 : 8} fill={MUTED}>
          {h ? "second group, reads every partition" : "a second consumer group reading every partition at its own offsets"}
        </text>
        <text x={g.analytics.x + 14} y={g.analytics.y + (h ? 56 : 46)} fontSize={h ? 10.5 : 8.5} fontWeight={600} fill={sim.stats.late ? WARN : MUTED}>
          late {sim.stats.late} of {sim.stats.delivered} delivered
          {sim.stats.delivered ? ` (${latePct}%)` : ""}
        </text>
      </g>

      {/* events in flight, each with a short comet trail while it moves */}
      {sim.events.map((ev) => {
        const pt = locate(ev, g, sim)
        const bad = ev.poison && ev.validated
        const color = bad ? BAD : ev.order.color
        const trail = pt.moving ? [28, 56, 84].map((lag) => locate(ev, g, sim, lag)) : []
        return (
          <g key={ev.id}>
            {trail.map((t, i) => (
              <circle key={i} cx={t.x} cy={t.y} r={(g.chipH / 2) * (0.8 - i * 0.2)} fill={color} opacity={0.3 - i * 0.09} />
            ))}
            <g transform={`translate(${pt.x},${pt.y})`}>
              <rect
                x={-g.chipW / 2}
                y={-g.chipH / 2}
                width={g.chipW}
                height={g.chipH}
                rx={g.chipH / 2}
                fill={color}
                stroke={ev.producer < 0 ? SAGA : "none"}
                strokeWidth={2}
                style={{ filter: `drop-shadow(0 1px 2px ${color}59)` }}
              />
              <text textAnchor="middle" dominantBaseline="central" fontFamily={MONO} fontSize={h ? 8.5 : 7.5} fontWeight={800} fill="#fff">
                {SHORT[ev.type]}
              </text>
            </g>
          </g>
        )
      })}
    </svg>
  )
}

/* ── side panels ─────────────────────────────────────────────────────────── */

const TONE_TEXT: Record<Tone, string> = {
  info: "text-sky-700 dark:text-sky-400",
  ok: "text-emerald-700 dark:text-emerald-400",
  bad: "text-red-600 dark:text-red-400",
  warn: "text-amber-700 dark:text-amber-400",
  saga: "text-purple-700 dark:text-purple-400",
}
const TONE_DOT: Record<Tone, string> = { info: "#0ea5e9", ok: GOOD, bad: BAD, warn: WARN, saga: SAGA }

const ConsumerLog = memo(function ConsumerLog({ sim }: { sim: Sim; version: number }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-slate-200 px-4 py-2.5 font-mono text-[11px] text-slate-500 dark:border-zinc-800 dark:text-zinc-500">
        $ kafka-console-consumer --topic shipment-events
      </div>
      <div className="min-h-[196px] flex-1 space-y-1 px-4 py-3 font-mono text-[11px] leading-relaxed">
        {sim.feed.length === 0 && <p className="text-slate-400 dark:text-zinc-600">waiting for the first event</p>}
        <AnimatePresence initial={false}>
          {sim.feed.map((l) => (
            <motion.div
              key={l.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-2 whitespace-nowrap"
            >
              <span className="shrink-0 tabular-nums text-slate-400 dark:text-zinc-600">{(l.t / 1000).toFixed(1)}s</span>
              <span className={`w-[84px] shrink-0 font-semibold ${TONE_TEXT[l.tone]}`}>{l.tag}</span>
              <span className="truncate text-slate-700 dark:text-zinc-300">{l.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
})

function JsonValue({ v }: { v: unknown }) {
  if (typeof v === "string") return <span className="text-emerald-700 dark:text-emerald-400">&quot;{v}&quot;</span>
  if (typeof v === "boolean") return <span className="text-pink-600 dark:text-pink-400">{String(v)}</span>
  return <span className="text-amber-700 dark:text-amber-400">{String(v)}</span>
}

function jsonLines(obj: Record<string, unknown>, depth: number, path: string): ReactNode[] {
  const pad = "  ".repeat(depth)
  const entries = Object.entries(obj)
  return entries.flatMap(([k, v], i) => {
    const comma = i < entries.length - 1 ? "," : ""
    const key = <span className="text-violet-700 dark:text-violet-400">&quot;{k}&quot;</span>
    if (v && typeof v === "object") {
      return [
        <div key={`${path}.${k}`}>
          {pad}
          {key}: {"{"}
        </div>,
        ...jsonLines(v as Record<string, unknown>, depth + 1, `${path}.${k}`),
        <div key={`${path}.${k}~`}>
          {pad}
          {"}"}
          {comma}
        </div>,
      ]
    }
    return [
      <div key={`${path}.${k}`}>
        {pad}
        {key}: <JsonValue v={v} />
        {comma}
      </div>,
    ]
  })
}

const EventInspector = memo(function EventInspector({ sim }: { sim: Sim; version: number }) {
  const latest = sim.latest
  const ev = latest?.ev
  const record = ev
    ? {
        schema: "shipment_event.avsc v3",
        eventId: `e-${ev.id}`,
        key: ev.order.id,
        type: ev.type,
        source: sourceOf(ev),
        ...(latest?.error ? {} : { partition: ev.partition, offset: ev.offset }),
        payload: ev.payload,
      }
    : null
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-card dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 text-[11px] text-slate-500 dark:border-zinc-800 dark:text-zinc-500">
        <span>Latest record, as Avro JSON</span>
        {ev && (
          <span className="flex items-center gap-1.5 font-mono">
            <span className="h-2 w-2 rounded-full" style={{ background: latest?.error ? BAD : ev.order.color }} aria-hidden />
            {ev.order.id}
          </span>
        )}
      </div>
      {latest?.error && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-[12px] text-red-700 dark:text-red-400">
          Rejected by the schema registry: {latest.error}. Sent to the DLQ.
        </div>
      )}
      <pre className="min-h-[196px] flex-1 overflow-x-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-zinc-300">
        {record ? (
          <>
            <div>{"{"}</div>
            {jsonLines(record, 1, "r")}
            <div>{"}"}</div>
          </>
        ) : (
          <span className="text-slate-400">no records yet</span>
        )}
      </pre>
    </div>
  )
})

type Project = (typeof KAFKA_PROFILE.projects)[number]

function ProjectBlock({ p, featured, wide, index }: { p: Project; featured?: boolean; wide?: boolean; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-shadow duration-300 hover:shadow-[0_12px_32px_-18px_rgba(76,29,149,0.35)] ${
        featured
          ? "border-violet-200 bg-violet-50/70 dark:border-violet-900/60 dark:bg-violet-950/20 lg:col-span-7"
          : wide
            ? "border-slate-200 bg-card dark:border-zinc-800 lg:col-span-12"
            : "border-slate-200 bg-card dark:border-zinc-800 lg:col-span-5"
      }`}
    >
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h4 className={`font-semibold tracking-tight text-slate-900 dark:text-white ${featured ? "text-xl" : "text-base"}`}>{p.name}</h4>
        <span className="shrink-0 font-mono text-[11px] text-slate-500 dark:text-zinc-500">{p.period}</span>
      </div>
      <p className="mb-4 text-[13px] text-violet-700 dark:text-violet-400">{p.role}</p>

      {p.metrics.length > 0 && (
        <dl className="mb-4 grid grid-cols-2 gap-4">
          {p.metrics.map((m) => (
            <div key={m.label} className="flex flex-col-reverse justify-end">
              <dt className="text-[12px] leading-snug text-slate-500 dark:text-slate-400">{m.label}</dt>
              <dd className={`font-bold tabular-nums tracking-tight text-slate-900 dark:text-white ${featured ? "text-4xl" : "text-2xl"}`}>{m.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className={wide ? "grid gap-2 lg:grid-cols-2 lg:gap-8" : "space-y-2"}>
        {p.points.map((pt) => (
          <p key={pt} className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
            {pt}
          </p>
        ))}
      </div>

      <p className="mt-auto pt-5 font-mono text-[11px] text-slate-500 dark:text-zinc-500">{p.stack.join("  /  ")}</p>
    </motion.article>
  )
}

const ProjectBento = memo(function ProjectBento() {
  const [featured, ...rest] = KAFKA_PROFILE.projects
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <ProjectBlock p={featured} featured index={0} />
      {rest.map((p, i) => (
        <ProjectBlock key={p.id} p={p} wide={i === rest.length - 1 && rest.length % 2 === 0} index={i + 1} />
      ))}
    </div>
  )
})

/* ── section ─────────────────────────────────────────────────────────────── */

function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-[11px] text-slate-500 dark:text-zinc-500">{label}</dt>
      <dd className={`font-mono text-base font-semibold tabular-nums ${tone ?? "text-slate-900 dark:text-white"}`}>{value}</dd>
    </div>
  )
}

export default function KafkaFlow() {
  const sectionRef = useRef<HTMLElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { amount: "some" })
  const simRef = useRef<Sim | null>(null)
  if (!simRef.current) simRef.current = createSim()
  const sim = simRef.current

  const [, setFrame] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [wide, setWide] = useState(true)

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setPlaying(false)
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => setWide(el.getBoundingClientRect().width >= 820)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !inView) return
    let raf = 0
    let last = performance.now()
    const loop = (t: number) => {
      const dt = Math.min(100, t - last)
      last = t
      if (!document.hidden) {
        advance(sim, dt)
        setFrame((n) => (n + 1) % 1_000_000)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, inView, sim])

  const trigger = useCallback(
    (key: keyof Sim["pending"]) => {
      sim.pending[key] = true
      sim.version++
      setPlaying(true)
      setFrame((n) => n + 1)
    },
    [sim],
  )

  const explain = (title: string, detail: string) => {
    narrate(sim, `${title}: ${detail}`, "info")
    sim.version++
    setFrame((n) => n + 1)
  }

  const g = wide ? H_GEO : V_GEO
  const lag = sim.logEnd.reduce((s, end, p) => s + end - sim.committed[p], 0)
  const n = sim.narration

  const controls: { key: keyof Sim["pending"]; label: string; icon: ReactNode; hint: string }[] = [
    { key: "poison", label: "Send a malformed event", icon: <TriangleAlert className="h-3.5 w-3.5" />, hint: "fails the schema check and lands on the DLQ" },
    { key: "crash", label: "Crash a consumer", icon: <Zap className="h-3.5 w-3.5" />, hint: "redelivery, then the idempotent consumer skips it" },
    { key: "cancel", label: "Cancel a carrier", icon: <Undo2 className="h-3.5 w-3.5" />, hint: "SAGA publishes a compensating event" },
  ]

  return (
    <section id="kafka" ref={sectionRef} className="relative py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
            Kafka, <span className="text-violet-600 dark:text-violet-400">in motion</span>
          </h2>
          <p className="mx-auto max-w-[60ch] text-slate-500 dark:text-slate-400">
            A live simulation of the event-streaming patterns behind my Global Freight platform, told through one shipment&apos;s journey from
            order to doorstep.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-[0_24px_60px_-40px_rgba(76,29,149,0.35)] dark:border-zinc-800"
        >
          <div className="flex items-start gap-3 border-b border-slate-200 bg-violet-500/[0.035] px-4 py-3 dark:border-zinc-800">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors" style={{ background: TONE_DOT[n.tone] }} aria-hidden />
            <div className="min-h-[44px] flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={n.id}
                  initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 sm:text-sm"
                >
                  {n.text}
                </motion.p>
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-background px-3 py-1 text-xs font-medium text-slate-700 transition-[transform,colors] hover:border-violet-400 hover:text-violet-700 active:scale-[0.97] dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-violet-300"
              aria-pressed={!playing}
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? "Pause" : "Play"}
            </button>
          </div>

          <div ref={wrapRef} className="px-2 py-3 sm:px-4">
            <Diagram sim={sim} g={g} playing={playing} />
          </div>

          {/* live legend: each pattern lights up when the simulation exercises it */}
          <div className="flex flex-wrap gap-2 border-t border-slate-200 px-4 py-3 dark:border-zinc-800">
            {KAFKA_PROFILE.patterns.map((pt) => {
              const at = sim.pulses[pt.id]
              const active = at !== undefined && sim.now - at < 1100
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => explain(pt.title, pt.detail)}
                  title={pt.detail}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors duration-300 ${
                    active
                      ? "border-violet-400 bg-violet-500/10 text-violet-800 dark:border-violet-500 dark:text-violet-200"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  {pt.title}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 dark:border-zinc-800 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {controls.map((c) => {
                const queued = sim.pending[c.key]
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => trigger(c.key)}
                    disabled={queued}
                    title={c.hint}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-background px-3.5 py-1.5 text-xs font-medium text-slate-800 transition-[transform,colors] hover:-translate-y-px hover:border-violet-400 hover:text-violet-700 active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-violet-300"
                  >
                    {queued ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : c.icon}
                    {queued ? "Queued" : c.label}
                  </button>
                )
              })}
            </div>
            <dl className="grid grid-cols-3 gap-x-6 gap-y-2 sm:grid-cols-6">
              <Stat label="produced" value={sim.stats.produced} />
              <Stat label="processed" value={sim.stats.processed} />
              <Stat label="lag" value={lag} tone={lag > 2 ? "text-amber-600 dark:text-amber-400" : undefined} />
              <Stat label="dead-lettered" value={sim.stats.dlq} tone={sim.stats.dlq ? "text-red-600 dark:text-red-400" : undefined} />
              <Stat label="deduped" value={sim.stats.skipped} />
              <Stat label="compensated" value={sim.stats.compensations} />
            </dl>
          </div>
        </motion.div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ConsumerLog sim={sim} version={sim.feedSeq} />
          </div>
          <div className="lg:col-span-2">
            <EventInspector sim={sim} version={sim.latest ? sim.latest.ev.id * 10 + (sim.latest.error ? 1 : 0) : 0} />
          </div>
        </div>

        <h3 className="mb-5 mt-16 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Built in my projects</h3>
        <ProjectBento />

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-zinc-500">
          The simulation is illustrative. First Class orders run late most often, as DelayLens found in the DataCo supply-chain data.
        </p>
      </div>
    </section>
  )
}
