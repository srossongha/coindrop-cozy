import type { DecisionRoom, UserProfile } from '~/types'

export const EMOJI_AVATARS = [
  '🐸',
  '🦫',
  '🦊',
  '🐼',
  '🐱',
  '🐯',
  '🐙',
  '🦉',
  '🦄',
  '🦖',
  '🐝',
  '🐬',
]

export const MAX_COINS_PER_USER = 5

export const SIMULATED_FRIENDS: UserProfile[] = [
  { id: 'sim-1', name: 'Chill Capybara', emoji: '🦫', color: 'from-amber-500 to-orange-600' },
  { id: 'sim-2', name: 'Pixel Fox', emoji: '🦊', color: 'from-rose-500 to-pink-600' },
  { id: 'sim-3', name: 'Turbo Panda', emoji: '🐼', color: 'from-emerald-500 to-teal-600' },
  { id: 'sim-4', name: 'Krama Cat', emoji: '🐱', color: 'from-indigo-500 to-purple-600' },
  { id: 'sim-5', name: 'Mekong Otter', emoji: '🦦', color: 'from-cyan-500 to-blue-600' },
]

export const INITIAL_ROOMS: DecisionRoom[] = [
  {
    id: 'x9k-2m4',
    title: 'Friday Night Hotpot & Hangout 🍲',
    createdAt: Date.now() - 1000 * 60 * 8,
    expiresInSeconds: 47 * 3600 + 52 * 60,
    lockedWinnerId: null,
    options: [
      {
        id: 'opt-1',
        title: 'Suki Soup & Sichuan Mala Hotpot',
        category: 'Hotpot',
        priceNote: '~$12–$15 / person',
        link: 'https://maps.google.com',
        createdBy: 'Chill Capybara 🦫',
        createdAt: Date.now() - 400000,
        votes: {
          'sim-1': 3,
          'sim-2': 2,
          'user-local': 2,
        },
      },
      {
        id: 'opt-2',
        title: 'Rooftop Charcoal BBQ & Skewers',
        category: 'BBQ & Grill',
        priceNote: '~$10–$14 / person',
        link: 'https://maps.google.com',
        createdBy: 'Pixel Fox 🦊',
        createdAt: Date.now() - 300000,
        votes: {
          'sim-2': 3,
          'sim-3': 4,
        },
      },
      {
        id: 'opt-3',
        title: 'Riverside Night Market Street Food Tour',
        category: 'Street Food',
        priceNote: '~$5–$8 / person',
        link: 'https://maps.google.com',
        createdBy: 'Turbo Panda 🐼',
        createdAt: Date.now() - 200000,
        votes: {
          'sim-4': 4,
          'sim-1': 2,
          'user-local': 1,
        },
      },
      {
        id: 'opt-4',
        title: 'Handmade Ramen & Gyoza Izakaya',
        category: 'Japanese',
        priceNote: '~$9–$12 / person',
        link: 'https://maps.google.com',
        createdBy: 'Krama Cat 🐱',
        createdAt: Date.now() - 100000,
        votes: {
          'sim-3': 1,
          'sim-4': 1,
          'sim-5': 2,
        },
      },
    ],
    expenses: [
      {
        id: 'exp-1',
        title: 'Main Hotpot & Meat Platters',
        amount: 54.0,
        paidBy: 'user-local',
        splitAmong: ['user-local', 'sim-1', 'sim-2', 'sim-3', 'sim-4'],
      },
      {
        id: 'exp-2',
        title: 'Iced Lemon Teas & Craft Sodas',
        amount: 18.5,
        paidBy: 'sim-2',
        splitAmong: ['user-local', 'sim-1', 'sim-2', 'sim-3', 'sim-4'],
      },
      {
        id: 'exp-3',
        title: 'Mango Sticky Rice Desserts',
        amount: 12.5,
        paidBy: 'sim-3',
        splitAmong: ['user-local', 'sim-1', 'sim-2', 'sim-3', 'sim-4'],
      },
    ],
  },
]
