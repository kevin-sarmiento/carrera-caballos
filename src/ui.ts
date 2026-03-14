import type { GameState, Suit, Card, User, Bet } from './types'
import { newGame, stepDraw } from './game'
import { api } from './api'

let state: GameState | null = null
let lastDrawn: Card | null = null
let currentUser: User | null = null
let bets: Bet[] = []

const suitEmoji: Record<Suit, string> = {
    oros: '🪙',
    copas: '🍷',
    espadas: '🗡️',
    bastos: '🪵',
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string) {
    const e = document.createElement(tag)
    if (className) e.className = className
    return e
}

function pct(pos: number) {
    // pos 0..7
    return Math.round((Math.max(0, Math.min(7, pos)) / 7) * 100)
}

function renderAuth(container: HTMLElement) {
    const card = el('div', 'card')
    const hd = el('div', 'card-hd')
    const h2 = el('h2')
    h2.textContent = 'Bienvenido a Carrera de Caballos'
    hd.appendChild(h2)

    const bd = el('div', 'card-bd')

    // Login form
    const loginForm = el('div', 'auth-form')
    const loginTitle = el('h3')
    loginTitle.textContent = 'Iniciar Sesión'
    loginForm.appendChild(loginTitle)

    const loginUsername = el('input') as HTMLInputElement
    loginUsername.type = 'text'
    loginUsername.placeholder = 'Usuario'
    loginUsername.className = 'auth-input'

    const loginPassword = el('input') as HTMLInputElement
    loginPassword.type = 'password'
    loginPassword.placeholder = 'Contraseña'
    loginPassword.className = 'auth-input'

    const loginBtn = el('button', 'btn-primary')
    loginBtn.textContent = 'Iniciar Sesión'
    loginBtn.onclick = async () => {
        try {
            const response = await api.login(loginUsername.value, loginPassword.value)
            currentUser = response.user
            render(document.querySelector('#app')!)
        } catch (err: any) {
            alert(err.message)
        }
    }

    loginForm.append(loginUsername, loginPassword, loginBtn)

    // Register form
    const registerForm = el('div', 'auth-form')
    const registerTitle = el('h3')
    registerTitle.textContent = 'Registrarse'
    registerForm.appendChild(registerTitle)

    const registerUsername = el('input') as HTMLInputElement
    registerUsername.type = 'text'
    registerUsername.placeholder = 'Usuario'
    registerUsername.className = 'auth-input'

    const registerPassword = el('input') as HTMLInputElement
    registerPassword.type = 'password'
    registerPassword.placeholder = 'Contraseña'
    registerPassword.className = 'auth-input'

    const registerBtn = el('button', 'btn-secondary')
    registerBtn.textContent = 'Registrarse'
    registerBtn.onclick = async () => {
        try {
            const response = await api.register(registerUsername.value, registerPassword.value)
            currentUser = response.user
            render(document.querySelector('#app')!)
        } catch (err: any) {
            alert(err.message)
        }
    }

    registerForm.append(registerUsername, registerPassword, registerBtn)

    bd.append(loginForm, el('div', 'divider'), registerForm)
    card.append(hd, bd)
    container.appendChild(card)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function logout() {
    api.logout()
    currentUser = null
    state = null
    bets = []
    render(document.querySelector('#app')!)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function removeBet(index: number) {
    if (currentUser && bets[index]) {
        currentUser.points += bets[index].amount
        bets.splice(index, 1)
        render(document.querySelector('#app')!)
    }
}

function render(app: HTMLElement) {
    app.innerHTML = ''

    const container = el('div', 'container')
    app.appendChild(container)

    // Check if user is logged in
    if (!currentUser) {
        renderAuth(container)
        return
    }

    // HEADER
    const header = el('div', 'header')

    const titleBox = el('div', 'title')
    const h1 = el('h1')
    h1.textContent = 'Carrera de Caballos (Baraja Española)'
    const p = el('p')
    p.textContent =
        'Juego automatizado paso a paso: modelo de datos, estructuras, operadores y restricciones.'
    titleBox.append(h1, p)

    const userInfo = el('div', 'user-info')
    userInfo.innerHTML = `
        <div class="user-name">${currentUser.username}</div>
        <div class="user-points">${currentUser.points} puntos</div>
        <button class="btn-logout" onclick="logout()">Logout</button>
    `
    titleBox.appendChild(userInfo)

    const pills = el('div', 'pills')
    const pill2 = el('div', 'pill')
    pill2.textContent = '2–4 jugadores'
    const pill3 = el('div', 'pill')
    pill3.textContent = 'Baraja española 40'
    pills.append(pill2, pill3)

    header.append(titleBox, pills)
    container.appendChild(header)

    // SETUP VIEW
    if (!state) {
        const card = el('div', 'card')
        const hd = el('div', 'card-hd')
        const h2 = el('h2')
        h2.textContent = 'Configuración de Apuesta'
        hd.appendChild(h2)

        const bd = el('div', 'card-bd')

        // Buy points section
        const buySection = el('div', 'buy-section')
        const buyTitle = el('h3')
        buyTitle.textContent = 'Comprar Puntos'
        buySection.appendChild(buyTitle)

        const buyBtn = el('button', 'btn-secondary')
        buyBtn.textContent = 'Comprar 1000 puntos (10,000 pesos)'
        buyBtn.onclick = async () => {
            try {
                await api.buyPoints(1000)
                const userResponse = await api.getUser()
                currentUser = userResponse.user
                render(app)
            } catch (err: any) {
                alert(err.message)
            }
        }
        buySection.appendChild(buyBtn)

        // Betting section
        const betSection = el('div', 'bet-section')
        const betTitle = el('h3')
        betTitle.textContent = 'Hacer Apuesta'
        betSection.appendChild(betTitle)

        const betForm = el('div', 'bet-form')
        const horseSelect = el('select') as HTMLSelectElement
        horseSelect.className = 'bet-select'
        const horses = ['oros', 'copas', 'espadas', 'bastos']
        horses.forEach(horse => {
            const opt = el('option') as HTMLOptionElement
            opt.value = horse
            opt.textContent = horse.charAt(0).toUpperCase() + horse.slice(1)
            horseSelect.appendChild(opt)
        })

        const amountInput = el('input') as HTMLInputElement
        amountInput.type = 'number'
        amountInput.placeholder = 'Cantidad'
        amountInput.className = 'bet-input'
        amountInput.min = '1'
        amountInput.max = String(currentUser.points)

        const addBetBtn = el('button', 'btn-secondary')
        addBetBtn.textContent = 'Agregar Apuesta'
        addBetBtn.onclick = () => {
            const horse = horseSelect.value as Suit
            const amount = Number(amountInput.value)
            if (amount > 0 && amount <= currentUser!.points) {
                bets.push({ horse, amount })
                currentUser!.points -= amount
                amountInput.value = ''
                render(app)
            } else {
                alert('Cantidad inválida')
            }
        }

        betForm.append(horseSelect, amountInput, addBetBtn)
        betSection.appendChild(betForm)

        // Current bets
        if (bets.length > 0) {
            const betsList = el('div', 'bets-list')
            const betsTitle = el('h4')
            betsTitle.textContent = 'Apuestas Actuales'
            betsList.appendChild(betsTitle)

            bets.forEach((bet, index) => {
                const betItem = el('div', 'bet-item')
                betItem.innerHTML = `
                    <span>${bet.horse}: ${bet.amount} puntos</span>
                    <button class="btn-remove" onclick="removeBet(${index})">X</button>
                `
                betsList.appendChild(betItem)
            })
            betSection.appendChild(betsList)
        }

        // Start game section
        const controls = el('div', 'controls')
        const label = el('div', 'small')
        label.textContent = 'Selecciona la cantidad de caballos y comienza la carrera.'

        const select = el('select') as HTMLSelectElement
        ;[2, 3, 4].forEach((n) => {
            const opt = el('option') as HTMLOptionElement
            opt.value = String(n)
            opt.textContent = `${n} caballos`
            select.appendChild(opt)
        })
        select.value = '4'

        const btn = el('button', 'btn-primary')
        btn.textContent = 'Iniciar Carrera'
        btn.disabled = bets.length === 0
        btn.onclick = () => {
            state = newGame(Number(select.value))
            lastDrawn = null
            render(app)
        }

        controls.append(label, select, btn)

        bd.append(buySection, el('div', 'divider'), betSection, el('div', 'divider'), controls)
        card.append(hd, bd)
        container.appendChild(card)
        return
    }

    // MAIN GRID
    const grid = el('div', 'grid')
    container.appendChild(grid)

    // LEFT: TRACK
    const trackCard = el('div', 'card')
    const trackHd = el('div', 'card-hd')
    const trackTitle = el('h2')
    trackTitle.textContent = 'Pista'
    const metaTag = el('div', 'small')
    metaTag.innerHTML = `Meta: <strong>posición 7</strong> <span class="meta-label">🏁</span>`
    trackHd.append(trackTitle, metaTag)

    const trackBd = el('div', 'card-bd')

    const lanes = el('div', 'lanes')
    for (const h of state.horses) {
        const lane = el('div', 'lane')

        const top = el('div', 'lane-top')
        const name = el('div', 'lane-name')
        name.textContent = `${suitEmoji[h.suit]} ${h.suit.toUpperCase()}`
        const badge = el('div', 'badge')
        badge.textContent = h.finishedPlace ? `Lugar: ${h.finishedPlace}º` : `Posición: ${h.position}/7`
        top.append(name, badge)

        const prog = el('div', 'progress')
        const fill = el('div')
        fill.style.width = `${pct(h.position)}%`
        prog.appendChild(fill)

        const row = el('div', 'track')
        for (let i = 0; i <= 7; i++) {
            const c = el('div', 'cell')
            if (i >= 1 && i <= 7) c.classList.add('checkpoint')
            if (i === 7) c.classList.add('meta')
            c.textContent = i === h.position ? '🐎' : ''
            row.appendChild(c)
        }

        lane.append(top, prog, row)
        lanes.appendChild(lane)
    }

    // HITOS alineados debajo de las posiciones 1..7
    const cpsDivider = el('div', 'divider')
    const cpsHeader = el('div')
    const cpsH = el('h2')
    cpsH.style.margin = '0 0 10px 0'
    cpsH.style.fontSize = '14px'
    cpsH.style.textTransform = 'uppercase'
    cpsH.style.letterSpacing = '0.4px'
    cpsH.textContent = 'Hitos alineados (posiciones 1–7)'

    const cpsSmall = el('div', 'small')
    cpsSmall.textContent =
        'Cada hito está debajo de su posición. Cuando todos pasan un hito, se voltea y su palo retrocede 1 (sin bajar de 0).'

    cpsHeader.append(cpsH, cpsSmall)

    const cpsRow = el('div', 'checkpoint-row')

    // columna 0 (espacio)
    const spacer = el('div', 'checkpoint-slot')
    spacer.textContent = ''
    cpsRow.appendChild(spacer)

    // columnas 1..7
    for (let pos = 1; pos <= 7; pos++) {
        const cp = state.checkpoints[pos - 1]
        const slot = el('div', 'checkpoint-slot')

        const card = el('div', 'checkpoint-card-mini')
        if (cp.revealed) card.classList.add('revealed')

        const inner = el('div', 'checkpoint-inner')

        const front = el('div', 'checkpoint-front')
        front.classList.add(`suit-${cp.card.suit}`)

        const suitBig = el('div', 'checkpoint-suit')
        suitBig.textContent = suitEmoji[cp.card.suit]

        const rank = el('div', 'checkpoint-rank')
        rank.textContent = String(cp.card.rank)

        front.append(suitBig, rank)

        const back = el('div', 'checkpoint-back')
        back.textContent = '🂠'

        inner.append(front, back)
        card.appendChild(inner)

        const label = el('div', 'checkpoint-pos')
        label.textContent = `Pos ${pos}`

        slot.append(card, label)
        cpsRow.appendChild(slot)
    }

    trackBd.append(lanes, cpsDivider, cpsHeader, cpsRow)
    trackCard.append(trackHd, trackBd)
    grid.appendChild(trackCard)

    // RIGHT: CONTROLS + DECK + PODIUM + HISTORY
    const side = el('div')
    side.style.display = 'grid'
    side.style.gap = '16px'
    grid.appendChild(side)

    // Controls card
    const controlCard = el('div', 'card')
    const chd = el('div', 'card-hd')
    const ch2 = el('h2')
    ch2.textContent = 'Controles'
    const statusPill = el('div', 'pill')
    statusPill.textContent = `Estado: ${state.status}`
    chd.append(ch2, statusPill)

    const cbd = el('div', 'card-bd')
    const controls = el('div', 'controls')

    const btnStep = el('button', 'btn-primary')
    btnStep.textContent = 'Sacar carta'
    btnStep.disabled = state.status !== 'running'
    btnStep.onclick = () => {
        try {
            const { drawn } = stepDraw(state!)
            lastDrawn = drawn

            // Check if game finished
            if (state!.status === 'finished' && state!.places.length > 0) {
                const winner = state!.places[0] // First place
                const winningBet = bets.find(bet => bet.horse === winner)
                if (winningBet && currentUser) {
                    const winnings = winningBet.amount * 5
                    currentUser.points += winnings
                    alert(`¡Ganaste! ${winner} ganó. Recibes ${winnings} puntos.`)
                } else {
                    alert(`${state!.places[0]} ganó. Mejor suerte la próxima vez.`)
                }
            }
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e))
        }
        render(app)
    }

    const btnReset = el('button', 'btn-danger')
    btnReset.textContent = 'Reiniciar'
    btnReset.onclick = () => {
        // Return bet points
        if (currentUser) {
            bets.forEach(bet => {
                currentUser!.points += bet.amount
            })
        }
        state = null
        lastDrawn = null
        bets = []
        render(app)
    }

    controls.append(btnStep, btnReset)

    const kv = el('div', 'kv')
    const r1 = el('div', 'kv-row')
    r1.innerHTML = `<span>Cartas en mazo</span><strong>${state.deck.length}</strong>`
    const r2 = el('div', 'kv-row')
    r2.innerHTML = `<span>Jugadores</span><strong>${state.players}</strong>`
    const r3 = el('div', 'kv-row')
    r3.innerHTML = `<span>Hito por voltear</span><strong>${Math.min(
        state.nextCheckpointToFlip + 1,
        7
    )}/7</strong>`
    kv.append(r1, r2, r3)

    cbd.append(controls, el('div', 'divider'), kv)
    controlCard.append(chd, cbd)
    side.appendChild(controlCard)

    // Deck card (mazo + última carta)
    const deckCard = el('div', 'card')
    const dhd = el('div', 'card-hd')
    const dh2 = el('h2')
    dh2.textContent = 'Mazo'
    const dmeta = el('div', 'small')
    dmeta.textContent = `${state.deck.length} cartas`
    dhd.append(dh2, dmeta)

    const dbd = el('div', 'card-bd')
    const deckWrap = el('div', 'deck-wrap')

    const stack = el('div', 'deck-stack')
    const stackLabel = el('div', 'small')
    stackLabel.textContent = 'Pila (boca abajo)'
    stack.appendChild(stackLabel)

    const last = el('div', 'last-drawn')
    const lastTitle = el('div', 'small')
    lastTitle.textContent = 'Última carta robada'

    const lastCard = el('div', 'last-card')
    if (!lastDrawn) {
        lastCard.textContent = '—'
        lastCard.classList.add('empty')
    } else {
        lastCard.classList.add(`suit-${lastDrawn.suit}`)
        lastCard.innerHTML = `
      <div class="last-suit">${suitEmoji[lastDrawn.suit]}</div>
      <div class="last-rank">${lastDrawn.rank}</div>
      <div class="last-name">${lastDrawn.suit.toUpperCase()}</div>
    `
    }

    last.append(lastTitle, lastCard)
    deckWrap.append(stack, last)
    dbd.append(deckWrap)

    deckCard.append(dhd, dbd)
    side.appendChild(deckCard)

    // Podium
    const podium = el('div', 'card')
    const phd = el('div', 'card-hd')
    const ph2 = el('h2')
    ph2.textContent = 'Podio'
    phd.appendChild(ph2)

    const pbd = el('div', 'card-bd')
    if (state.places.length === 0) {
        const msg = el('div', 'small')
        msg.textContent = 'Aún no hay llegadas.'
        pbd.appendChild(msg)
    } else {
        const ol = el('ol', 'list')
        state.places.slice(0, 3).forEach((s, i) => {
            const li = el('li')
            li.textContent = `${i + 1}º: ${suitEmoji[s]} ${s}`
            ol.appendChild(li)
        })
        pbd.appendChild(ol)
    }
    podium.append(phd, pbd)
    side.appendChild(podium)

    // History
    const history = el('div', 'card')
    const hhd = el('div', 'card-hd')
    const hh2 = el('h2')
    hh2.textContent = 'Historial'
    const hsmall = el('div', 'small')
    hsmall.textContent = 'Últimos 30 eventos'
    hhd.append(hh2, hsmall)

    const hbd = el('div', 'card-bd')
    const scroll = el('div', 'scroll')
    const ul = el('ul', 'list')
    state.history.slice(-30).forEach((line) => {
        const li = el('li')
        li.textContent = line
        ul.appendChild(li)
    })
    scroll.appendChild(ul)
    hbd.appendChild(scroll)

    history.append(hhd, hbd)
    side.appendChild(history)
}

export async function initUI() {
    const app = document.querySelector<HTMLDivElement>('#app')
    if (!app) throw new Error('No existe #app')

    // Check if user is logged in
    if (api.isLoggedIn()) {
        try {
            const response = await api.getUser()
            currentUser = response.user
        } catch (err) {
            // Token invalid, logout
            api.logout()
        }
    }

    render(app)
}