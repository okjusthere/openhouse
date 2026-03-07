# OpenHouse

OpenHouse is a Google-authenticated, AI-native open house operations platform for North American real estate teams. It includes branded sign-in flows, lead scoring, optional enrichment, seller-ready reporting, and self-serve Pro billing.

## Core Stack

- Next.js App Router
- NextAuth v5 with Google OAuth only
- MySQL + Drizzle ORM
- Azure OpenAI for scoring, follow-up generation, and property Q&A
- Stripe Checkout + Billing Portal for Pro subscriptions
- Resend for transactional follow-up email delivery
- External listing data service for MLS and address-based property import

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
GMAIL_TOKEN_ENCRYPTION_KEY=... # optional, otherwise AUTH_SECRET is used
```

Google Cloud OAuth redirect URIs:

```text
https://openhouse.kevv.ai/api/auth/callback/google
https://openhouse.kevv.ai/api/integrations/gmail/callback
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

### Listing Import

OpenHouse can prefill a new event from a listing service using three flows:

- `Import by MLS #`
- `Import by Address`
- `Upload Flyer / PDF`

Configure the listing service adapter with:

```bash
LISTING_DATA_API_URL=https://your-listing-service.example.com
LISTING_DATA_API_KEY=...
```

For your onekey/BBO service, OpenHouse also accepts these aliases directly:

```bash
BBO_BASE_URL=https://onekey.kevv.ai
BBO_API_KEY=bbo_sk_xxx
```

When `BBO_BASE_URL` is present, the MLS import path defaults to:

```bash
/api/v1/listings/:mlsId
```

The default adapter expects:

- `GET /api/v1/listings/mls/:mlsId` for the legacy listing service
- `GET /api/v1/listings/:mlsId` when using the onekey/BBO alias env
- `POST /api/v1/search`

If your service uses different paths, override them:

```bash
LISTING_DATA_MLS_LOOKUP_PATH=/custom/mls/:mlsId
LISTING_DATA_ADDRESS_SEARCH_PATH=/custom/search
```

The adapter sends both `X-API-Key` and `Authorization: Bearer ...` headers for compatibility with existing internal services.

### Transactional Email

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=OpenHouse <noreply@openhouse.kevv.ai>
RESEND_REPLY_TO_EMAIL=agent@openhouse.kevv.ai
```

If Resend is missing, AI follow-up still generates a draft, but the platform will not send the email.

### Optional Gmail Direct Send

OpenHouse can optionally send Pro follow-up emails directly from an agent Gmail inbox. This is separate from Google sign-in and uses an additional consent flow inside `/dashboard/settings`.

- Required env:

```bash
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
GMAIL_TOKEN_ENCRYPTION_KEY=... # recommended
```

- Required Google OAuth redirect URI:

```text
https://openhouse.kevv.ai/api/integrations/gmail/callback
```

- Behavior:
  - Agent connects a Gmail inbox from Settings
  - Follow-up delivery can be toggled between `Direct Gmail send` and `Platform email (Resend)`
  - If Gmail delivery fails, OpenHouse falls back to Resend when configured
  - If both Gmail and Resend fail, OpenHouse stores a draft instead of dropping the follow-up

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
- Gmail direct send is optional and only affects follow-up delivery, not sign-in.
- Stripe webhooks control subscription state and Pro entitlements.
- Public property Q&A and sign-in endpoints include baseline request throttling.
- AI and PDL features degrade safely if their environment variables are missing.
- Listing import gracefully degrades if `LISTING_DATA_API_URL` or `LISTING_DATA_API_KEY` is missing.
