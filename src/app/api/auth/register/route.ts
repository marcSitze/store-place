import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
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
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          role: "CUSTOMER"
        }
      });

      await tx.account.create({
        data: {
          id: `acc_${Math.random().toString(36).substr(2, 9)}`,
          userId: newUser.id,
          providerId: "email",
          accountId: email.toLowerCase(),
          password: hashedPassword,
        }
      });

      return newUser;
    });

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
    console.error("Register API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
