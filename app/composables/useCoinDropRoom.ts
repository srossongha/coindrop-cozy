import type {
  DecisionRoom,
  UserProfile,
  BoardOption,
  EnrichedOption,
  Expense,
  LiveFeedItem,
  FloatingReaction,
} from '~/types'
import { INITIAL_ROOMS, SIMULATED_FRIENDS, MAX_COINS_PER_USER } from '~/utils/constants'

export function useCoinDropRoom() {
  const { dropCoin } = useCoinDrop()

  // 1. User Identity
  const userProfile = useState<UserProfile>('coindrop-user-profile', () => ({
    id: 'user-local',
    name: 'Spicy Frog',
    emoji: '🐸',
    color: 'from-amber-400 to-yellow-600',
    isMe: true,
    isOnline: true,
  }))

  // 2. Rooms & Tabs
  const rooms = useState<DecisionRoom[]>('coindrop-rooms', () => INITIAL_ROOMS)
  const activeRoomId = useState<string>('coindrop-active-room-id', () => 'x9k-2m4')
  const activeTab = useState<'board' | 'wheel' | 'split'>('coindrop-active-tab', () => 'board')
  const sortBy = useState<'coins' | 'newest'>('coindrop-sort-by', () => 'coins')

  // 3. Live Simulation & Feedback
  const simulateFriends = useState<boolean>('coindrop-sim-friends', () => true)
  const liveFeed = useState<LiveFeedItem[]>('coindrop-live-feed', () => [
    { id: 'f-1', text: 'Chill Capybara 🦫 dropped 2🪙 on Suki Soup', time: 'Just now' },
  ])
  const floatingReactions = useState<FloatingReaction[]>('coindrop-floating-reactions', () => [])
  const toastMessage = useState<string | null>('coindrop-toast', () => null)
  const shakePouch = useState<boolean>('coindrop-shake-pouch', () => false)
  const settledDebtKeys = useState<Record<string, boolean>>('coindrop-settled-debts', () => ({}))

  // Derived Current Room
  const currentRoom = computed(() => {
    return rooms.value.find(r => r.id === activeRoomId.value) || rooms.value[0]!
  })

  // Toast Helper
  let toastTimer: ReturnType<typeof setTimeout> | null = null
  function showToast(msg: string) {
    if (toastTimer) clearTimeout(toastTimer)
    toastMessage.value = msg
    toastTimer = setTimeout(() => {
      toastMessage.value = null
    }, 2800)
  }

  // Floating Reaction Helper
  function triggerReaction(emoji: string, authorName: string) {
    const id = Date.now() + Math.random()
    const leftOffset = 15 + Math.floor(Math.random() * 70)
    floatingReactions.value.push({ id, emoji, authorName, leftOffset })
    setTimeout(() => {
      floatingReactions.value = floatingReactions.value.filter(r => r.id !== id)
    }, 2400)
  }

  // Coins Spent & Remaining
  const myCoinsSpent = computed(() => {
    if (!currentRoom.value) return 0
    return currentRoom.value.options.reduce((sum, opt) => {
      return sum + (opt.votes[userProfile.value.id] || 0)
    }, 0)
  })

  const myCoinsRemaining = computed(() => {
    return Math.max(0, MAX_COINS_PER_USER - myCoinsSpent.value)
  })

  // All Participants
  const participants = computed<UserProfile[]>(() => {
    const all = [
      { ...userProfile.value, isMe: true, isOnline: true },
      ...SIMULATED_FRIENDS.map(f => ({ ...f, isMe: false, isOnline: true })),
    ]
    return all.map(p => {
      const spent = currentRoom.value.options.reduce((acc, opt) => acc + (opt.votes[p.id] || 0), 0)
      return { ...p, coinsSpent: spent }
    })
  })

  // Enriched & Sorted Options
  const enrichedOptions = computed<EnrichedOption[]>(() => {
    const withTotals = currentRoom.value.options.map(opt => {
      const totalCoins = Object.values(opt.votes).reduce((a, b) => a + b, 0)
      return { ...opt, totalCoins }
    })

    const maxCoins = Math.max(0, ...withTotals.map(o => o.totalCoins))

    const sorted = [...withTotals].sort((a, b) => {
      if (sortBy.value === 'coins') return b.totalCoins - a.totalCoins
      return b.createdAt - a.createdAt
    })

    return sorted.map(opt => ({
      ...opt,
      isLeader: maxCoins > 0 && opt.totalCoins === maxCoins,
    }))
  })

  // Actions
  function handleVote(optionId: string, delta: number) {
    if (delta > 0 && myCoinsRemaining.value <= 0) {
      shakePouch.value = true
      setTimeout(() => {
        shakePouch.value = false
      }, 500)
      showToast('No coins left in your pouch! Reclaim a coin from another card first.')
      return
    }

    rooms.value = rooms.value.map(room => {
      if (room.id !== activeRoomId.value) return room
      return {
        ...room,
        options: room.options.map(opt => {
          if (opt.id !== optionId) return opt
          const currentVotes = opt.votes[userProfile.value.id] || 0
          const nextVotes = Math.max(0, currentVotes + delta)
          return {
            ...opt,
            votes: {
              ...opt.votes,
              [userProfile.value.id]: nextVotes,
            },
          }
        }),
      }
    })

    if (delta > 0) {
      dropCoin()
      triggerReaction('🪙', `${userProfile.value.name} ${userProfile.value.emoji}`)
    }
  }

  function handleAddOption(params: {
    title: string
    category: string
    priceNote: string
    link?: string
  }) {
    if (!params.title.trim()) return

    const newOpt: BoardOption = {
      id: `opt-${Date.now()}`,
      title: params.title.trim(),
      category: params.category || 'General',
      priceNote: params.priceNote.trim() || 'Flexible budget',
      link: params.link?.trim() || '',
      createdBy: `${userProfile.value.name} ${userProfile.value.emoji}`,
      createdAt: Date.now(),
      votes: myCoinsRemaining.value > 0 ? { [userProfile.value.id]: 1 } : {},
    }

    if (myCoinsRemaining.value > 0) {
      dropCoin()
    }

    rooms.value = rooms.value.map(r =>
      r.id === activeRoomId.value ? { ...r, options: [newOpt, ...r.options] } : r,
    )

    showToast(`Added "${newOpt.title}" to the board!`)
  }

  function handleCreateNewRoom(title: string) {
    if (!title.trim()) return
    const randomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`

    const newRoom: DecisionRoom = {
      id: randomCode,
      title: title.trim(),
      createdAt: Date.now(),
      expiresInSeconds: 48 * 3600,
      lockedWinnerId: null,
      options: [],
      expenses: [],
    }

    rooms.value = [newRoom, ...rooms.value]
    activeRoomId.value = randomCode
    activeTab.value = 'board'
    showToast(`Created instant room #${randomCode}!`)
  }

  function handleResetRoomVotes() {
    rooms.value = rooms.value.map(r => {
      if (r.id !== activeRoomId.value) return r
      return {
        ...r,
        lockedWinnerId: null,
        options: r.options.map(o => ({ ...o, votes: {} })),
      }
    })
    showToast('All coins returned to everyone’s pouches!')
  }

  function handleLockWinner(optionId: string) {
    rooms.value = rooms.value.map(r =>
      r.id === activeRoomId.value ? { ...r, lockedWinnerId: optionId } : r,
    )
    showToast('Winner locked in for the group! 🎉')
  }

  function handleAddExpense(expense: Omit<Expense, 'id'>) {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      ...expense,
    }
    rooms.value = rooms.value.map(r =>
      r.id === activeRoomId.value ? { ...r, expenses: [newExp, ...r.expenses] } : r,
    )
    showToast(`Added bill "${newExp.title}" ($${newExp.amount.toFixed(2)})`)
  }

  function saveProfile(name: string, emoji: string) {
    if (name.trim()) {
      userProfile.value = {
        ...userProfile.value,
        name: name.trim(),
        emoji,
      }
      showToast(`Identity updated to ${name} ${emoji}`)
    }
  }

  function toggleSettledDebt(key: string) {
    settledDebtKeys.value = {
      ...settledDebtKeys.value,
      [key]: !settledDebtKeys.value[key],
    }
  }

  // Simulated Multiplayer Loop
  let simInterval: ReturnType<typeof setInterval> | null = null
  function startSimulation() {
    if (simInterval) clearInterval(simInterval)
    simInterval = setInterval(() => {
      if (!simulateFriends.value) return
      const friend = SIMULATED_FRIENDS[Math.floor(Math.random() * SIMULATED_FRIENDS.length)]
      if (!friend) return

      const actionRoll = Math.random()

      rooms.value = rooms.value.map(room => {
        if (room.id !== activeRoomId.value || room.options.length === 0) return room

        // 70% chance: Add or move a coin
        if (actionRoll < 0.72) {
          const friendSpent = room.options.reduce((sum, o) => sum + (o.votes[friend.id] || 0), 0)
          const targetIndex = Math.floor(Math.random() * room.options.length)
          const targetOpt = room.options[targetIndex]
          if (!targetOpt) return room

          if (friendSpent < MAX_COINS_PER_USER) {
            const updatedOptions = room.options.map((o, idx) => {
              if (idx !== targetIndex) return o
              return {
                ...o,
                votes: {
                  ...o.votes,
                  [friend.id]: (o.votes[friend.id] || 0) + 1,
                },
              }
            })

            liveFeed.value = [
              {
                id: Date.now(),
                text: `${friend.name} ${friend.emoji} dropped +1🪙 on "${targetOpt.title.slice(0, 22)}..."`,
                time: 'Live',
              },
              ...liveFeed.value.slice(0, 4),
            ]
            dropCoin()
            triggerReaction('🪙', friend.name)

            return { ...room, options: updatedOptions }
          } else {
            const votedIdx = room.options.findIndex(o => (o.votes[friend.id] || 0) > 0)
            if (votedIdx !== -1 && votedIdx !== targetIndex) {
              const updatedOptions = room.options.map((o, idx) => {
                if (idx === votedIdx) {
                  return { ...o, votes: { ...o.votes, [friend.id]: (o.votes[friend.id] || 0) - 1 } }
                }
                if (idx === targetIndex) {
                  return { ...o, votes: { ...o.votes, [friend.id]: (o.votes[friend.id] || 0) + 1 } }
                }
                return o
              })

              liveFeed.value = [
                {
                  id: Date.now(),
                  text: `${friend.name} ${friend.emoji} shifted 1🪙 to "${targetOpt.title.slice(0, 22)}..."`,
                  time: 'Live',
                },
                ...liveFeed.value.slice(0, 4),
              ]
              return { ...room, options: updatedOptions }
            }
          }
        } else {
          const emojis = ['🔥', '🍲', '😋', '💯', '🚀', '🙌']
          const picked = emojis[Math.floor(Math.random() * emojis.length)] ?? '🔥'
          triggerReaction(picked, `${friend.name} ${friend.emoji}`)
        }

        return room
      })
    }, 4000)
  }

  function stopSimulation() {
    if (simInterval) clearInterval(simInterval)
    simInterval = null
  }

  return {
    userProfile,
    rooms,
    activeRoomId,
    activeTab,
    sortBy,
    simulateFriends,
    liveFeed,
    floatingReactions,
    toastMessage,
    shakePouch,
    settledDebtKeys,
    currentRoom,
    myCoinsSpent,
    myCoinsRemaining,
    participants,
    enrichedOptions,
    handleVote,
    handleAddOption,
    handleCreateNewRoom,
    handleResetRoomVotes,
    handleLockWinner,
    handleAddExpense,
    saveProfile,
    toggleSettledDebt,
    showToast,
    triggerReaction,
    startSimulation,
    stopSimulation,
  }
}
