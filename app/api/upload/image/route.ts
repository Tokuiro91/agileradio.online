import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "images")

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null
        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true })
        }

        const ext = file.name.split(".").pop() ?? "jpg"
        const safeName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`
        const filePath = path.join(UPLOAD_DIR, safeName)

        const arrayBuffer = await file.arrayBuffer()
        fs.writeFileSync(filePath, Buffer.from(arrayBuffer))

        return NextResponse.json({ url: `/uploads/images/${safeName}` })
    } catch (err) {
        console.error("Image upload error:", err)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
