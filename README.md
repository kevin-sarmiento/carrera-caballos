# Carrera de Caballos - Horse Racing Betting Game

A real-time horse racing betting game built with TypeScript, Vite, Express, and Socket.io.

## 🚀 Deploy to Render

### Paso 1: Preparar el repositorio
1. **Asegúrate de que el build funciona:**
   ```bash
   npm install
   npm run build
   ```

2. **Sube tu código a GitHub** (asegúrate de incluir todos los archivos necesarios)

### Paso 2: Desplegar en Render

#### Opción A: Dashboard de Render
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en "New" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura el servicio:
   - **Runtime:** `Node.js`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. Agrega variables de entorno:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Una clave secreta segura (genera una aleatoria)
   - `PORT`: `10000`
6. Haz clic en "Create Web Service"

#### Opción B: Usando render.yaml
1. **Sube el archivo `render.yaml`** a tu repositorio
2. Ve a Render Dashboard
3. Conecta tu repositorio
4. Render detectará automáticamente la configuración
5. Despliega

### Paso 3: Verificar el despliegue
- Tu app estará disponible en `https://tu-app.onrender.com`
- La base de datos SQLite se creará automáticamente
- Los usuarios pueden registrarse y empezar a jugar

### Variables de Entorno Requeridas
```
NODE_ENV=production
JWT_SECRET=tu-clave-secreta-muy-segura-aqui
PORT=10000
```

### Notas Importantes
- Render tiene un límite de tiempo de respuesta de 30 segundos para free tier
- La base de datos SQLite se reinicia cuando el servicio se detiene
- Para producción real, considera usar PostgreSQL en Render

## Features

- User registration and authentication
- Points system (start with 1000 points)
- Betting on horse races (win 5x your bet)
- Buy points (1000 points for 10,000 pesos)
- SQLite database for persistence
- Real-time multiplayer support (up to 4 players)

## Local Development

### Requirements

- Node.js 16+
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run server
   ```
4. In another terminal, start the frontend:
   ```bash
   npm run dev
   ```

## How to Play

1. Register or login with a username and password
2. Buy points if needed (1000 points = 10,000 pesos)
3. Place bets on horses (oros, copas, espadas, bastos)
4. Start the race
5. Draw cards to advance horses
6. Win 5x your bet if your horse wins!

## API Endpoints

- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /user` - Get user info
- `POST /buy-points` - Purchase points

## Technologies Used

- Frontend: TypeScript, Vite, HTML/CSS
- Backend: Node.js, Express, Socket.io
- Database: SQLite
- Authentication: JWT
- Password Hashing: bcryptjs
- Hosting: Render