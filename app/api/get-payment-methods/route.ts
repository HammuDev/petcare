import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongoose";
import User from "../../../models/User";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    console.log("get-payment-methods called with userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    await connectToDatabase();

    // Get user and check if they have a Stripe customer ID
    const user = await User.findById(userId);
    console.log("User found:", user ? "YES" : "NO");
    console.log("User details:", {
      _id: user?._id,
      email: user?.email,
      stripeCustomerId: user?.stripeCustomerId,
      total_time: user?.total_time,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.stripeCustomerId) {
      console.log("No stripeCustomerId found for user");
      return NextResponse.json({
        hasCustomer: false,
        paymentMethods: [],
      });
    }

    // Fetch payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    console.log("Stripe payment methods response:", {
      hasMore: paymentMethods.has_more,
      count: paymentMethods.data.length,
      methods: paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
        } : null,
        customer: pm.customer,
      })),
    });

    return NextResponse.json({
      hasCustomer: true,
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        card: {
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          exp_month: pm.card?.exp_month,
          exp_year: pm.card?.exp_year,
        },
      })),
    });

  } catch (error: any) {
    console.error("Error fetching payment methods:", error);

    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: "Invalid request to payment service" },
        { status: 400 }
      );
    }

    if (error.type === "StripeAPIError") {
      return NextResponse.json(
        { error: "Payment service temporarily unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}
