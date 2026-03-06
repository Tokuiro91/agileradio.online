import { auth } from "@/lib/auth-edge"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isLoginPage = req.nextUrl.pathname === "/admin/login"
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")

    if (isAuthRoute) return NextResponse.next()
    if (isLoginPage) return NextResponse.next()

    if (isAdminRoute && !req.auth) {
        return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/admin/:path*"],
}
