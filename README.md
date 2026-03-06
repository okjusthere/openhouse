# OpenHouse

OpenHouse is a Google-authenticated, AI-native open house operations platform for North American real estate teams. It includes branded sign-in flows, lead scoring, optional enrichment, seller-ready reporting, and self-serve Pro billing.

## Core Stack

- Next.js App Router
- NextAuth v5 with Google OAuth only
- MySQL + Drizzle ORM
- Azure OpenAI for scoring, follow-up generation, and property Q&A
- Stripe Checkout + Billing Portal for Pro subscriptions
- Resend for transactional follow-up email delivery

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill the values:

```bash
cp .env.local .env.development.local
```

3. Run database schema sync:

```bash
npx drizzle-kit push --config=drizzle.config.ts
```

4. Start the app:

```bash
npm run dev
```

## Required Environment Variables

### Base App

```bash
DATABASE_URL=mysql://...
AUTH_SECRET=...
NEXTAUTH_URL=https://openhouse.kevv.ai
NEXT_PUBLIC_APP_URL=https://openhouse.kevv.ai
NEXT_PUBLIC_SITE_URL=https://openhouse.kevv.ai
AUTH_TRUST_HOST=true
```

### Google Auth

Use only one canonical pair:

```bash
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

Google Cloud OAuth redirect URI:

```text
https://openhouse.kevv.ai/api/auth/callback/google
```

### Stripe Billing

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Stripe is server-driven in this app, so a publishable key is not currently required.

### AI and Enrichment

```bash
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://<resource>.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini
PDL_API_KEY=...
```

### Transactional Email

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=OpenHouse <noreply@openhouse.kevv.ai>
RESEND_REPLY_TO_EMAIL=agent@openhouse.kevv.ai
```

If Resend is missing, AI follow-up still generates a draft, but the platform will not send the email.

## Stripe Setup

1. In Stripe, create a product named `OpenHouse Pro`.
2. Add one recurring monthly price at `$29/month`.
3. Copy the resulting price ID into `STRIPE_PRO_PRICE_ID`.
4. Add the secret API key to `STRIPE_SECRET_KEY`.
5. Create a webhook endpoint:

```text
https://openhouse.kevv.ai/api/billing/webhook
```

6. Subscribe the webhook to these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
7. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.
8. Deploy and test the upgrade flow from `/dashboard/settings`.

## Commercial Behavior

- Free plan:
  - 3 events / month
  - 50 sign-ins / month
  - QR and kiosk capture
  - Basic reporting
- Pro plan:
  - Unlimited events and sign-ins
  - AI lead scoring
  - 100 PDL enrichments / month
  - 500 property Q&A messages / month
  - AI follow-up generation and optional email sending
  - Detailed seller reporting

## Production Notes

- Google auth is the only account access method.
- Stripe webhooks control subscription state and Pro entitlements.
- Public property Q&A and sign-in endpoints include baseline request throttling.
- AI and PDL features degrade safely if their environment variables are missing.
