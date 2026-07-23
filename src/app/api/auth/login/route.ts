import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/hash";
import { auth } from "@/lib/auth";
import { createHmac } from "crypto";

function signCookieValue(value: string, secret: string) {
  const signature = createHmac("sha256", secret)
    .update(value)
    .digest("base64");
  return `${value}.${signature}`;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "email"
      }
    });

    if (!account || !account.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, account.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const authCtx = await auth.$context;
    const session = await authCtx.internalAdapter.createSession(user.id);

    const response = NextResponse.json({ user, session });
    
    const secret = process.env.BETTER_AUTH_SECRET || "";
    const signedToken = signCookieValue(session.token, secret);

    response.cookies.set("better-auth.session_token", signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(session.expiresAt)
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
