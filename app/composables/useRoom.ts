import type { PollData, LobbyData, PollOption } from '~/types'

export function useRoom() {
  const currentMode = useState<'home' | 'poll' | 'lobby' | 'sandbox'>('coindrop-mode', () => 'home')
  const activePoll = useState<PollData | null>('coindrop-active-poll', () => null)
  const activeLobby = useState<LobbyData | null>('coindrop-active-lobby', () => null)

  function generateCode(prefix = 'DROP'): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `${prefix}-${result}`
  }

  function createPoll(params: { title: string; options: string[]; coinsPerUser: number }) {
    const defaultColors = ['#f59e0b', '#38bdf8', '#a855f7', '#ec4899', '#10b981', '#f97316']
    const pollOptions: PollOption[] = params.options.map((opt, idx) => ({
      id: `opt-${idx + 1}`,
      label: opt.trim() || `Option ${idx + 1}`,
      color: defaultColors[idx % defaultColors.length] ?? '#f59e0b',
      coinsCount: 0,
    }))

    const poll: PollData = {
      id: `poll-${Date.now()}`,
      title: params.title.trim() || 'Untitled Poll',
      options: pollOptions,
      coinsPerUser: params.coinsPerUser || 3,
      code: generateCode('POLL'),
      createdAt: Date.now(),
    }

    activePoll.value = poll
    activeLobby.value = null
    currentMode.value = 'poll'
    return poll
  }

  function createLobby(params: {
    name: string
    mode: 'poll' | 'target-drop' | 'free-play'
    maxPlayers: number
    isPrivate: boolean
  }) {
    const lobby: LobbyData = {
      id: `lobby-${Date.now()}`,
      name: params.name.trim() || 'Coin Drop Room',
      mode: params.mode || 'target-drop',
      maxPlayers: params.maxPlayers || 8,
      isPrivate: params.isPrivate ?? false,
      code: generateCode('LOBBY'),
      createdAt: Date.now(),
    }

    activeLobby.value = lobby
    activePoll.value = null
    currentMode.value = 'lobby'
    return lobby
  }

  function returnToHome() {
    currentMode.value = 'home'
    activePoll.value = null
    activeLobby.value = null
  }

  function enterSandbox() {
    currentMode.value = 'sandbox'
  }

  return {
    currentMode,
    activePoll,
    activeLobby,
    createPoll,
    createLobby,
    returnToHome,
    enterSandbox,
  }
}
