/**
 * NextAuth.js v5 configuration for OpenHouse Pro.
 * Supports Email + Password and Google OAuth.
 */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const db = getDb();
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, credentials.email as string))
                    .limit(1);

                if (!user || !user.passwordHash) return null;

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (!isValid) return null;

                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.fullName,
                    image: user.avatarUrl,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                const db = getDb();
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
                        subscriptionTier: "free",
                        pdlCreditsUsed: 0,
                        pdlCreditsLimit: 0,
                        aiQueriesUsed: 0,
                        aiQueriesLimit: 0,
                    });
                } else if (!existing.googleId) {
                    // Link Google account to existing user
                    await db
                        .update(users)
                        .set({ googleId: account.providerAccountId })
                        .where(eq(users.id, existing.id));
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                const db = getDb();
                const [dbUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email!))
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
                session.user.id = token.userId as string;
                session.user.subscriptionTier = token.subscriptionTier as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        newUser: "/register",
    },
    session: {
        strategy: "jwt",
    },
});
