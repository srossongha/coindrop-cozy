import type {
  CardIdea,
  CoinType,
  EnrichedCardIdea,
  Identity,
  LobbyPhase,
  LobbyRoom,
  LobbyWsMessage,
  UserIdentity,
} from '~/types'
import { LOBBY_TTL_MS } from '~/composables/useSupabase'

const MAX_GOLD_COINS = 5
const MAX_RED_COINS = 2

// Web Audio sound synthesizer for coin clink / drop
function playCoinSound(type: CoinType) {
  if (!import.meta.client) return
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // Gold is bright chime (1200Hz -> 1800Hz), Red is warm resonant chime (650Hz -> 900Hz)
    const baseFreq = type === 'gold' ? 1350 : 750
    osc.frequency.setValueAtTime(baseFreq, now)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.23)

    // Optional subtle second harmonic bounce
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'triangle'
        osc2.frequency.setValueAtTime(baseFreq * 1.2, ctx.currentTime)
        gain2.gain.setValueAtTime(0.12, ctx.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start()
        osc2.stop(ctx.currentTime + 0.13)
      } catch {
        /* ignore */
      }
    }, 45)
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export function useLobby() {
  const currentRoom = useState<LobbyRoom | null>('lobby_current_room', () => null)
  const isConnected = useState<boolean>('lobby_ws_connected', () => false)
  const recentRooms = useState<Array<{ id: string; title: string; createdAt: number }>>(
    'lobby_recent',
    () => [],
  )

  // Track active coin drop animation trigger: { cardId, coinType, timestamp }
  const activeDrop = useState<{ cardId: string; coinType: CoinType; key: number } | null>(
    'lobby_active_drop',
    () => null,
  )

  // Supabase real-time database client
  const supabase = useSupabase()

  let broadcastChannel: BroadcastChannel | null = null

  // Setup Supabase Realtime synchronization
  function setupSupabaseRealtime(roomId: string, user: Identity) {
    if (!supabase.isConfigured.value) return

    supabase.subscribeToLobby(roomId, user, {
      onConnected() {
        isConnected.value = true
        console.log('[useLobby] Realtime WebSockets connected and live for lobby:', roomId)
      },
      onDisconnected() {
        isConnected.value = false
        console.warn('[useLobby] Realtime WebSockets disconnected for lobby:', roomId)
      },
      onLobbyMessage(msg) {
        handleIncomingMessage(msg)
      },
      onPresenceSync(users) {
        if (!currentRoom.value || currentRoom.value.id !== roomId) return
        for (const u of users) {
          if (!currentRoom.value.participants.some(p => p.id === u.id)) {
            currentRoom.value.participants.push(u)
          }
        }
        persistRoom(currentRoom.value)
      },
      onLobbyChange(lobby) {
        if (!currentRoom.value || currentRoom.value.id !== roomId) return
        if (lobby.phase) {
          currentRoom.value.phase = lobby.phase as LobbyPhase
        }
        if (lobby.winner_card_id !== undefined) {
          currentRoom.value.winnerCardId = (lobby.winner_card_id as string) || null
        }
        persistRoom(currentRoom.value)
      },
      onIdeaChange(eventType, idea) {
        if (!currentRoom.value || currentRoom.value.id !== roomId) return
        const ideaId = (idea.id as string) || ''
        if (eventType === 'INSERT') {
          if (!currentRoom.value.ideas.some(i => i.id === ideaId)) {
            currentRoom.value.ideas.push({
              id: ideaId,
              title: (idea.title as string) || '',
              category: (idea.category as string) || 'General',
              description: (idea.description as string) || undefined,
              priceNote: (idea.price_note as string) || undefined,
              link: (idea.link as string) || undefined,
              authorId: (idea.author_id as string) || '',
              authorName: (idea.author_name as string) || '',
              authorEmoji: (idea.author_emoji as string) || '🦫',
              createdAt: new Date((idea.created_at as string) || Date.now()).getTime(),
              votes: {},
            })
            persistRoom(currentRoom.value)
          }
        } else if (eventType === 'UPDATE') {
          const idx = currentRoom.value.ideas.findIndex(i => i.id === ideaId)
          if (idx !== -1) {
            currentRoom.value.ideas[idx].title =
              (idea.title as string) || currentRoom.value.ideas[idx].title
            currentRoom.value.ideas[idx].category =
              (idea.category as string) || currentRoom.value.ideas[idx].category
            currentRoom.value.ideas[idx].description = (idea.description as string) || undefined
            currentRoom.value.ideas[idx].priceNote = (idea.price_note as string) || undefined
            currentRoom.value.ideas[idx].link = (idea.link as string) || undefined
            persistRoom(currentRoom.value)
          }
        } else if (eventType === 'DELETE') {
          currentRoom.value.ideas = currentRoom.value.ideas.filter(i => i.id !== ideaId)
          persistRoom(currentRoom.value)
        }
      },
      onVoteChange(vote) {
        if (!currentRoom.value || currentRoom.value.id !== roomId) return
        const cardId = (vote.card_id as string) || ''
        const userId = (vote.user_id as string) || ''
        const gold = (vote.gold_coins as number) || 0
        const red = (vote.red_coins as number) || 0

        const card = currentRoom.value.ideas.find(i => i.id === cardId)
        if (card) {
          card.votes[userId] = { gold, red }
          persistRoom(currentRoom.value)
        }
      },
      onDropBroadcast(data) {
        if (data && data.cardId && data.coinType) {
          activeDrop.value = { cardId: data.cardId, coinType: data.coinType, key: Date.now() }
          playCoinSound(data.coinType)
        }
      },
      onLobbyDeleted() {
        leaveLobby()
      },
    })
  }

  // Load recent lobbies from localStorage
  function loadRecentRooms() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem('coindrop:recent_lobbies')
      if (raw) {
        recentRooms.value = JSON.parse(raw)
      }
    } catch {
      /* ignore */
    }
  }

  function saveRecentRoom(room: LobbyRoom) {
    if (!import.meta.client) return
    try {
      const existing = recentRooms.value.filter(r => r.id !== room.id)
      const updated = [
        { id: room.id, title: room.title, createdAt: room.createdAt },
        ...existing,
      ].slice(0, 6)
      recentRooms.value = updated
      localStorage.setItem('coindrop:recent_lobbies', JSON.stringify(updated))
    } catch {
      /* ignore */
    }
  }

  // Connect to BroadcastChannel for local same-browser cross-tab sync
  function connectSocket(roomId: string) {
    if (!import.meta.client) return

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        if (broadcastChannel) broadcastChannel.close()
        broadcastChannel = new BroadcastChannel(`coindrop:lobby:${roomId}`)
        broadcastChannel.onmessage = event => {
          handleIncomingMessage(event.data)
        }
      } catch (e) {
        console.warn('[useLobby] BroadcastChannel error:', e)
      }
    }
  }

  function sendWsMessage(msg: LobbyWsMessage) {
    // 1. Broadcast globally via Supabase Realtime WebSockets to all devices & players
    if (supabase.isConfigured.value) {
      supabase.broadcastLobbyMessage(msg)
    }

    // 2. Broadcast across tabs in the same browser via BroadcastChannel
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(msg)
      } catch {
        /* ignore */
      }
    }
  }

  function handleIncomingMessage(msg: LobbyWsMessage) {
    if (!msg || !currentRoom.value || msg.roomId !== currentRoom.value.id) return

    const payload = (msg.payload || {}) as {
      user?: UserIdentity
      idea?: CardIdea
      ideaId?: string
      cardId?: string
      coinType?: CoinType
      userId?: string
      phase?: LobbyPhase
      room?: LobbyRoom
    }

    switch (msg.type) {
      case 'SYNC_ROOM': {
        if (msg.payload) {
          currentRoom.value = { ...(msg.payload as LobbyRoom) }
          persistRoom(currentRoom.value)
        }
        break
      }

      case 'USER_JOINED': {
        const user = payload.user
        if (user) {
          const idx = currentRoom.value.participants.findIndex(p => p.id === user.id)
          if (idx !== -1) {
            currentRoom.value.participants[idx].name = user.name
            currentRoom.value.participants[idx].emoji = user.emoji
          } else {
            currentRoom.value.participants.push(user)
          }
          if (currentRoom.value.creatorId === user.id) {
            currentRoom.value.creatorName = user.name
            currentRoom.value.creatorEmoji = user.emoji
          }
          persistRoom(currentRoom.value)
        }
        break
      }

      case 'ADD_IDEA': {
        const idea = payload.idea
        if (idea && !currentRoom.value.ideas.some(i => i.id === idea.id)) {
          currentRoom.value.ideas.push(idea)
          persistRoom(currentRoom.value)
        }
        break
      }

      case 'UPDATE_IDEA': {
        const idea = payload.idea
        if (idea) {
          const idx = currentRoom.value.ideas.findIndex(i => i.id === idea.id)
          if (idx !== -1) {
            currentRoom.value.ideas[idx] = idea
            persistRoom(currentRoom.value)
          }
        }
        break
      }

      case 'DELETE_IDEA': {
        const ideaId = payload.ideaId
        if (ideaId) {
          currentRoom.value.ideas = currentRoom.value.ideas.filter(i => i.id !== ideaId)
          persistRoom(currentRoom.value)
        }
        break
      }

      case 'DROP_COIN': {
        const { cardId, coinType, userId } = payload
        if (cardId && coinType && userId) {
          const idea = currentRoom.value.ideas.find(i => i.id === cardId)
          if (idea) {
            if (!idea.votes[userId]) {
              idea.votes[userId] = { gold: 0, red: 0 }
            }
            if (coinType === 'gold') idea.votes[userId].gold++
            else if (coinType === 'red') idea.votes[userId].red++

            // Trigger animation for this card
            activeDrop.value = { cardId, coinType, key: Date.now() }
            playCoinSound(coinType)
            persistRoom(currentRoom.value)
          }
        }
        break
      }

      case 'REMOVE_COIN': {
        const { cardId, coinType, userId } = payload
        if (cardId && coinType && userId) {
          const idea = currentRoom.value.ideas.find(i => i.id === cardId)
          if (idea && idea.votes[userId]) {
            if (coinType === 'gold' && idea.votes[userId].gold > 0) idea.votes[userId].gold--
            else if (coinType === 'red' && idea.votes[userId].red > 0) idea.votes[userId].red--
            persistRoom(currentRoom.value)
          }
        }
        break
      }

      case 'CHANGE_PHASE': {
        const newPhase = payload.phase
        if (newPhase) {
          currentRoom.value.phase = newPhase
          if (newPhase === 'finished') {
            // Determine winner
            let topScore = 0
            let topId: string | null = null
            for (const item of currentRoom.value.ideas) {
              let score = 0
              for (const v of Object.values(item.votes)) {
                score += (v.gold || 0) * 1 + (v.red || 0) * 2
              }
              if (score > topScore) {
                topScore = score
                topId = item.id
              }
            }
            currentRoom.value.winnerCardId =
              topScore > 0
                ? topId
                : currentRoom.value.ideas.length === 1
                  ? currentRoom.value.ideas[0].id
                  : null
          }
          persistRoom(currentRoom.value)
        }
        break
      }

      case 'RESET_VOTES': {
        for (const item of currentRoom.value.ideas) {
          item.votes = {}
        }
        currentRoom.value.winnerCardId = null
        persistRoom(currentRoom.value)
        break
      }

      case 'LOBBY_DELETED': {
        leaveLobby()
        break
      }
    }
  }

  function persistRoom(room: LobbyRoom) {
    if (!import.meta.client) return
    try {
      localStorage.setItem(`coindrop:room:${room.id}`, JSON.stringify(room))
    } catch {
      /* ignore */
    }
  }

  // Create a new lobby room
  async function createLobby(title: string, user: Identity): Promise<LobbyRoom> {
    const randomCode = Math.floor(1000 + Math.random() * 9000)
    const roomId = `DROP-${randomCode}`
    const createdAt = Date.now()

    const newRoom: LobbyRoom = {
      id: roomId,
      title: title.trim() || 'Cozy Group Decision 🍲',
      creatorId: user.id,
      creatorName: user.name,
      creatorEmoji: user.emoji,
      createdAt,
      expiresAt: createdAt + LOBBY_TTL_MS,
      phase: 'ideas',
      winnerCardId: null,
      ideas: [],
      participants: [{ id: user.id, name: user.name, emoji: user.emoji }],
    }

    currentRoom.value = newRoom
    persistRoom(newRoom)
    saveRecentRoom(newRoom)
    connectSocket(roomId)

    if (supabase.isConfigured.value) {
      await supabase.saveLobby(newRoom)
      setupSupabaseRealtime(roomId, user)
      supabase.cleanupExpiredLobbies()
    }

    // Announce sync to server
    sendWsMessage({
      type: 'SYNC_ROOM',
      roomId,
      payload: newRoom,
    })

    return newRoom
  }

  // Join an existing lobby room
  async function joinLobby(
    roomId: string,
    user: Identity,
  ): Promise<{ success: boolean; reason?: 'not_found' | 'expired' }> {
    const cleanId = roomId.trim().toUpperCase()

    // 1. Fetch from Supabase
    if (supabase.isConfigured.value) {
      const remoteRoom = await supabase.fetchRoom(cleanId)
      if (remoteRoom) {
        if (!remoteRoom.participants.some(p => p.id === user.id)) {
          remoteRoom.participants.push({ id: user.id, name: user.name, emoji: user.emoji })
        }
        currentRoom.value = remoteRoom
        persistRoom(remoteRoom)
        saveRecentRoom(remoteRoom)
        connectSocket(cleanId)
        setupSupabaseRealtime(cleanId, user)
        sendWsMessage({
          type: 'USER_JOINED',
          roomId: cleanId,
          payload: { user },
        })
        return { success: true }
      }
    }

    // 2. Check local storage if previously opened
    let foundRoom: LobbyRoom | null = null
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem(`coindrop:room:${cleanId}`)
        if (raw) {
          foundRoom = JSON.parse(raw)
        }
      } catch {
        /* ignore */
      }
    }

    if (foundRoom) {
      if (!foundRoom.participants.some(p => p.id === user.id)) {
        foundRoom.participants.push({ id: user.id, name: user.name, emoji: user.emoji })
      }
      currentRoom.value = foundRoom
      persistRoom(foundRoom)
      saveRecentRoom(foundRoom)
      connectSocket(cleanId)
      return { success: true }
    }

    return { success: false, reason: 'not_found' }
  }

  // Permanently end lobby and clear data from database
  async function endLobbyAndClearData() {
    if (!currentRoom.value) return
    const roomId = currentRoom.value.id

    // Broadcast to peers before wiping
    sendWsMessage({
      type: 'LOBBY_DELETED',
      roomId,
      payload: {},
    })

    // Permanently wipe from Supabase
    if (supabase.isConfigured.value) {
      await supabase.deleteRoom(roomId)
    }

    // Clean up local storage
    if (import.meta.client) {
      try {
        localStorage.removeItem(`coindrop:room:${roomId}`)
        const raw = localStorage.getItem('coindrop:recent_lobbies')
        if (raw) {
          const recents = JSON.parse(raw) as Array<{ id: string; title: string; createdAt: number }>
          const filtered = recents.filter(r => r.id !== roomId)
          localStorage.setItem('coindrop:recent_lobbies', JSON.stringify(filtered))
          recentRooms.value = filtered
        }
      } catch {
        /* ignore */
      }
    }

    leaveLobby()
  }

  function leaveLobby() {
    if (broadcastChannel) {
      broadcastChannel.close()
      broadcastChannel = null
    }
    supabase.unsubscribe()
    isConnected.value = false
    currentRoom.value = null
  }

  // Add a new card idea
  function addIdea(
    data: {
      title: string
      category?: string
      description?: string
      priceNote?: string
      link?: string
    },
    user: Identity,
  ) {
    if (!currentRoom.value) return

    const newIdea: CardIdea = {
      id: 'idea-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: data.title.trim(),
      category: data.category?.trim() || 'General',
      description: data.description?.trim(),
      priceNote: data.priceNote?.trim(),
      link: data.link?.trim(),
      authorId: user.id,
      authorName: user.name,
      authorEmoji: user.emoji,
      createdAt: Date.now(),
      votes: {},
    }

    currentRoom.value.ideas.push(newIdea)
    persistRoom(currentRoom.value)

    if (supabase.isConfigured.value) {
      supabase.saveIdea(newIdea, currentRoom.value.id)
    }

    sendWsMessage({
      type: 'ADD_IDEA',
      roomId: currentRoom.value.id,
      payload: { idea: newIdea, room: currentRoom.value },
      senderId: user.id,
    })
  }

  // Update an existing card idea (creator or author)
  function updateIdea(updatedIdea: CardIdea) {
    if (!currentRoom.value) return
    const idx = currentRoom.value.ideas.findIndex(i => i.id === updatedIdea.id)
    if (idx !== -1) {
      currentRoom.value.ideas[idx] = updatedIdea
      persistRoom(currentRoom.value)

      if (supabase.isConfigured.value) {
        supabase.saveIdea(updatedIdea, currentRoom.value.id)
      }

      sendWsMessage({
        type: 'UPDATE_IDEA',
        roomId: currentRoom.value.id,
        payload: { idea: updatedIdea, room: currentRoom.value },
      })
    }
  }

  // Delete a card idea (creator or author)
  function deleteIdea(ideaId: string) {
    if (!currentRoom.value) return
    currentRoom.value.ideas = currentRoom.value.ideas.filter(i => i.id !== ideaId)
    persistRoom(currentRoom.value)

    if (supabase.isConfigured.value) {
      supabase.removeIdea(ideaId)
    }

    sendWsMessage({
      type: 'DELETE_IDEA',
      roomId: currentRoom.value.id,
      payload: { ideaId, room: currentRoom.value },
    })
  }

  // Drop a coin (gold = 1pt, red = 2pt)
  function dropCoin(cardId: string, coinType: CoinType, user: Identity): boolean {
    if (!currentRoom.value || currentRoom.value.phase !== 'voting') return false

    // Check coin limits
    const remaining = coinType === 'gold' ? myGoldRemaining.value : myRedRemaining.value
    if (remaining <= 0) return false

    const idea = currentRoom.value.ideas.find(i => i.id === cardId)
    if (!idea) return false

    if (!idea.votes[user.id]) {
      idea.votes[user.id] = { gold: 0, red: 0 }
    }

    if (coinType === 'gold') idea.votes[user.id].gold++
    else if (coinType === 'red') idea.votes[user.id].red++

    // Trigger local animation & sound
    activeDrop.value = { cardId, coinType, key: Date.now() }
    playCoinSound(coinType)
    persistRoom(currentRoom.value)

    if (supabase.isConfigured.value) {
      const myGold = idea.votes[user.id]?.gold || 0
      const myRed = idea.votes[user.id]?.red || 0
      supabase.saveVote(currentRoom.value.id, cardId, user.id, myGold, myRed)
      supabase.broadcastCoinDrop(currentRoom.value.id, cardId, coinType, user.id)
    }

    sendWsMessage({
      type: 'DROP_COIN',
      roomId: currentRoom.value.id,
      payload: { cardId, coinType, userId: user.id, room: currentRoom.value },
      senderId: user.id,
    })

    return true
  }

  // Remove a coin
  function removeCoin(cardId: string, coinType: CoinType, user: Identity): boolean {
    if (!currentRoom.value || currentRoom.value.phase !== 'voting') return false

    const idea = currentRoom.value.ideas.find(i => i.id === cardId)
    if (!idea || !idea.votes[user.id]) return false

    if (coinType === 'gold' && idea.votes[user.id].gold > 0) {
      idea.votes[user.id].gold--
    } else if (coinType === 'red' && idea.votes[user.id].red > 0) {
      idea.votes[user.id].red--
    } else {
      return false
    }

    persistRoom(currentRoom.value)

    if (supabase.isConfigured.value) {
      const myGold = idea.votes[user.id]?.gold || 0
      const myRed = idea.votes[user.id]?.red || 0
      supabase.saveVote(currentRoom.value.id, cardId, user.id, myGold, myRed)
    }

    sendWsMessage({
      type: 'REMOVE_COIN',
      roomId: currentRoom.value.id,
      payload: { cardId, coinType, userId: user.id, room: currentRoom.value },
      senderId: user.id,
    })

    return true
  }

  // Change phase (Creator only)
  function changePhase(newPhase: LobbyPhase) {
    if (!currentRoom.value) return
    currentRoom.value.phase = newPhase

    if (newPhase === 'finished') {
      let topScore = 0
      let topId: string | null = null
      for (const item of currentRoom.value.ideas) {
        let score = 0
        for (const v of Object.values(item.votes)) {
          score += (v.gold || 0) * 1 + (v.red || 0) * 2
        }
        if (score > topScore) {
          topScore = score
          topId = item.id
        }
      }
      currentRoom.value.winnerCardId =
        topScore > 0
          ? topId
          : currentRoom.value.ideas.length === 1
            ? currentRoom.value.ideas[0].id
            : null
    }

    persistRoom(currentRoom.value)

    if (supabase.isConfigured.value) {
      supabase.saveLobby(currentRoom.value)
    }

    sendWsMessage({
      type: 'CHANGE_PHASE',
      roomId: currentRoom.value.id,
      payload: { phase: newPhase, room: currentRoom.value },
    })
  }

  // Reset votes (Creator only)
  function resetVotes() {
    if (!currentRoom.value) return
    for (const item of currentRoom.value.ideas) {
      item.votes = {}
    }
    currentRoom.value.winnerCardId = null
    persistRoom(currentRoom.value)

    if (supabase.isConfigured.value) {
      supabase.resetVotes(currentRoom.value.id)
    }

    sendWsMessage({
      type: 'RESET_VOTES',
      roomId: currentRoom.value.id,
      payload: { room: currentRoom.value },
    })
  }

  // Computed coin pouch state
  const myGoldSpent = computed(() => {
    if (!currentRoom.value) return 0
    const myId = useState<Identity | null>('identity').value?.id
    if (!myId) return 0
    let spent = 0
    for (const idea of currentRoom.value.ideas) {
      if (idea.votes[myId]?.gold) spent += idea.votes[myId].gold
    }
    return spent
  })

  const myRedSpent = computed(() => {
    if (!currentRoom.value) return 0
    const myId = useState<Identity | null>('identity').value?.id
    if (!myId) return 0
    let spent = 0
    for (const idea of currentRoom.value.ideas) {
      if (idea.votes[myId]?.red) spent += idea.votes[myId].red
    }
    return spent
  })

  const myGoldRemaining = computed(() => Math.max(0, MAX_GOLD_COINS - myGoldSpent.value))
  const myRedRemaining = computed(() => Math.max(0, MAX_RED_COINS - myRedSpent.value))

  // Enriched cards with vote calculations and leader detection
  const enrichedIdeas = computed<EnrichedCardIdea[]>(() => {
    if (!currentRoom.value) return []
    const myId = useState<Identity | null>('identity').value?.id || ''

    const mapped = currentRoom.value.ideas.map(idea => {
      let totalGold = 0
      let totalRed = 0
      for (const v of Object.values(idea.votes)) {
        totalGold += v.gold || 0
        totalRed += v.red || 0
      }
      const totalScore = totalGold * 1 + totalRed * 2
      const myGold = idea.votes[myId]?.gold || 0
      const myRed = idea.votes[myId]?.red || 0

      return {
        ...idea,
        totalGold,
        totalRed,
        totalScore,
        isLeader: false,
        myGold,
        myRed,
      }
    })

    const maxScore = Math.max(...mapped.map(m => m.totalScore), 0)
    if (maxScore > 0) {
      for (const item of mapped) {
        if (item.totalScore === maxScore) {
          item.isLeader = true
        }
      }
    }

    if (currentRoom.value.phase === 'finished') {
      return mapped.sort((a, b) => b.totalScore - a.totalScore)
    }
    // Stable order during ideas & voting: keep by createdAt to prevent jarring shifts
    return mapped.sort((a, b) => a.createdAt - b.createdAt)
  })

  // Update participant persona in current room and announce to all peers
  function updateParticipantIdentity(user: Identity) {
    if (!currentRoom.value) return

    const idx = currentRoom.value.participants.findIndex(p => p.id === user.id)
    if (idx !== -1) {
      currentRoom.value.participants[idx].name = user.name
      currentRoom.value.participants[idx].emoji = user.emoji
    } else {
      currentRoom.value.participants.push({ id: user.id, name: user.name, emoji: user.emoji })
    }

    if (currentRoom.value.creatorId === user.id) {
      currentRoom.value.creatorName = user.name
      currentRoom.value.creatorEmoji = user.emoji
      if (supabase.isConfigured.value) {
        supabase.saveLobby(currentRoom.value)
      }
    }

    persistRoom(currentRoom.value)

    sendWsMessage({
      type: 'USER_JOINED',
      roomId: currentRoom.value.id,
      payload: { user, room: currentRoom.value },
      senderId: user.id,
    })
  }

  return {
    currentRoom,
    isConnected,
    isSupabaseConfigured: supabase.isConfigured,
    recentRooms,
    activeDrop,
    myGoldRemaining,
    myRedRemaining,
    myGoldSpent,
    myRedSpent,
    MAX_GOLD_COINS,
    MAX_RED_COINS,
    enrichedIdeas,
    loadRecentRooms,
    createLobby,
    joinLobby,
    leaveLobby,
    endLobbyAndClearData,
    addIdea,
    updateIdea,
    deleteIdea,
    dropCoin,
    removeCoin,
    changePhase,
    resetVotes,
    setupSupabaseRealtime,
    updateParticipantIdentity,
  }
}
