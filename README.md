# The Board

A monthly social experiment where money = status. Users subscribe (minimum $0.10/month) to appear on leaderboards that reset every month. The #1 global spender each month enters the Hall of Fame.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Stripe subscriptions
- Vercel-ready

## Local Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Create a Supabase project
1. Create a project at https://supabase.com
2. In the SQL editor, run `sql/schema.sql` from this repo.
3. Copy the project URL and anon key for `.env.local`.
4. Create a service role key (Settings → API → service_role key).

### 3) Configure Stripe
1. Create a Stripe account at https://dashboard.stripe.com
2. (Optional) Create a product + price for documentation purposes:
   - Products → Add product → name it “The Board Monthly Status”.
   - Add a recurring monthly price. (The app also supports dynamic pricing via Checkout price_data.)
3. Set up a webhook endpoint:
   - URL: `https://YOUR_DOMAIN.com/api/stripe/webhook`
   - Events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_succeeded`
4. Copy the webhook signing secret.

### 4) Environment variables
Copy `.env.local.example` to `.env.local` and fill in values:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5) Run the app
```bash
npm run dev
```

## Deployment (Vercel)
1. Push the repo to GitHub.
2. Create a new Vercel project and import the repo.
3. Add the same environment variables in Vercel.
4. Update the Stripe webhook URL to the Vercel domain.

## Key App Routes
- `/` Landing page
- `/leaderboard` Leaderboard tabs
- `/pay` Join + subscribe
- `/profile` User profile & subscription
- `/hall-of-fame` Hall of Fame

## Notes
- Leaderboards query `monthly_spend` for the current UTC month key (YYYY-MM).
- Webhook updates `billing` and `monthly_spend` from Stripe subscription data.
- Hall of Fame should be updated monthly (cron or manual job). This MVP stores winners in `hall_of_fame` and surfaces them on `/hall-of-fame`.
