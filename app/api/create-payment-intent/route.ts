import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongoose";
import User from "../../../models/User";

const PLAN_PRICES = {
  basic: 999, // $9.99
  premium: 1999, // $19.99
  professional: 2999, // $29.99
};

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json();

    if (!plan || !PLAN_PRICES[plan as keyof typeof PLAN_PRICES]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];

    await connectToDatabase();

    // Get user and check if they already have a Stripe customer ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let customerId = user.stripeCustomerId;

    // Create customer if user doesn't have one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user._id.toString(),
        },
      });

      customerId = customer.id;

      // Save customer ID to user
      user.stripeCustomerId = customerId;
      await user.save();
    }
    // Create PaymentIntent with customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: customerId,
      setup_future_usage: "off_session",
      metadata: {
        plan,
        userId: userId,
      },
    });
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customerId,
    });

  } catch (error: any) {
    console.error("PaymentIntent creation error:", error);

    // Handle specific Stripe errors
    if (error.type === "StripeCardError") {
      return NextResponse.json(
        { error: error.message || "Invalid card information." },
        { status: 400 }
      );
    }

    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: "Invalid payment request. Please check your plan selection." },
        { status: 400 }
      );
    }

    if (error.type === "StripeAPIError") {
      return NextResponse.json(
        { error: "Payment service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    if (error.type === "StripeConnectionError") {
      return NextResponse.json(
        { error: "Network error. Please check your connection and try again." },
        { status: 503 }
      );
    }

    if (error.type === "StripeAuthenticationError") {
      return NextResponse.json(
        { error: "Payment service configuration error. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create payment intent. Please try again or contact support if the issue persists." },
      { status: 500 }
    );
  }
}
