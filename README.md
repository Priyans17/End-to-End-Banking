<!-- # Aura Financial Platform

A full-stack MERN banking and eCommerce demo application built for showcasing BrowserStack testing capabilities.

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS (port 3000)
- **Backend**: Express.js + Node.js (port 5000)
- **Database**: MongoDB Atlas
- **Payments**: Stripe (Payment)
- **Auth**: JWT + bcrypt

## Features

- Banking (accounts, transfers, beneficiaries, bill pay, cards, statements)
- Equity Trading (NYSE/NASDAQ/LSE/Euronext stocks, portfolio, orders)
- Mutual Funds (explore, lump sum invest, SIP manager)
- Insurance (compare plans, apply, my policies, claims)
- Marketplace (shop, cart, coupon codes, Stripe checkout)
- Notifications (real-time bell with unread count)
- USD currency, international banking

## Project Structure

```
E2E Banking/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── ...
│   ├── vercel.json    # Vercel deployment config
│   └── package.json
└── server/            # Express API
    ├── models/
    ├── routes/
    ├── middleware/
    ├── render.yaml    # Render deployment config
    └── package.json
```

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account (test keys)

### Setup

**1. Clone the repo**
```bash
git clone https://github.com/Priyans17/E2E_Banking.git
cd E2E_Banking
```

**2. Backend setup**
```bash
cd server
npm install
```

Create `server/.env` (never commit this file):
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

Start the backend:
```bash
npm run dev
```

**3. Frontend setup**
```bash
cd frontend
npm install
```

Create `frontend/.env.local` (never commit this file):
```
VITE_STRIPE_PK=pk_test_your_stripe_publishable_key
```

Start the frontend:
```bash
npm run dev
```

**4. Open** http://localhost:3000

### Test Payment Cards (Stripe)
| Card | Number |
|------|--------|
| Visa (success) | 4242 4242 4242 4242 |
| Mastercard | 5555 5555 5555 4444 |
| Declined | 4000 0000 0000 0002 |
| 3D Secure | 4000 0025 0000 3155 |

Expiry: any future date · CVV: any 3 digits · ZIP: any
 -->
