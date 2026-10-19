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

export interface SceneConfig {
  cameraPosition: [number, number, number]
  cameraFov: number
  ambientIntensity: number
  directionalPosition: [number, number, number]
  directionalIntensity: number
  enableControls: boolean
}

export interface GameStats {
  coinsDropped: number
  totalScore: number
}

export interface PollOption {
  id: string
  label: string
  color: string
  coinsCount: number
}

export interface PollData {
  id: string
  title: string
  description?: string
  options: PollOption[]
  coinsPerUser: number
  code: string
  createdAt: number
}

export interface LobbyData {
  id: string
  name: string
  mode: 'poll' | 'target-drop' | 'free-play'
  maxPlayers: number
  isPrivate: boolean
  code: string
  createdAt: number
}
