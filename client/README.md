# OnTime Web Client

A local React website frontend for OnTime.

## Setup

1. In `client-web/`, run:
   ```bash
   npm install
   ```

2. Start the frontend locally:
   ```bash
   npm run dev
   ```

3. Open the local URL shown by Vite.

## Backend

The web client uses the existing backend at `http://localhost:3000`.
Make sure the server is running before using the frontend.

## Features

- Stop autocomplete using `/trieData`
- Stop details and line selection using `/stopGroups/:id`
- Assignment creation using `/addStop`
