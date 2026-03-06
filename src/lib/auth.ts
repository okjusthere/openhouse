/**
 * NextAuth.js v5 configuration for OpenHouse Pro.
 * Supports Google OAuth only.
 */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPlanEntitlements, getNextMonthBoundary } from "@/lib/billing";

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret =
    process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        ...(googleClientId && googleClientSecret
            ? [
                Google({
                    clientId: googleClientId,
                    clientSecret: googleClientSecret,
                }),
            ]
            : []),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                const db = getDb();
                const freeEntitlements = getPlanEntitlements("free");
                const [existing] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email!))
                    .limit(1);

                if (!existing) {
                    // Auto-create user on first Google sign-in
                    await db.insert(users).values({
                        email: user.email!,
                        fullName: user.name || "Agent",
                        avatarUrl: user.image || null,
                        googleId: account.providerAccountId,
                        ...freeEntitlements,
                        pdlCreditsUsed: 0,
                        aiQueriesUsed: 0,
                        usageResetAt: getNextMonthBoundary(),
                    });
                } else {
                    await db
                        .update(users)
                        .set({
                            googleId: existing.googleId || account.providerAccountId,
                            avatarUrl: user.image || existing.avatarUrl,
                            fullName: existing.fullName || user.name || "Agent",
                            usageResetAt: existing.usageResetAt || getNextMonthBoundary(),
                        })
                        .where(eq(users.id, existing.id));
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            const email = user?.email || token.email;

            if (email) {
                const db = getDb();
                const [dbUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                if (dbUser) {
                    token.userId = dbUser.id;
                    token.subscriptionTier = dbUser.subscriptionTier;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id =
                    token.userId !== undefined ? String(token.userId) : "";
                session.user.subscriptionTier = token.subscriptionTier as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
});
