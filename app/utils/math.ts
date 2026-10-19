export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export const COIN_COLORS = [
  '#f5c242', // Signature Coin Gold
  '#f5c242', // Signature Coin Gold (weighted higher)
  '#74b9ff', // Pastel Sky
  '#d0ebff', // Soft Highlight
]
