import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  downgradeUserToFreeByCustomer,
  syncSubscriptionState,
} from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function getStripeEvent(requestBody: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  const stripe = getStripe();
  return stripe.webhooks.constructEvent(requestBody, signature, webhookSecret);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = getStripeEvent(rawBody, signature);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && typeof session.subscription === "string") {
          const stripe = getStripe();
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await syncSubscriptionState(subscription);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionState(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (customerId) {
          await downgradeUserToFreeByCustomer(customerId);
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("[Stripe webhook] Handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

