import type { Card, Rank, Suit } from './types'

const SUITS: Suit[] = ['oros', 'copas', 'espadas', 'bastos']
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]

function randomId(): string {
    return crypto.randomUUID()
}

export function createSpanishDeck40(): Card[] {
    const deck: Card[] = []
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ id: randomId(), suit, rank })
        }
    }
    return deck
}

// Fisher–Yates shuffle
export function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}