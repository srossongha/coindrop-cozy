import type { LobbyWsMessage } from '~/types'

// In-memory lobby room states cache on the server
const roomCache = new Map<string, unknown>()

export default defineWebSocketHandler({
  open(_peer) {
    // Peer connected
  },
  message(peer, message) {
    try {
      const text = message.text()
      const data = JSON.parse(text) as LobbyWsMessage

      if (!data || !data.roomId) return

      const topic = `room:${data.roomId}`

      switch (data.type) {
        case 'JOIN_LOBBY': {
          peer.subscribe(topic)
          // If we have cached room state, send back to newly joined peer
          const cached = roomCache.get(data.roomId)
          if (cached) {
            peer.send(
              JSON.stringify({
                type: 'SYNC_ROOM',
                roomId: data.roomId,
                payload: cached,
              }),
            )
          }
          // Notify other participants in the room
          peer.publish(topic, text)
          break
        }

        case 'SYNC_ROOM': {
          if (data.payload) {
            roomCache.set(data.roomId, data.payload)
          }
          peer.publish(topic, text)
          break
        }

        case 'ADD_IDEA':
        case 'UPDATE_IDEA':
        case 'DELETE_IDEA':
        case 'DROP_COIN':
        case 'REMOVE_COIN':
        case 'CHANGE_PHASE':
        case 'RESET_VOTES':
        case 'USER_JOINED': {
          // If message contains full room or updated state, update cache
          const payloadObj = data.payload as { room?: unknown } | undefined
          if (payloadObj?.room) {
            roomCache.set(data.roomId, payloadObj.room)
          }
          peer.publish(topic, text)
          break
        }

        default: {
          peer.publish(topic, text)
        }
      }
    } catch (err) {
      console.warn('[ws] error handling message:', err)
    }
  },
  close(_peer) {
    // Peer disconnected
  },
  error(peer, error) {
    console.error('[ws] error:', error)
  },
})
