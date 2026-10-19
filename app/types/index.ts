export interface CoinItem {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  velocity: [number, number, number]
  rotationSpeed: [number, number, number]
  value: number
  color: string
  settled: boolean
}

export interface UserProfile {
  id: string
  name: string
  emoji: string
  color: string
  isMe?: boolean
  isOnline?: boolean
  coinsSpent?: number
}

export interface BoardOption {
  id: string
  title: string
  category: string
  priceNote: string
  link?: string
  createdBy: string
  createdAt: number
  votes: Record<string, number>
}

export interface EnrichedOption extends BoardOption {
  totalCoins: number
  isLeader: boolean
}

export interface Expense {
  id: string
  title: string
  amount: number
  paidBy: string
  splitAmong: string[]
}

export interface DebtTransfer {
  key: string
  from: UserProfile
  to: UserProfile
  amount: number
}

export interface DecisionRoom {
  id: string
  title: string
  createdAt: number
  expiresInSeconds: number
  lockedWinnerId: string | null
  options: BoardOption[]
  expenses: Expense[]
}

export interface LiveFeedItem {
  id: string | number
  text: string
  time: string
}

export interface FloatingReaction {
  id: string | number
  emoji: string
  authorName: string
  leftOffset: number
}
