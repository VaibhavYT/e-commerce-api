import { NextRequest } from "next/server";
import { withErrorHandling } from "@/utils/withErrorHandling";
import { apiSuccess } from "@/lib/apiResponse";
import {
  handleStripePaymentSucceeded,
  handleStripePaymentFailed,
} from "@/services/payment.services";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: "2022-11-15",
});
export const POST = withErrorHandling(async (req: NextRequest) => {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await handleStripePaymentSucceeded(intent.id);
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await handleStripePaymentFailed(intent.id);
      break;
    }
    default:
      //Ignore other events
      break;
  }
  return apiSuccess({ received: true });
});
// For webhooks we recommend Edge runtime off ( Node runtime)
export const runtime = "node";
