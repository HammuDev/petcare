import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signAuthToken, setAuthCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;

    await connectToDatabase();

    console.log("Login attempt for email:", email);
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User found:", user ? "Yes" : "No");
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    console.log("Stored password hash:", user.password);
    const match = await bcrypt.compare(password, user.password);
    console.log("Password match:", match);
    if (!match) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signAuthToken({ sub: user._id.toString(), email: user.email, name: user.name });
    await setAuthCookie(token);

    return NextResponse.json({ id: user._id.toString(), email: user.email, name: user.name , createdAt: user.createdAt , data : user });
  } catch (err: any) {
    console.error("/api/auth/login error", err);
    if (err?.name === "MongooseServerSelectionError" || err?.message?.includes("buffering timed out") || err?.message?.includes("IP")) {
      return NextResponse.json({
        error: "Database connection failed. Please ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) in Network Access settings.",
        details: err?.message,
      }, { status: 500 });
    }
    if (err?.message?.includes("JWT_SECRET")) {
      return NextResponse.json({
        error: "JWT_SECRET is not configured in Vercel Environment Variables.",
      }, { status: 500 });
    }
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
