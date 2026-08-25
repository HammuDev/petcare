import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongoose";
import Transaction from "../../../models/Transaction";
import User from "../../../models/User";

const MINUTES_PACKAGES = {
  "20": { minutes: 20, price: 499 },
  "40": { minutes: 40, price: 999 },
  "60": { minutes: 60, price: 1499 },
};

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, userId } = await req.json();

    if (!paymentIntentId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the payment intent to retrieve minutes and amount info
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log("Retrieved PaymentIntent:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      payment_method: paymentIntent.payment_method,
      customer: paymentIntent.customer,
      amount: paymentIntent.amount,
      metadata: paymentIntent.metadata,
    });

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const minutesStr = paymentIntent.metadata?.minutes;
    const type = paymentIntent.metadata?.type;
    const amount = paymentIntent.amount;
    const customerId = paymentIntent.customer as string;

    if (type !== "minutes" || !minutesStr || !amount) {
      return NextResponse.json(
        { error: "Invalid payment intent for minutes purchase" },
        { status: 400 }
      );
    }

    // If we have a customer ID from the PaymentIntent, ensure it's saved to the user
    if (customerId) {
      const user = await User.findById(userId);
      if (user && !user.stripeCustomerId) {
        user.stripeCustomerId = customerId;
        await user.save();
      }
    }

    const minutesPackage = MINUTES_PACKAGES[minutesStr as keyof typeof MINUTES_PACKAGES];
    if (!minutesPackage) {
      return NextResponse.json(
        { error: "Invalid minutes package" },
        { status: 400 }
      );
    }

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      plan: `${minutesPackage.minutes} Minutes`,
      amount,
      currency: "usd",
      stripePaymentIntentId: paymentIntent.id,
      status: "completed",
    });

    if (paymentIntent.status === "succeeded") {
      // Get the charge details
      const charges = await stripe.charges.list({
        payment_intent: paymentIntent.id,
        limit: 1,
      });

      console.log("Charges retrieved:", {
        count: charges.data.length,
        paymentIntentId: paymentIntent.id,
      });

      if (charges.data.length > 0) {
        const charge = charges.data[0];

        // Update transaction with charge details
        transaction.stripeChargeId = charge.id;
        if (charge.payment_method_details?.card) {
          transaction.cardLast4 = charge.payment_method_details.card.last4 || undefined;
          transaction.cardBrand = charge.payment_method_details.card.brand || undefined;
        }
        await transaction.save();

        // IMPORTANT: Ensure the payment method is saved for future use
        if (charge.payment_method && customerId) {
          try {
            console.log("Processing payment method for charge:", charge.id);
            console.log("Payment method ID from charge:", charge.payment_method);
            console.log("Customer ID:", customerId);

            // Retrieve the payment method to check its status
            const paymentMethod = await stripe.paymentMethods.retrieve(charge.payment_method as string);
            console.log("Retrieved payment method:", {
              id: paymentMethod.id,
              customer: paymentMethod.customer,
              type: paymentMethod.type,
              created: paymentMethod.created,
            });

            // Attach payment method to customer if not already attached
            if (!paymentMethod.customer) {
              console.log("Attaching unattached payment method to customer:", customerId);
              await stripe.paymentMethods.attach(charge.payment_method as string, {
                customer: customerId,
              });
              console.log("Payment method attached successfully");
            } else if (paymentMethod.customer !== customerId) {
              console.log("Payment method attached to different customer, reattaching to:", customerId);
              await stripe.paymentMethods.attach(charge.payment_method as string, {
                customer: customerId,
              });
              console.log("Payment method reattached successfully");
            } else {
              console.log("Payment method already attached to correct customer:", customerId);
            }
          } catch (pmError) {
            console.error("Error handling payment method:", pmError);
          }
        } else {
          console.log("No payment method found in charge or no customerId");
          console.log("Charge details:", {
            id: charge.id,
            payment_method: charge.payment_method,
            customer: customerId,
          });
        }

        // Add minutes to user's total_time
        console.log("About to update user with ID:", userId);
        const user = await User.findById(userId);
        if (user) {
          console.log("User found:", user);
          const currentMinutes = user.total_time || 0;
          user.total_time = currentMinutes + minutesPackage.minutes;
          user.subscription_date = new Date();
          user.subscription_amount = minutesPackage.price / 100; // Convert cents to dollars
          // Set default renewal setting if not already set
          if (user.renew === undefined) {
            user.renew = true;
          }
          user.markModified('subscription_date');
          user.markModified('subscription_amount');
          user.markModified('renew');
          await user.save();
          console.log("User updated:", user);
        } else {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      transactionId: transaction._id,
      minutesAdded: minutesPackage.minutes,
    });

  } catch (error: any) {
    console.error("Minutes purchase processing error:", error);

    // Handle specific Stripe errors
    if (error.type === "StripeCardError") {
      return NextResponse.json(
        { error: error.message || "Your card was declined. Please try a different payment method." },
        { status: 400 }
      );
    }

    if (error.type === "StripeRateLimitError") {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a moment." },
        { status: 429 }
      );
    }

    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: "Invalid payment information. Please check your details and try again." },
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

    // Handle database errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Invalid data provided. Please check your information." },
        { status: 400 }
      );
    }

    if (error.name === "MongoNetworkError" || error.name === "MongoTimeoutError") {
      return NextResponse.json(
        { error: "Database temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Minutes purchase failed. Please try again or contact support if the issue persists." },
      { status: 500 }
    );
  }
}
