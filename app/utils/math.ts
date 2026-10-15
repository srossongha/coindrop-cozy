export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export const COIN_COLORS = [
  '#f59e0b', // Amber Gold
  '#eab308', // Bright Yellow Gold
  '#f97316', // Bronze / Copper
  '#38bdf8', // Diamond / Platinum Cyan
]
