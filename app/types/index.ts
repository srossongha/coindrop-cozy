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

export interface UserIdentity {
  id: string
  name: string
  emoji: string
  color?: string
}

export type Identity = UserIdentity

export interface UserProfile extends UserIdentity {
  isMe?: boolean
  isOnline?: boolean
  coinsSpent?: number
}

export type LobbyPhase = 'ideas' | 'voting' | 'finished'
export type CoinType = 'gold' | 'red'

export interface UserVote {
  gold: number
  red: number
}

export interface CardIdea {
  id: string
  title: string
  category: string
  description?: string
  priceNote?: string
  link?: string
  authorId: string
  authorName: string
  authorEmoji: string
  createdAt: number
  votes: Record<string, UserVote>
}

export interface EnrichedCardIdea extends CardIdea {
  totalGold: number
  totalRed: number
  totalScore: number
  isLeader: boolean
  myGold: number
  myRed: number
}

export interface LobbyRoom {
  id: string
  title: string
  creatorId: string
  creatorName: string
  creatorEmoji: string
  createdAt: number
  phase: LobbyPhase
  winnerCardId: string | null
  ideas: CardIdea[]
  participants: UserIdentity[]
}

export interface LobbyWsMessage {
  type:
    | 'JOIN_LOBBY'
    | 'USER_JOINED'
    | 'ADD_IDEA'
    | 'UPDATE_IDEA'
    | 'DELETE_IDEA'
    | 'DROP_COIN'
    | 'REMOVE_COIN'
    | 'CHANGE_PHASE'
    | 'RESET_VOTES'
    | 'SYNC_ROOM'
  roomId: string
  payload?: unknown
  senderId?: string
  timestamp?: number
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
