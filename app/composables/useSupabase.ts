import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js'
import type { CardIdea, CoinType, LobbyPhase, LobbyRoom, UserIdentity } from '~/types'

let activeChannel: RealtimeChannel | null = null

export function useSupabase() {
  const config = useRuntimeConfig()
  const supabaseUrl = (config.public?.supabaseUrl as string) || ''
  const supabaseKey = (config.public?.supabaseKey as string) || ''

  const isConfigured = computed(() => {
    return Boolean(
      supabaseUrl &&
      supabaseKey &&
      supabaseUrl.startsWith('http') &&
      !supabaseUrl.includes('placeholder'),
    )
  })

  const client = useState<SupabaseClient | null>('supabase_client', () => {
    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
      try {
        return createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        })
      } catch (err) {
        console.warn('[useSupabase] Failed to initialize Supabase client:', err)
        return null
      }
    }
    return null
  })

  // Fetch full room data (lobby, ideas, and votes) from Supabase
  async function fetchRoom(roomId: string): Promise<LobbyRoom | null> {
    if (!client.value) return null

    try {
      // 1. Fetch lobby row
      const { data: lobbyData, error: lobbyError } = await client.value
        .from('coindrop_lobbies')
        .select('*')
        .eq('id', roomId)
        .single()

      if (lobbyError || !lobbyData) {
        return null
      }

      // 2. Fetch ideas
      const { data: ideasData } = await client.value
        .from('coindrop_ideas')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      // 3. Fetch votes
      const { data: votesData } = await client.value
        .from('coindrop_votes')
        .select('*')
        .eq('room_id', roomId)

      // Map votes by cardId -> userId -> { gold, red }
      const votesMap: Record<string, Record<string, { gold: number; red: number }>> = {}
      if (votesData) {
        for (const v of votesData) {
          if (!votesMap[v.card_id]) {
            votesMap[v.card_id] = {}
          }
          votesMap[v.card_id][v.user_id] = {
            gold: v.gold_coins || 0,
            red: v.red_coins || 0,
          }
        }
      }

      // Map ideas
      const ideas: CardIdea[] = (ideasData || []).map(row => ({
        id: row.id,
        title: row.title,
        category: row.category,
        description: row.description || undefined,
        priceNote: row.price_note || undefined,
        link: row.link || undefined,
        authorId: row.author_id,
        authorName: row.author_name,
        authorEmoji: row.author_emoji,
        createdAt: new Date(row.created_at).getTime(),
        votes: votesMap[row.id] || {},
      }))

      const room: LobbyRoom = {
        id: lobbyData.id,
        title: lobbyData.title,
        creatorId: lobbyData.creator_id,
        creatorName: lobbyData.creator_name,
        creatorEmoji: lobbyData.creator_emoji,
        createdAt: new Date(lobbyData.created_at).getTime(),
        phase: lobbyData.phase as LobbyPhase,
        winnerCardId: lobbyData.winner_card_id,
        ideas,
        participants: [
          {
            id: lobbyData.creator_id,
            name: lobbyData.creator_name,
            emoji: lobbyData.creator_emoji,
          },
        ],
      }

      return room
    } catch (err) {
      console.warn('[useSupabase] fetchRoom error:', err)
      return null
    }
  }

  // Create or update lobby metadata in Supabase
  async function saveLobby(room: LobbyRoom) {
    if (!client.value) return

    try {
      await client.value.from('coindrop_lobbies').upsert({
        id: room.id,
        title: room.title,
        creator_id: room.creatorId,
        creator_name: room.creatorName,
        creator_emoji: room.creatorEmoji,
        phase: room.phase,
        winner_card_id: room.winnerCardId,
        created_at: new Date(room.createdAt).toISOString(),
      })
    } catch (err) {
      console.warn('[useSupabase] saveLobby error:', err)
    }
  }

  // Save an idea to Supabase
  async function saveIdea(idea: CardIdea, roomId: string) {
    if (!client.value) return

    try {
      await client.value.from('coindrop_ideas').upsert({
        id: idea.id,
        room_id: roomId,
        title: idea.title,
        category: idea.category,
        description: idea.description || null,
        price_note: idea.priceNote || null,
        link: idea.link || null,
        author_id: idea.authorId,
        author_name: idea.authorName,
        author_emoji: idea.authorEmoji,
        created_at: new Date(idea.createdAt).toISOString(),
      })
    } catch (err) {
      console.warn('[useSupabase] saveIdea error:', err)
    }
  }

  // Delete an idea from Supabase
  async function removeIdea(ideaId: string) {
    if (!client.value) return

    try {
      await client.value.from('coindrop_ideas').delete().eq('id', ideaId)
    } catch (err) {
      console.warn('[useSupabase] removeIdea error:', err)
    }
  }

  // Save a vote (gold or red coins) to Supabase
  async function saveVote(
    roomId: string,
    cardId: string,
    userId: string,
    gold: number,
    red: number,
  ) {
    if (!client.value) return

    try {
      const voteId = `${cardId}:${userId}`
      await client.value.from('coindrop_votes').upsert({
        id: voteId,
        room_id: roomId,
        card_id: cardId,
        user_id: userId,
        gold_coins: gold,
        red_coins: red,
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('[useSupabase] saveVote error:', err)
    }
  }

  // Reset all votes for a room
  async function resetVotes(roomId: string) {
    if (!client.value) return

    try {
      await client.value.from('coindrop_votes').delete().eq('room_id', roomId)
    } catch (err) {
      console.warn('[useSupabase] resetVotes error:', err)
    }
  }

  // Subscribe to real-time changes on a lobby
  function subscribeToLobby(
    roomId: string,
    currentUser: UserIdentity,
    callbacks: {
      onLobbyChange?: (lobby: Record<string, unknown>) => void
      onIdeaChange?: (type: 'INSERT' | 'UPDATE' | 'DELETE', idea: Record<string, unknown>) => void
      onVoteChange?: (vote: Record<string, unknown>) => void
      onDropBroadcast?: (data: { cardId: string; coinType: CoinType; userId: string }) => void
    },
  ) {
    if (!client.value) return null

    // Clean up existing channel
    if (activeChannel) {
      client.value.removeChannel(activeChannel)
      activeChannel = null
    }

    const channel = client.value.channel(`lobby:${roomId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: currentUser.id },
      },
    })

    // Listen to Supabase Realtime Postgres Changes
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coindrop_lobbies',
          filter: `id=eq.${roomId}`,
        },
        payload => {
          callbacks.onLobbyChange?.(payload.new as Record<string, unknown>)
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coindrop_ideas',
          filter: `room_id=eq.${roomId}`,
        },
        payload => {
          callbacks.onIdeaChange?.(
            payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            (payload.new || payload.old) as Record<string, unknown>,
          )
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coindrop_votes',
          filter: `room_id=eq.${roomId}`,
        },
        payload => {
          callbacks.onVoteChange?.(payload.new as Record<string, unknown>)
        },
      )
      .on('broadcast', { event: 'coin_drop' }, ({ payload }) => {
        callbacks.onDropBroadcast?.(
          payload as { cardId: string; coinType: CoinType; userId: string },
        )
      })

    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        // Track presence
        channel.track({
          id: currentUser.id,
          name: currentUser.name,
          emoji: currentUser.emoji,
          onlineAt: new Date().toISOString(),
        })
      }
    })

    activeChannel = channel
    return channel
  }

  function broadcastCoinDrop(roomId: string, cardId: string, coinType: CoinType, userId: string) {
    if (!activeChannel) return
    activeChannel.send({
      type: 'broadcast',
      event: 'coin_drop',
      payload: { cardId, coinType, userId },
    })
  }

  function unsubscribe() {
    if (client.value && activeChannel) {
      client.value.removeChannel(activeChannel)
      activeChannel = null
    }
  }

  return {
    client,
    isConfigured,
    fetchRoom,
    saveLobby,
    saveIdea,
    removeIdea,
    saveVote,
    resetVotes,
    subscribeToLobby,
    broadcastCoinDrop,
    unsubscribe,
  }
}
