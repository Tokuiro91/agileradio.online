import { NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/r2"

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null
        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const url = await uploadToR2(file, "audio")
        return NextResponse.json({ url })
    } catch (err) {
        console.error("Audio upload error:", err)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
