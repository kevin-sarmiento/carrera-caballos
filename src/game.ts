import type { Card, Checkpoint, GameState, Horse, Suit } from './types'
import { createSpanishDeck40, shuffle } from './deck'

const ALL_SUITS: Suit[] = ['oros', 'copas', 'espadas', 'bastos']
const META = 7
const CHECKPOINTS = 7

function clampMin0(n: number): number {
    return n < 0 ? 0 : n
}

function assignSuits(players: number): Suit[] {
    // asignación simple y determinística
    return ALL_SUITS.slice(0, players)
}

export function newGame(players: number): GameState {
    if (players < 2 || players > 4) throw new Error('players debe ser 2..4')

    let deck = shuffle(createSpanishDeck40())

    // sacar 7 cartas para checkpoints (boca abajo)
    const checkpointsCards: Card[] = deck.slice(0, CHECKPOINTS)
    deck = deck.slice(CHECKPOINTS)

    const suits = assignSuits(players)
    const horses: Horse[] = suits.map((s) => ({ suit: s, position: 0 }))

    const checkpoints: Checkpoint[] = checkpointsCards.map((card, index) => ({
        index,
        card,
        revealed: false,
    }))

    return {
        status: 'running',
        players,
        horses,
        deck,
        checkpoints,
        nextCheckpointToFlip: 0,
        history: [`Partida iniciada con ${players} jugadores (${suits.join(', ')})`],
        places: [],
    }
}

function horseBySuit(state: GameState, suit: Suit): Horse | undefined {
    return state.horses.find((h) => h.suit === suit)
}

function allPassedCheckpoint(state: GameState, checkpointIndex: number): boolean {
    // “pasar” el checkpoint i significa estar en posición >= i+1
    const requiredPos = checkpointIndex + 1
    return state.horses.every((h) => h.position >= requiredPos || h.finishedPlace !== undefined)
}

function flipCheckpointIfNeeded(state: GameState): void {
    const i = state.nextCheckpointToFlip
    if (i >= CHECKPOINTS) return

    if (!allPassedCheckpoint(state, i)) return

    const cp = state.checkpoints[i]
    if (cp.revealed) return

    cp.revealed = true
    state.history.push(`Se voltea el hito #${i + 1}: ${cp.card.suit} ${cp.card.rank}`)

    // penalización: ese palo retrocede 1 (si no terminó)
    const penalized = horseBySuit(state, cp.card.suit)
    if (penalized && penalized.finishedPlace === undefined) {
        penalized.position = clampMin0(penalized.position - 1)
        state.history.push(`Penalización: ${cp.card.suit} retrocede 1 (posición ${penalized.position})`)
    }

    state.nextCheckpointToFlip++
}

function registerFinish(state: GameState, suit: Suit): void {
    if (state.places.includes(suit)) return
    state.places.push(suit)
    const place = state.places.length as 1 | 2 | 3 | 4
    const horse = horseBySuit(state, suit)
    if (horse) horse.finishedPlace = place <= 3 ? place : undefined

    const label = place === 1 ? '1º' : place === 2 ? '2º' : place === 3 ? '3º' : `${place}º`
    state.history.push(`🏁 ${suit} llega a la meta (${label} lugar)`)

    // cuando todos lleguen, termina
    if (state.places.length === state.horses.length) {
        state.status = 'finished'
        state.history.push('Partida finalizada.')
    }
}

export function stepDraw(state: GameState): { drawn: Card } {
    if (state.status !== 'running') throw new Error('La partida no está en ejecución')
    if (state.deck.length === 0) throw new Error('No hay más cartas en el mazo')

    const drawn = state.deck.shift() as Card
    state.history.push(`Carta robada: ${drawn.suit} ${drawn.rank}`)

    const horse = horseBySuit(state, drawn.suit)
    if (horse && horse.finishedPlace === undefined) {
        horse.position = Math.min(META, horse.position + 1)
        state.history.push(`${drawn.suit} avanza a ${horse.position}`)

        if (horse.position >= META) {
            registerFinish(state, drawn.suit)
        }
    } else {
        state.history.push(`(Sin efecto) ${drawn.suit} ya terminó o no está en juego`)
    }

    flipCheckpointIfNeeded(state)
    return { drawn }
}