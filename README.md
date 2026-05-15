# OnTime

OnTime is a Prague public transport monitoring project that connects a web frontend, a Node.js backend, and a hardware gateway/tower system.

The app allows users to register gateways, view connected towers, assign stops and lines, and monitor live transport status for selected assignments.

## Architecture

- `client/` — React + TypeScript frontend using Vite
- `server/` — Node.js Express backend with JWT authentication
- `gateway/` — Node-RED flows for gateway integration
- `tower/` — Hardware firmware and tower configuration
- `docs/` — API specs and design notes

## Features

- User signup/login with JWT authentication
- Stop autocomplete and line selection for Prague transport
- Gateway registration and tower management
- Assignment tracking per tower
- Gateway detail view with tower assignment summaries
- Live device monitoring via battery and last-seen status

## Getting Started

### Prerequisites

- Node.js
- npm
- Docker (optional, for PostgreSQL)

### Backend Setup

1. Open a terminal and go to the backend folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in `server/` with at least:
   ```env
   SERVER_PORT=3000
   API_KEY=<your_api_key>
   CLIENT_URL=http://localhost:5173
   PGPASSWORD=<your_postgres_password>
   ```

4. Start the backend:
   ```bash
   npm start
   ```

### Frontend Setup

1. Open a terminal and go to the frontend folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend:
   ```bash
   npm run dev
   ```

4. Open the local URL shown by Vite, usually:
   ```bash
   http://localhost:5173
   ```

### Optional Database Setup

If you want to run PostgreSQL locally using Docker:

1. Open a terminal in `server/`
2. Run:
   ```bash
   docker compose up -d
   ```

This starts a PostgreSQL container configured by `server/docker-compose.yml`.

## Available Scripts

### Backend

- `npm start` — start the server
- `npm run dev` — start the server with file watching

### Frontend

- `npm run dev` — run Vite development server
- `npm run build` — build production assets
- `npm run preview` — preview the production build

## Project Structure

- `client/src/` — React pages, API client, routing, and styles
- `server/app.js` — main Express application
- `server/src/auth/` — authentication controllers and JWT
- `server/src/gateways/` — gateway API and database services
- `server/src/towers/` — tower registration and health updates
- `server/src/dao/` — database access layer
- `docs/` — API documentation and system notes

## Notes

- The frontend uses JWT stored in `localStorage` under `ontime_jwt`.
- Gateway data is loaded from `GET /users/:userId/gateways/list`.
- Gateway details are loaded from `GET /gateways/:gatewayId/status`.
- The frontend currently expects the backend at `http://localhost:3000`.

## Useful Links

- `docs/client-server.md` — documented API endpoints and frontend integration
- `docs/server-pid.md` — PID data fetch and transport logic
- `docs/db-schema.md` — database model descriptions
- `Vision.md` — project vision and roadmap

---

Built for OnTime public transport monitoring in Prague.
