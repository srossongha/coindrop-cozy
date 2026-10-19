import type { Identity } from '~/types'

export const DEFAULT_PERSONAS: Array<{ name: string; emoji: string }> = [
  { name: 'Chill Capybara', emoji: '🦫' },
  { name: 'Spicy Frog', emoji: '🐸' },
  { name: 'Cyber Gecko', emoji: '🦎' },
  { name: 'Pixel Fox', emoji: '🦊' },
  { name: 'Turbo Panda', emoji: '🐼' },
  { name: 'Krama Cat', emoji: '🐱' },
  { name: 'Mekong Otter', emoji: '🦦' },
  { name: 'Neon Tiger', emoji: '🐯' },
  { name: 'Cosmic Owl', emoji: '🦉' },
  { name: 'Zen Sloth', emoji: '🦥' },
]

export const EMOJI_OPTIONS = [
  '🦫',
  '🐸',
  '🦎',
  '🦊',
  '🐼',
  '🐱',
  '🦦',
  '🐯',
  '🦉',
  '🦥',
  '🦄',
  '🦖',
  '🐙',
  '🐬',
  '🐝',
]

const STORAGE_KEY = 'coindrop:identity'
const CUSTOMIZED_KEY = 'coindrop:identity_customized'

export function useIdentity() {
  const identity = useState<Identity | null>('identity', () => null)
  const isCustomized = useState<boolean>('identity_customized', () => false)

  function hasDefinedSelf(): boolean {
    if (!import.meta.client) return false
    return localStorage.getItem(CUSTOMIZED_KEY) === 'true'
  }

  function markDefinedSelf() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(CUSTOMIZED_KEY, 'true')
    } catch {
      /* ignore */
    }
    isCustomized.value = true
  }

  function init(): Identity {
    if (!import.meta.client) {
      return (
        identity.value || {
          id: 'server-seed',
          name: 'Chill Capybara',
          emoji: '🦫',
        }
      )
    }

    if (hasDefinedSelf()) {
      isCustomized.value = true
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (
          parsed &&
          typeof parsed.id === 'string' &&
          parsed.id.trim().length > 0 &&
          typeof parsed.name === 'string' &&
          parsed.name.trim().length > 0 &&
          typeof parsed.emoji === 'string' &&
          parsed.emoji.trim().length > 0
        ) {
          identity.value = {
            id: parsed.id,
            name: parsed.name,
            emoji: parsed.emoji,
          }
          return identity.value
        }
      }
    } catch (e) {
      console.warn('[useIdentity] Failed to read cached identity:', e)
    }

    // Pick random persona and generate UUID
    const randomPersona =
      DEFAULT_PERSONAS[Math.floor(Math.random() * DEFAULT_PERSONAS.length)] || DEFAULT_PERSONAS[0]
    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'user-' + Math.random().toString(36).substring(2, 9)

    const freshIdentity: Identity = {
      id: newId,
      name: randomPersona.name,
      emoji: randomPersona.emoji,
    }

    identity.value = freshIdentity

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshIdentity))
    } catch (e) {
      console.warn('[useIdentity] Could not write to localStorage:', e)
    }

    return freshIdentity
  }

  function updateIdentity(name: string, emoji: string) {
    if (!identity.value) {
      init()
    }
    if (!identity.value) return

    identity.value = {
      ...identity.value,
      name: name.trim() || identity.value.name,
      emoji: emoji.trim() || identity.value.emoji,
    }

    markDefinedSelf()

    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(identity.value))
      } catch (e) {
        console.warn('[useIdentity] Failed to save updated identity:', e)
      }
    }
  }

  return {
    identity,
    isCustomized,
    init,
    updateIdentity,
    hasDefinedSelf,
    markDefinedSelf,
    personas: DEFAULT_PERSONAS,
    emojiOptions: EMOJI_OPTIONS,
  }
}
