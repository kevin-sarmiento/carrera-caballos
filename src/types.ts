export type Suit = 'oros' | 'copas' | 'espadas' | 'bastos'

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12 // baraja española 40

export interface Card {
    id: string
    suit: Suit
    rank: Rank
}

export interface Checkpoint {
    index: number // 0..6 (7 cartas)
    card: Card
    revealed: boolean
}

export interface Horse {
    suit: Suit
    position: number // 0..7 (7 = meta)
    finishedPlace?: 1 | 2 | 3 | 4
}

export type GameStatus = 'setup' | 'running' | 'finished'

export interface GameState {
    status: GameStatus
    players: number
    horses: Horse[]
    deck: Card[]
    checkpoints: Checkpoint[]
    nextCheckpointToFlip: number // 0..6
    history: string[]
    places: Suit[] // orden de llegada (1º,2º,3º,4º)
}