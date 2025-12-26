import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { createRouteSupabaseClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { amount?: number };
  const amount = Math.max(Number(body.amount ?? 0), 0.1);
  const unitAmount = Math.max(Math.round(amount * 100), 10);

  const admin = createAdminClient();
  const { data: billing } = await admin
    .from("billing")
    .select("stripe_customer_id,stripe_subscription_id,status")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = billing?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id }
    });
    customerId = customer.id;
    await admin.from("billing").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      status: "incomplete"
    });
  }

  if (billing?.stripe_subscription_id && billing.status && ["active", "trialing", "past_due"].includes(billing.status)) {
    const subscription = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);
    const item = subscription.items.data[0];
    const productId = typeof item.price.product === "string" ? item.price.product : item.price.product.id;
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency: "usd",
      recurring: { interval: "month" }
    });

    await stripe.subscriptions.update(subscription.id, {
      items: [{ id: item.id, price: price.id }],
      proration_behavior: "create_prorations",
      metadata: { user_id: user.id }
    });

    return NextResponse.json({ updated: true });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: "The Board Monthly Status"
          },
          recurring: {
            interval: "month"
          }
        },
        quantity: 1
      }
    ],
    subscription_data: {
      metadata: { user_id: user.id }
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pay?status=cancel`
  });

  return NextResponse.json({ url: session.url });
}

export async function PATCH() {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: billing } = await admin
    .from("billing")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!billing?.stripe_customer_id) {
    return NextResponse.json({ error: "No customer found." }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: billing.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`
  });

  return NextResponse.json({ url: portal.url });
}
