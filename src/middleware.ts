/**
 * NextAuth middleware to protect dashboard routes.
 */
export { auth as middleware } from "@/lib/auth";

export const config = {
    matcher: ["/dashboard/:path*"],
};
