# Aura — End-to-End Banking Platform

A full-stack financial platform built with the MERN stack. Covers banking, investments, insurance, and an integrated marketplace with Stripe payments.

Live: https://bankaura.vercel.app

---

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Payments: Stripe (Payment Element)
- Auth: JWT

---

## Features

- Banking — accounts, transfers, bill payments, cards
- Equity Trading — international stocks (NYSE, NASDAQ, LSE)
- Mutual Funds — explore, invest, SIP manager
- Insurance — compare plans, apply, manage policies
- Marketplace — shop, cart, coupon codes, checkout
- Notifications — real-time bell with unread count

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A MongoDB Atlas account
- A Stripe account (test keys)

### Clone the repository

```bash
git clone https://github.com/Priyans17/End-to-End-Banking.git
cd End-to-End-Banking
```

### Backend setup

```bash
cd server
npm install
```

Create a file named `.env` inside the `server` folder. Use `server/.env.example` as a reference — fill in your own values. Never commit this file.

```bash
npm run dev
```

Backend runs on http://localhost:5000

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

The frontend proxies all `/api` requests to the backend automatically in development.

---

## Environment Variables

See `server/.env.example` for the full list of required backend variables.

For the frontend, create `frontend/.env.local` and add:

```
VITE_STRIPE_PK=your_stripe_publishable_key
```

---

## Deployment

- Backend: Render (root directory: `server`)
- Frontend: Vercel (root directory: `frontend`)

The `frontend/vercel.json` file handles SPA routing and API proxying to the backend.

---

## License

MIT
