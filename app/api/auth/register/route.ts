import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { email, password, name } = parsed.data;

    await connectToDatabase();

    console.log("Registration attempt for email:", email);
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log("User already exists:", existing.email);
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    const user = await User.create({ email: email.toLowerCase(), password: hashed, name });
    console.log("User created with ID:", user._id);

    return NextResponse.json({  id: user._id.toString(), email: user.email, name: user.name , createdAt: user.createdAt , data : user }, { status: 201 });
  } catch (err: any) {
    console.error("/api/auth/register error", err);
    if (err?.name === "MongooseServerSelectionError" || err?.message?.includes("buffering timed out") || err?.message?.includes("IP")) {
      return NextResponse.json({
        error: "Database connection failed. Please ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) in Network Access settings.",
        details: err?.message,
      }, { status: 500 });
    }
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
