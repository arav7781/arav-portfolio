/* Small motion helpers shared by the lifter and the film. */

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
/** eased 0..1 progress of t through [a, b] */
export const seg = (t: number, a: number, b: number) => easeInOut(clamp01((t - a) / (b - a)))

/**
 * A smooth curve through keys [x, y], monotone between them (Fritsch-Carlson), so a channel
 * eases in and out of every key without overshooting it. Used for every keyframed channel.
 */
export function curve(keys: [number, number][]) {
  const n = keys.length
  const xs = keys.map((k) => k[0]), ys = keys.map((k) => k[1])
  const d: number[] = [], m: number[] = []
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i])
  m[0] = d[0]
  m[n - 1] = d[n - 2]
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0
      continue
    }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b
    if (s > 9) {
      const k = 3 / Math.sqrt(s)
      m[i] = k * a * d[i]
      m[i + 1] = k * b * d[i]
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let i = 0
    while (x > xs[i + 1]) i++
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
  }
}

export interface Spring { v: number; t: number; vel: number; k: number; c: number }
export const spring = (v: number, k: number, c: number): Spring => ({ v, t: v, vel: 0, k, c })
export const stepSpring = (sp: Spring, h: number) => {
  sp.vel += (-sp.k * (sp.v - sp.t) - sp.c * sp.vel) * h
  sp.v += sp.vel * h
}

export function seeded(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}
