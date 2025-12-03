import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/apiError";
const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: "2022-11-15",
});

export async function createStripePaymentIntent(
  amount: number,
  currency = "usd",
  metadata: Record<string, string> = {}
) {
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // in cents
    currency,
    metadata,
  });
  return intent;
}

/**
 * Called by webhook handler when stripe notifies of success.
 * Updates Payment and Order statuses inside a transaction.
 */

export async function handleStripePaymentSucceeded(paymentIntentId: string) {
  // Find Payment by transactionId (we store payment.transactionId = stripe paymentIntent id)
  const payment = await prisma.payment.findUnique({
    where: {
      transactionId: paymentIntentId,
    },
  });
  if (!payment) throw ApiError.notFound("Payment record not found");
  // If already successful , no-op
  if (payment.status === "successful") return payment;
  const result = await prisma.$transaction(async (tx) => {
    // Update payment status
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: "successful" },
      include: { order: true },
    });
    // Update order status to paid
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "paid" },
    });
    return updatedPayment;
  });
  return result;
}

export async function handleStripePaymentFailed(paymentIntentId: string) {
  const payment = await prisma.payment.findUnique({
    where: {
      transactionId: paymentIntentId,
    },
  });
  if (!payment) throw ApiError.notFound("Payment record not found");
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "failed",
    },
  });
  return updated;
}
