/**
 * User registration API endpoint.
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
    licenseNumber: z.string().optional(),
    brokerageName: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = registerSchema.parse(body);

        const db = getDb();

        // Check if user already exists
        const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1);

        if (existing) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 12);

        // Create user
        const [result] = await db.insert(users).values({
            email: data.email,
            passwordHash,
            fullName: data.fullName,
            phone: data.phone || null,
            licenseNumber: data.licenseNumber || null,
            brokerageName: data.brokerageName || null,
            subscriptionTier: "free",
            pdlCreditsUsed: 0,
            pdlCreditsLimit: 0,
            aiQueriesUsed: 0,
            aiQueriesLimit: 0,
        });

        return NextResponse.json(
            { success: true, userId: result.insertId },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error("[Register] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
