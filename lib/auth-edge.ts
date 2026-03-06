/**
 * Edge-safe auth config for middleware.
 * Must NOT import 'fs', 'path', or any Node.js-only modules.
 * session strategy must match the main auth.ts (jwt).
 */
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { auth } = NextAuth({
    trustHost: true,
    providers: [

        Credentials({
            id: "email-otp",
            name: "Email OTP",
            credentials: {
                email: { label: "Email", type: "email" },
                otp: { label: "Code", type: "text" },
            },
            // authorize is never called from middleware — just need the provider declared
            async authorize() {
                return null
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/admin/login",
        error: "/admin/login",
    },
})
