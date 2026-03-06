import { NextResponse } from "next/server"
import { getListeners } from "@/lib/listeners-store"
import { auth } from "@/lib/auth"

export async function GET() {
    const session = await auth()
    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Admins get the full listener list, excluding passwords
    const listeners = getListeners().map(l => {
        const { password, ...safeData } = l
        return safeData
    })

    return NextResponse.json(listeners)
}
