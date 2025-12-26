import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "../../../../lib/stripe";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { getMonthKey } from "../../../../lib/utils";

const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = rateLimit.get(ip) ?? [];
  const fresh = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  fresh.push(now);
  rateLimit.set(ip, fresh);
  return fresh.length > RATE_LIMIT_MAX;
}

async function handleSubscription(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const price = subscription.items.data[0]?.price;
  const amountCents = price?.unit_amount ?? 0;
  const userId = subscription.metadata.user_id || "";
  if (!userId) return;

  const updates = {
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    amount_cents: amountCents,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };

  await admin.from("billing").upsert(updates);

  if (amountCents > 0) {
    const monthKey = getMonthKey();
    await admin
      .from("monthly_spend")
      .upsert({
        user_id: userId,
        month_key: monthKey,
        amount_cents: amountCents,
        updated_at: new Date().toISOString()
      });
  }
}

export async function POST(request: Request) {
  const ip = headers().get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const signature = headers().get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    return NextResponse.json({ error: `Webhook Error: ${(error as Error).message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await handleSubscription(subscription);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const admin = createAdminClient();
        await admin
          .from("billing")
          .update({ status: subscription.status, updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
